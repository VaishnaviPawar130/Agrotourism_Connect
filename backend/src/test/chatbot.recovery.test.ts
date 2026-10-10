import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type OpenAI from 'openai';
import { classifyIntent } from '../modules/chatbot/chatbot.intent';
import { selectIntentSafeEvidence, selectRelevantEvidence } from '../modules/chatbot/chatbot.evidence';
import { generateChatReply } from '../modules/chatbot/chatbot.service';
import { PUBLIC_KNOWLEDGE } from '../modules/chatbot/publicKnowledge/publicKnowledge.data';

const { create, retrieve } = vi.hoisted(() => ({ create: vi.fn(), retrieve: vi.fn() }));
vi.mock('openai', () => ({ default: class { chat = { completions: { create } }; } }));
vi.mock('../modules/chatbot/retrieval/retrieval.service', () => ({
    retrieveRelevantKnowledge: retrieve,
    retrievePublicServiceKnowledge: async () => [],
    retrievePublicTopicKnowledge: async () => [],
}));
const client = { chat: { completions: { create } } } as unknown as OpenAI;
const completion = (content: string | null, finish_reason = 'stop') => ({ choices: [{ finish_reason, message: { content } }] });
beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('OPENROUTER_API_KEY', 'mock-key');
    vi.stubEnv('OPENROUTER_MODEL', 'openrouter/free');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    retrieve.mockResolvedValue([]);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

const questions = [
    ['What is this project about?', 'ABOUT_SERVICES', 'company:overview'],
    ['How can I contact you?', 'CONTACT', 'contact:email-location'],
    ['How do I register here?', 'LOGIN_AUTH', 'auth:registration'],
    ['How can I invest here?', 'INVESTMENT', 'investment:express-interest'],
    ['What is Knowledge Center here?', 'KNOWLEDGE_CENTER', 'knowledge:center-overview'],
    ['How can I contact someone to invest here?', 'CONTACT', 'contact:enquiry-process'],
] as const;

describe('free provider recovery', () => {
    it.each(questions)('recovers classification and grounded answers for %s', async (question, intent, id) => {
        for (const output of ['', 'CON', null, 'length', 'exception']) {
            create.mockReset();
            if (output === 'exception') create.mockRejectedValueOnce(new Error('offline'));
            else create.mockResolvedValueOnce(completion(output === 'length' ? 'GENERAL' : output, output === 'length' ? 'length' : 'stop'));
            expect(await classifyIntent(question, client, 'openrouter/free')).toBe(intent);
        }
        const record = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === id)!;
        create.mockReset().mockRejectedValue(new Error('offline'));
        retrieve.mockResolvedValue([record]);
        expect(await generateChatReply(question)).toBe(record.content);
        expect(retrieve).toHaveBeenCalledWith(expect.stringContaining(`Intent:\n${intent}`), 5);
        expect(create).toHaveBeenCalledTimes(3);
        expect(create.mock.calls.every(([request]) => request.model === 'openrouter/free')).toBe(true);
    });

    it.each([
        ['register', 'LOGIN_AUTH'], ['sign up', 'LOGIN_AUTH'], ['create account', 'LOGIN_AUTH'],
        ['Any jobs open?', 'JOBS'], ['What are your prices?', 'PRICING'],
        ['Who is the founder?', 'OWNER_FOUNDER'], ['Register for a workshop', 'TRAINING'],
        ['What are the course fees?', 'TRAINING'], ['How do I browse projects?', 'PLATFORM_FEATURES'],
        ['Show me current projects', 'PUBLIC_PROJECTS'],
    ])('recovers website topic: %s', async (question, intent) => {
        create.mockRejectedValue(new Error('offline'));
        expect(await classifyIntent(question, client, 'openrouter/free')).toBe(intent);
    });

    it.each(['', null, 'null', '{bad}', '[0', 'Choose source zero', '[]', 'exception', 'length'])
    ('retains only safe retrieved evidence for selector output %s', async (output) => {
        const contact = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'contact:email-location')!;
        const other = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'company:overview')!;
        if (output === 'exception') create.mockRejectedValue(new Error('offline'));
        else create.mockResolvedValue(completion(output === 'length' ? '[1]' : output, output === 'length' ? 'length' : 'stop'));
        expect(await selectRelevantEvidence('Contact?', 'CONTACT', [contact, other], client, 'openrouter/free')).toEqual([contact]);
    });

    it('honors valid selector indexes', async () => {
        const records = PUBLIC_KNOWLEDGE.filter((item) => item.category === 'CONTACT');
        create.mockResolvedValue(completion('[1]'));
        expect(await selectRelevantEvidence('Contact?', 'CONTACT', records, client, 'openrouter/free')).toEqual([records[1]]);
    });

    it('does not turn navigation/services into listings or sensitive facts', () => {
        for (const intent of ['PUBLIC_PROJECTS', 'JOBS', 'PRICING', 'OWNER_FOUNDER', 'TRAINING'] as const) {
            expect(selectIntentSafeEvidence(intent, PUBLIC_KNOWLEDGE)).toEqual([]);
            expect(selectIntentSafeEvidence(intent, [])).toEqual([]);
        }
    });

    it.each([
        ['PUBLIC_PROJECTS', { sourceType: 'PROJECT', content: 'River Farm project: PLANNING.' }],
        ['JOBS', { category: 'JOBS', content: 'We are hiring a farm manager.' }],
        ['PRICING', { category: 'PRICING', content: 'Consultation fee: INR 500.' }],
        ['OWNER_FOUNDER', { category: 'OWNER_FOUNDER', content: 'Founder: Example Person.' }],
        ['TRAINING', { category: 'TRAINING', content: 'A training workshop runs on June 1.' }],
    ] as const)('accepts explicit retrieved %s records', (intent, record) => {
        expect(selectIntentSafeEvidence(intent, [record])).toEqual([record]);
    });

    it('keeps history through provider failure without using it as evidence', async () => {
        create.mockRejectedValue(new Error('offline'));
        expect(await classifyIntent('What does it contain?', client, 'openrouter/free', ['What is Knowledge Center here?'])).toBe('KNOWLEDGE_CENTER');
        expect(await generateChatReply('What does it contain?', ['Knowledge Center has free courses.'])).toContain("don't have verified Knowledge Center");
    });

    it.each([null, '', 'length', 'exception'])('uses selected text when generation fails: %s', async (output) => {
        const record = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'auth:registration')!;
        retrieve.mockResolvedValue([record]);
        create.mockResolvedValueOnce(completion('LOGIN_AUTH')).mockResolvedValueOnce(completion('[0]'));
        if (output === 'exception') create.mockRejectedValueOnce(new Error('offline'));
        else create.mockResolvedValueOnce(completion(output === 'length' ? 'Incomplete invented answer' : output, output === 'length' ? 'length' : 'stop'));
        expect(await generateChatReply('How do I register here?')).toBe(record.content);
    });
});

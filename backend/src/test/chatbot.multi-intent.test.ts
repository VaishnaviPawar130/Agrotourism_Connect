import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detectCompanyQuestions } from '../modules/chatbot/chatbot.intent';
import { generateChatReply } from '../modules/chatbot/chatbot.service';
import { intentFallback } from '../modules/chatbot/chatbot.fallback';
import { PUBLIC_KNOWLEDGE } from '../modules/chatbot/publicKnowledge/publicKnowledge.data';

const { create, retrieve } = vi.hoisted(() => ({ create: vi.fn(), retrieve: vi.fn() }));
vi.mock('openai', () => ({ default: class { chat = { completions: { create } }; } }));
vi.mock('../modules/chatbot/retrieval/retrieval.service', () => ({
    retrieveRelevantKnowledge: retrieve,
    retrievePublicServiceKnowledge: async () => [],
    retrievePublicTopicKnowledge: async () => [],
}));
beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('OPENROUTER_API_KEY', 'mock-key');
    vi.stubEnv('OPENROUTER_MODEL', 'mock-model');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    create.mockRejectedValue(new Error('offline'));
    retrieve.mockResolvedValue(PUBLIC_KNOWLEDGE);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe('multiple explicit company questions', () => {
    it.each([
        ['how can i invest here in this project or what is the current job opportunities available?', ['INVESTMENT', 'JOBS']],
        ['How can I invest here and are there any jobs?', ['INVESTMENT', 'JOBS']],
        ['How can I invest here or are there any vacancies?', ['INVESTMENT', 'JOBS']],
        ['Tell me about investment and job opportunities.', ['INVESTMENT', 'JOBS']],
        ['How can I invest here and are there any current job openings?', ['INVESTMENT', 'JOBS']],
        ['How can I contact you and how do I register?', ['CONTACT', 'LOGIN_AUTH']],
        ['Tell me about this project and Knowledge Center', ['ABOUT_SERVICES', 'KNOWLEDGE_CENTER']],
        ['Tell me about the project and Knowledge Center', ['ABOUT_SERVICES', 'KNOWLEDGE_CENTER']],
        ['how can i invest here in this project and also tell me about current job openings if available?', ['INVESTMENT', 'JOBS']],
        ['Contact you; register; any jobs; prices?', ['CONTACT', 'LOGIN_AUTH', 'JOBS']],
    ])('detects distinct intents: %s', (message, intents) => {
        expect(detectCompanyQuestions(message as string).map((part) => part.intent)).toEqual(intents);
    });

    it.each([
        'How can I contact someone to invest here?',
        'How do I register for a workshop?',
        'Tell me about training and fees',
        'How do I browse and filter projects?',
        'What is the email and phone?',
        'Tell me about React and jobs',
        'How can I invest here?',
        'How can I contact you or email you?',
        'Are there any jobs or vacancies?',
        'How do I register as a Landowner or Investor?',
    ])('keeps the single-intent path for %s', (message) => {
        expect(detectCompanyQuestions(message)).toEqual([]);
    });

    it.each(['and', 'or', 'also', 'along with', 'as well as'])(
        'detects distinct topics separated by %s', (connector) => {
            expect(detectCompanyQuestions(`How can I invest here ${connector} what jobs are available?`)
                .map((part) => part.intent)).toEqual(['INVESTMENT', 'JOBS']);
        },
    );

    it.each([
        'How can I invest here and are there any current job openings?',
        'how can i invest here in this project or what is the current job opportunities available?',
    ])('answers investment and uses the jobs fallback without inventing openings: %s', async (message) => {
        retrieve.mockResolvedValue([PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'investment:express-interest')!]);
        const reply = await generateChatReply(message);
        expect(reply).toContain('Investment:\n');
        expect(reply).toContain(PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'investment:express-interest')!.content);
        expect(reply).toContain(`Jobs:\n${intentFallback('are there any current job openings', 'JOBS')}`);
        expect(retrieve).toHaveBeenCalledTimes(2);
        expect(retrieve.mock.calls[0][0]).toContain('Intent:\nINVESTMENT');
        expect(retrieve.mock.calls[0][0]).not.toContain('job openings');
        expect(retrieve.mock.calls[1][0]).toContain('Intent:\nJOBS');
    });

    it('continues answering other sections when one retrieval fails', async () => {
        const record = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'auth:registration')!;
        retrieve.mockRejectedValueOnce(new Error('unavailable')).mockResolvedValueOnce([record]);
        const reply = await generateChatReply('How can I contact you and how do I register?');
        expect(reply).toBe(`Contact:\n${intentFallback('How can I contact you', 'CONTACT')}\n\nLogin Auth:\n${record.content}`);
    });

    it('deduplicates requests and answers at most three distinct intents', async () => {
        retrieve.mockResolvedValue([]);
        const reply = await generateChatReply('Contact you and email you; register; any jobs; prices?');
        expect(retrieve).toHaveBeenCalledTimes(3);
        expect(reply.match(/Contact:/g)).toHaveLength(1);
        expect(reply).toContain('Login Auth:');
        expect(reply).toContain('Jobs:');
        expect(reply).not.toContain('Pricing:');
    });

    it.each([
        ['How can I contact you and how do I register?', 'Contact', 'Login Auth', 'contact:email-location', 'auth:registration'],
        ['Tell me about this project and Knowledge Center', 'About Services', 'Knowledge Center', 'company:overview', 'knowledge:center-overview'],
    ])('answers each supported section during provider failure: %s', async (message, first, second, firstId, secondId) => {
        const records = [firstId, secondId].map((id) => PUBLIC_KNOWLEDGE.find((item) => item.sourceId === id)!);
        retrieve.mockResolvedValue(records);
        expect(await generateChatReply(message)).toBe(`${first}:\n${records[0].content}\n\n${second}:\n${records[1].content}`);
    });

    it('uses separate semantic selection and generation for each part', async () => {
        const records = ['contact:email-location', 'auth:registration'].map((id) => PUBLIC_KNOWLEDGE.find((item) => item.sourceId === id)!);
        retrieve.mockResolvedValueOnce([records[0]]).mockResolvedValueOnce([records[1]]);
        const completion = (content: string) => ({ choices: [{ message: { content } }] });
        create.mockResolvedValueOnce(completion('[0]')).mockResolvedValueOnce(completion('Verified contact answer.'))
            .mockResolvedValueOnce(completion('[0]')).mockResolvedValueOnce(completion('Verified registration answer.'));
        expect(await generateChatReply('How can I contact you and how do I register?'))
            .toBe('Contact:\nVerified contact answer.\n\nLogin Auth:\nVerified registration answer.');
        expect(create.mock.calls[1][0].messages[0].content).not.toContain(records[1].content);
        expect(create.mock.calls[3][0].messages[0].content).not.toContain(records[0].content);
        for (const index of [1, 3]) {
            const prompt = create.mock.calls[index][0].messages[0].content;
            expect(prompt).toContain('1 to 3 sentences');
            expect(prompt).toContain('keep each section independently short');
            expect(prompt).toContain('Do not restate section headings');
        }
    });

    it('keeps history as context and cannot use it as factual evidence', async () => {
        retrieve.mockResolvedValue([]);
        const reply = await generateChatReply('What does this project do and what are its prices?', ['The price is INR 500.']);
        expect(retrieve.mock.calls[1][0]).toContain('context only, not evidence');
        expect(reply).toContain(intentFallback('what are its prices', 'PRICING'));
        expect(reply).not.toContain('500');
    });

    it.each(['current projects', 'job openings', 'prices', 'owner'])('does not reuse contact evidence for %s', async (topic) => {
        retrieve.mockResolvedValue([PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'contact:email-location')!]);
        const message = `How can I contact you and tell me about ${topic}?`;
        const parts = detectCompanyQuestions(message);
        expect(parts).toHaveLength(2);
        const reply = await generateChatReply(message);
        expect(reply).toContain(intentFallback(parts[1].question, parts[1].intent));
    });
});

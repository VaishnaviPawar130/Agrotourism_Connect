import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type OpenAI from 'openai';
import { generateChatReply } from '../modules/chatbot/chatbot.service';
import { synthesizeEvidence, CHATBOT_RESPONSE_STYLE } from '../modules/chatbot/chatbot.response';
import { PUBLIC_KNOWLEDGE } from '../modules/chatbot/publicKnowledge/publicKnowledge.data';

const { create, retrieve } = vi.hoisted(() => ({
    create: vi.fn(),
    retrieve: vi.fn(),
}));

vi.mock('openai', () => ({
    default: class {
        chat = { completions: { create } };
    },
}));

vi.mock('../modules/chatbot/retrieval/retrieval.service', () => ({
    retrieveRelevantKnowledge: retrieve,
    retrievePublicServiceKnowledge: async () => [],
    retrievePublicTopicKnowledge: async () => [],
}));

const completion = (content: string | null) => ({
    choices: [{ message: { content } }],
});

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('OPENROUTER_API_KEY', 'mock-key');
    vi.stubEnv('OPENROUTER_MODEL', 'mock-model');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    retrieve.mockResolvedValue([]);
    create.mockRejectedValue(new Error('offline'));
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
});

describe('Response Quality & Synthesis Layer (Chatbase / Lyro Style)', () => {
    // 1. "What is this project about?" -> one concise synthesized paragraph
    it('1. synthesizes "What is this project about?" into one concise paragraph', async () => {
        const records = [
            PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'company:overview')!,
            PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'service:core-services')!,
        ];
        retrieve.mockResolvedValue(records);

        // When provider generation succeeds:
        create.mockResolvedValueOnce(completion('ABOUT_SERVICES'))
            .mockResolvedValueOnce(completion('[0, 1]'))
            .mockResolvedValueOnce(
                completion(
                    'Agrotourism Connect is a platform guiding the complete journey of turning land into a tourism destination. It connects landowners, investors, and developers to plan, build, and operate sustainable agro tourism projects.'
                )
            );

        const reply = await generateChatReply('What is this project about?');
        expect(reply).not.toContain('\n\n');
        expect(reply).toContain('Agrotourism Connect is a platform');
        const sentenceCount = (reply.match(/[.?!]+/g) || []).length;
        expect(sentenceCount).toBeLessThanOrEqual(3);
        const wordCount = reply.split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(60);
    });

    // 2. "How can I contact you?" -> direct contact answer, no repeated records
    it('2. answers "How can I contact you?" with direct contact method first and no repeated records', async () => {
        const emailRecord = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'contact:email-location')!;
        const formRecord = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'contact:enquiry-process')!;
        retrieve.mockResolvedValue([emailRecord, formRecord]);

        create.mockResolvedValueOnce(completion('CONTACT'))
            .mockResolvedValueOnce(completion('[0, 1]'))
            .mockResolvedValueOnce(
                completion(
                    'You can contact Agrotourism Connect through the website contact form or at info@agrotourismconnect.com.'
                )
            );

        const reply = await generateChatReply('How can I contact you?');
        expect(reply).toMatch(/^You can contact Agrotourism Connect/i);
        expect(reply).toContain('info@agrotourismconnect.com');
        expect(reply).not.toContain('Record 1');
        expect(reply).not.toContain('\n\n');
    });

    // 3. "How can I invest here?" -> short process + one necessary caveat
    it('3. answers "How can I invest here?" with short process first and one necessary caveat', async () => {
        const investRecord = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'investment:express-interest')!;
        const serviceRecord = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'service:investor-facilitation')!;
        retrieve.mockResolvedValue([investRecord, serviceRecord]);

        create.mockResolvedValueOnce(completion('INVESTMENT'))
            .mockResolvedValueOnce(completion('[0, 1]'))
            .mockResolvedValueOnce(
                completion(
                    'You can register or sign in as an Investor, browse published Investment Opportunities, and submit your interest from the dashboard. Availability and returns are not guaranteed and require independent due diligence.'
                )
            );

        const reply = await generateChatReply('How can I invest here?');
        expect(reply).toMatch(/^You can (?:register|sign in)/i);
        expect(reply).toContain('not guaranteed');
        // Ensure the caveat is not repeated multiple times
        const caveatMatches = reply.match(/not guaranteed/gi) || [];
        expect(caveatMatches.length).toBe(1);
    });

    // 4. "How do I sign in as an investor?" -> login instructions first, investor context second
    it('4. answers "How do I sign in as an investor?" with login instructions first and investor context second', async () => {
        const loginRecord = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'auth:login')!;
        const regRecord = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'auth:registration')!;
        retrieve.mockResolvedValue([loginRecord, regRecord]);

        create.mockResolvedValueOnce(completion('LOGIN_AUTH'))
            .mockResolvedValueOnce(completion('[0, 1]'))
            .mockResolvedValueOnce(
                completion(
                    'You can sign in at /login using your registered email and password, or register as an Investor under "I am a" to access published investment opportunities.'
                )
            );

        const reply = await generateChatReply('How do I sign in as an investor?');
        expect(reply).toMatch(/^You can sign in/i);
        expect(reply).toContain('Investor');
    });

    // 5. "Who is the owner and how can I contact you?" -> two concise parts, owner remains unverified, contact answered
    it('5. answers "Who is the owner and how can I contact you?" with two concise sections, owner unverified, and contact answered', async () => {
        const contactRecord = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'contact:email-location')!;
        // Owner returns no verified records, contact returns contactRecord
        retrieve.mockResolvedValue([contactRecord]);

        create.mockRejectedValue(new Error('offline'));

        const reply = await generateChatReply('Who is the owner and how can I contact you?');
        expect(reply).toContain('Owner Founder:\nVerified owner or founder information is not currently available.');
        expect(reply).toContain('Contact:\n');
        expect(reply).toContain('info@agrotourismconnect.com');
        // Neither section contains shared redundant background
        expect(reply).not.toContain('Agrotourism Connect aims to simplify');
    });

    // 6. Provider failure / 429 -> concise deterministic synthesis, NOT raw evidence concatenation
    it('6. produces a concise deterministic synthesis upon provider failure / 429 when multiple records exist, NOT raw concatenation', async () => {
        const records = [
            PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'investment:express-interest')!,
            PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'service:investor-facilitation')!,
        ];

        // Direct test of synthesizeEvidence
        const synthesized = synthesizeEvidence('How can I invest?', 'INVESTMENT', records, ['INVESTOR']);
        expect(synthesized).not.toContain('\n\n');
        expect(synthesized).toContain('Investment Opportunities');
        expect(synthesized).toContain('not guaranteed');
        // Does not repeat boilerplate
        expect(synthesized).not.toContain('This is a service description');
        expect(synthesized).not.toContain('This describes account features');
        const wordCount = synthesized.split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(60);

        // Also test through generateChatReply with provider throwing 429
        retrieve.mockResolvedValue(records);
        create.mockResolvedValueOnce(completion('INVESTMENT'))
            .mockResolvedValueOnce(completion('[0, 1]'))
            .mockRejectedValueOnce({ status: 429, message: 'rate limit' });

        const reply = await generateChatReply('How can I invest?');
        expect(reply).not.toContain('\n\n');
        expect(reply).toContain('Investment Opportunities');
        expect(reply).toContain('not guaranteed');
    });

    // 7. "What services do you provide?" -> short service summary, no repeated platform overview
    it('7. summarizes "What services do you provide?" into a concise service summary without repeating platform overview', async () => {
        const serviceRecord = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'service:core-services')!;
        const overviewRecord = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'company:overview')!;
        retrieve.mockResolvedValue([serviceRecord, overviewRecord]);

        create.mockResolvedValueOnce(completion('ABOUT_SERVICES'))
            .mockResolvedValueOnce(completion('[0, 1]'))
            .mockResolvedValueOnce(
                completion(
                    'Agrotourism Connect provides end-to-end services including Land Advisory, Project Planning, Resort Development, statutory approvals, and operations support.'
                )
            );

        const reply = await generateChatReply('What services do you provide?');
        expect(reply).toContain('Land Advisory');
        expect(reply).toContain('Resort Development');
        expect(reply).not.toContain('\n\n');
        const wordCount = reply.split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(60);
    });

    it('synthesizes multiple records deterministically for ABOUT_SERVICES upon provider failure', () => {
        const records = [
            PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'service:core-services')!,
            PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'company:overview')!,
        ];
        const synthesized = synthesizeEvidence('What services do you provide?', 'ABOUT_SERVICES', records);
        expect(synthesized).toContain('Land Advisory');
        expect(synthesized).not.toContain('\n\n');
        expect(synthesized.split(/\s+/).length).toBeLessThanOrEqual(60);
    });

    it('embeds Chatbase/Lyro core principles into CHATBOT_RESPONSE_STYLE', () => {
        expect(CHATBOT_RESPONSE_STYLE).toContain('DIRECT ANSWER FIRST');
        expect(CHATBOT_RESPONSE_STYLE).toContain('SYNTHESIZE MULTIPLE SOURCES');
        expect(CHATBOT_RESPONSE_STYLE).toContain('1 to 3 sentences');
        expect(CHATBOT_RESPONSE_STYLE).toContain('under 60 words');
        expect(CHATBOT_RESPONSE_STYLE).toContain('about 80 words');
    });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type OpenAI from 'openai';
import {
    analyzeMessage,
    classifyIntent,
    detectContexts,
    extractEntities,
    resolveUnknownIntent,
} from '../modules/chatbot/chatbot.intent';
import { detectCompanyQuestions } from '../modules/chatbot/chatbot.detection';
import { generateChatReply } from '../modules/chatbot/chatbot.service';
import { retrieveIntentKnowledge } from '../modules/chatbot/chatbot.retrieval';
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

const client = {
    chat: { completions: { create } },
} as unknown as OpenAI;

const completion = (content: string | null, finish_reason = 'stop') => ({
    choices: [{ finish_reason, message: { content } }],
});

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('OPENROUTER_API_KEY', 'mock-key');
    vi.stubEnv('OPENROUTER_MODEL', 'openrouter/free');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    create.mockRejectedValue(new Error('offline'));
    retrieve.mockResolvedValue(PUBLIC_KNOWLEDGE);
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
});

describe('Phase Regression Tests: Structured Understanding (Action + Context + Multi-intent)', () => {
    // 1. "How do I sign in as an investor?" -> LOGIN_AUTH + INVESTOR context
    it('1. classifies "How do I sign in as an investor?" as LOGIN_AUTH with INVESTOR context', () => {
        const message = 'How do I sign in as an investor?';
        const structured = analyzeMessage(message);

        expect(structured.action).toBe('LOGIN_AUTH');
        expect(structured.actions).toEqual(['LOGIN_AUTH']);
        expect(structured.contexts).toContain('INVESTOR');
        expect(resolveUnknownIntent(message)).toBe('LOGIN_AUTH');
    });

    // 2. "signin as investor" -> LOGIN_AUTH + INVESTOR
    it('2. classifies "signin as investor" as LOGIN_AUTH with INVESTOR context', () => {
        const message = 'signin as investor';
        const structured = analyzeMessage(message);

        expect(structured.action).toBe('LOGIN_AUTH');
        expect(structured.actions).toEqual(['LOGIN_AUTH']);
        expect(structured.contexts).toContain('INVESTOR');
        expect(resolveUnknownIntent(message)).toBe('LOGIN_AUTH');
    });

    it.each([
        'sign in as an investor',
        'sign-in as investor',
        'signin as investor',
        'login as investor',
        'log-in as investor',
        'log in as investor',
        'sign in as a landowner',
        'register as landowner',
    ])('normalizes sign-in / login generic forms without being hijacked by role context: %s', (query) => {
        const structured = analyzeMessage(query);
        expect(structured.action).toBe('LOGIN_AUTH');
        expect(resolveUnknownIntent(query)).toBe('LOGIN_AUTH');
    });

    // 3. "I have 2 acres of land. How can I develop it for tourism?" -> land/tourism context with correct primary action
    it('3. analyzes "I have 2 acres of land. How can I develop it for tourism?" with correct primary action, contexts, and entity', () => {
        const message = 'I have 2 acres of land. How can I develop it for tourism?';
        const structured = analyzeMessage(message);

        expect(structured.action).toBe('GENERAL_TOURISM');
        expect(structured.contexts).toContain('LANDOWNER');
        expect(structured.contexts).toContain('LAND');
        expect(structured.contexts).toContain('TOURISM');
        expect(structured.entities?.landSize).toBe('2 acres');
        expect(resolveUnknownIntent(message)).toBe('GENERAL_TOURISM');
    });

    it('extracts entities safely across common land units', () => {
        expect(extractEntities('I have 5 acres of land').landSize).toBe('5 acres');
        expect(extractEntities('We own 10 gunthas in Pune').landSize).toBe('10 gunthas');
        expect(extractEntities('Plot is 1.5 hectares').landSize).toBe('1.5 hectares');
        expect(extractEntities('Hello there').landSize).toBeUndefined();
    });

    // 4. "What is land development and how can I invest?" -> GENERAL_TOURISM + INVESTMENT both preserved
    it('4. preserves both GENERAL_TOURISM and INVESTMENT for "What is land development and how can I invest?"', async () => {
        const message = 'What is land development and how can I invest?';
        const parts = detectCompanyQuestions(message);

        expect(parts).toHaveLength(2);
        expect(parts.map((p) => p.intent)).toEqual(['GENERAL_TOURISM', 'INVESTMENT']);

        // Test in full orchestration
        const reply = await generateChatReply(message);
        expect(reply).toContain('General Tourism:');
        expect(reply).toContain('Investment:');
        expect(reply).toContain('Agro tourism development usually starts with evaluating');
    });

    // 5. Previous: "How can I invest?" Current: "How do I register?" -> LOGIN_AUTH, not INVESTMENT
    it('5. prioritizes explicit current question (LOGIN_AUTH) over stale history (INVESTMENT)', async () => {
        const history = ['How can I invest?'];
        const currentMessage = 'How do I register?';

        // Deterministic recovery
        expect(resolveUnknownIntent(currentMessage, history)).toBe('LOGIN_AUTH');

        const structured = analyzeMessage(currentMessage, history);
        expect(structured.action).toBe('LOGIN_AUTH');

        // LLM classifier with history
        create.mockResolvedValueOnce(completion('LOGIN_AUTH'));
        const intent = await classifyIntent(currentMessage, client, 'openrouter/free', history);
        expect(intent).toBe('LOGIN_AUTH');

        // Even if LLM erroneously returned INVESTMENT due to history prompt, current explicit action overrides
        create.mockResolvedValueOnce(completion('INVESTMENT'));
        const recoveredIntent = await classifyIntent(currentMessage, client, 'openrouter/free', history);
        expect(recoveredIntent).toBe('LOGIN_AUTH');
    });

    // 6. GENERAL_TOURISM provider failure -> useful tourism fallback, not generic error
    it('6. returns useful tourism fallback on GENERAL_TOURISM provider failure, not generic error', async () => {
        create.mockRejectedValue(new Error('offline'));
        const reply = await generateChatReply('What is agro tourism?');

        expect(reply).toBe(
            'Agro tourism development usually starts with evaluating the land, access, target visitors, activities, stay options, food, permissions and feasibility.'
        );
        expect(reply).not.toContain('unable to provide a response');
        expect(reply).not.toContain('temporarily unavailable');
        expect(reply).not.toContain('usage limit');
    });

    it('enriches retrieval query with contexts without overriding primary action', async () => {
        retrieve.mockResolvedValue([]);
        await retrieveIntentKnowledge('How do I sign in as an investor?', 'LOGIN_AUTH', ['INVESTOR']);

        expect(retrieve).toHaveBeenCalledTimes(1);
        const query = retrieve.mock.calls[0][0];
        expect(query).toContain('Intent:\nLOGIN_AUTH');
        expect(query).toContain('Context / Role:\nINVESTOR');
        expect(query).toContain('platform login, account access');
    });
});

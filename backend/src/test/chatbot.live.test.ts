import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type OpenAI from 'openai';
import {
    analyzeMessage,
    detectDataSource,
    resolveUnknownIntent,
} from '../modules/chatbot/chatbot.intent';
import {
    getLivePublicProjectsAnswer,
    getLiveInvestmentOpportunitiesAnswer,
    getLiveVacanciesAnswer,
    handleLiveQuery,
} from '../modules/chatbot/chatbot.live';
import { generateChatReply } from '../modules/chatbot/chatbot.service';

const { listProjectsMock, listPublicVacanciesMock, createCompletionMock, retrieveMock } = vi.hoisted(() => ({
    listProjectsMock: vi.fn(),
    listPublicVacanciesMock: vi.fn(),
    createCompletionMock: vi.fn(),
    retrieveMock: vi.fn(),
}));

vi.mock('../modules/projects/project.service', () => ({
    listProjects: listProjectsMock,
}));

vi.mock('../modules/careers/vacancy.service', () => ({
    listPublicVacancies: listPublicVacanciesMock,
}));

vi.mock('openai', () => ({
    default: class {
        chat = { completions: { create: createCompletionMock } };
    },
}));

vi.mock('../modules/chatbot/retrieval/retrieval.service', () => ({
    retrieveRelevantKnowledge: retrieveMock,
    retrievePublicServiceKnowledge: async () => [],
    retrievePublicTopicKnowledge: async () => [],
}));

const completion = (content: string | null) => ({
    choices: [{ message: { content } }],
});

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('OPENROUTER_API_KEY', 'mock-key');
    vi.stubEnv('OPENROUTER_MODEL', 'openrouter/free');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    listProjectsMock.mockResolvedValue({ items: [], total: 0 });
    listPublicVacanciesMock.mockResolvedValue({ items: [], total: 0 });
    retrieveMock.mockResolvedValue([]);
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
});

describe('1. Data Source Classification (STATIC_RAG vs LIVE_DATA)', () => {
    describe('Static RAG classification', () => {
        it.each([
            ['What is Agrotourism Connect?', 'ABOUT_SERVICES'],
            ['What services do you provide?', 'ABOUT_SERVICES'],
            ['How does investment work?', 'INVESTMENT'],
            ['How can I invest here?', 'INVESTMENT'],
            ['What is the investment process?', 'INVESTMENT'],
            ['Do you have any openings?', 'JOBS'],
            ['How do I apply for jobs?', 'JOBS'],
            ['How do I sign in as an investor?', 'LOGIN_AUTH'],
            ['Who founded this platform?', 'OWNER_FOUNDER'],
            ['What is React?', 'GENERAL'],
            ['what type of projects do you do', 'ABOUT_SERVICES'],
        ] as const)('classifies "%s" as STATIC_RAG / STATIC', (question, intent) => {
            const result = detectDataSource(question, intent);
            expect(result.dataSource).toBe('STATIC_RAG');
            expect(result.freshness).toBe('STATIC');

            const structured = analyzeMessage(question);
            expect(structured.dataSource).toBe('STATIC_RAG');
            expect(structured.freshness).toBe('STATIC');
        });

        it('ensures freshness terms alone do not trigger live data for non-live entities', () => {
            expect(detectDataSource('what is your current contact info right now', 'CONTACT')).toEqual({
                dataSource: 'STATIC_RAG',
                freshness: 'STATIC',
            });
            expect(detectDataSource('what is the current website purpose now', 'ABOUT_SERVICES')).toEqual({
                dataSource: 'STATIC_RAG',
                freshness: 'STATIC',
            });
        });
    });

    describe('Live Data classification', () => {
        it.each([
            ['What projects are available now?', 'PUBLIC_PROJECTS'],
            ['what are the current ongoing projects', 'PUBLIC_PROJECTS'],
            ['which projects are active', 'PUBLIC_PROJECTS'],
            ['What are the current projects open for investment?', 'INVESTMENT'],
            ['Are there any current vacancies?', 'JOBS'],
            ['Are there current vacancies', 'JOBS'],
            ['What vacancies are available right now?', 'JOBS'],
            ['What are the current investment project names?', 'INVESTMENT'],
            ['available investment opportunities', 'INVESTMENT'],
            ['What projects are listed right now?', 'PUBLIC_PROJECTS'],
            ['open vacancies available now', 'JOBS'],
        ] as const)('classifies "%s" as LIVE_DATA / LIVE', (question, intent) => {
            const result = detectDataSource(question, intent);
            expect(result.dataSource).toBe('LIVE_DATA');
            expect(result.freshness).toBe('LIVE');
        });

        it('correctly resolves intent for ongoing and active projects', () => {
            expect(resolveUnknownIntent('what are the current ongoing projects')).toBe('PUBLIC_PROJECTS');
            expect(resolveUnknownIntent('which projects are active')).toBe('PUBLIC_PROJECTS');
            expect(resolveUnknownIntent('what type of projects do you do')).toBe('ABOUT_SERVICES');
        });
    });
});

describe('2. Current Public Projects (Live Data)', () => {
    it('returns formatted public projects when records exist in database', async () => {
        listProjectsMock.mockResolvedValue({
            items: [
                {
                    projectName: 'Project A',
                    projectType: 'Wellness Resort',
                    location: 'Pune',
                    isPublic: true,
                    internalNotes: 'SECRET_DO_NOT_EXPOSE',
                },
                {
                    projectName: 'Project B',
                    projectType: 'Tourism Plotting',
                    location: 'Gujarat',
                    isPublic: true,
                    adminFee: 50000,
                },
            ],
            total: 2,
        });

        const answer = await getLivePublicProjectsAnswer();

        expect(answer).toContain('Current published projects include:');
        expect(answer).toContain('• Project A — Wellness Resort, Pune');
        expect(answer).toContain('• Project B — Tourism Plotting, Gujarat');
        expect(answer).not.toContain('SECRET_DO_NOT_EXPOSE');
        expect(answer).not.toContain('50000');
        expect(listProjectsMock).toHaveBeenCalledWith({ publicOnly: true, limit: 10 });
    });

    it('returns verified empty message when no public projects exist', async () => {
        listProjectsMock.mockResolvedValue({ items: [], total: 0 });

        const answer = await getLivePublicProjectsAnswer();

        expect(answer).toBe('There are currently no verified published projects available.');
    });

    it('returns null when database query throws to preserve failure vs no-records distinction', async () => {
        listProjectsMock.mockRejectedValue(new Error('db connection lost'));

        const answer = await getLivePublicProjectsAnswer();

        expect(answer).toBeNull();
    });
});

describe('3. Current Investment Opportunities (Live Data)', () => {
    it('returns real records first followed by investor next steps and due diligence notice', async () => {
        listProjectsMock.mockResolvedValue({
            items: [
                {
                    projectName: 'Sahyadri Agro Retreat',
                    projectType: 'Resort Development',
                    location: 'Mahabaleshwar',
                    isPublic: true,
                },
            ],
            total: 1,
        });

        const answer = await getLiveInvestmentOpportunitiesAnswer();

        expect(answer).toContain('Current projects open for investment include:');
        expect(answer).toContain('• Sahyadri Agro Retreat — Resort Development, Mahabaleshwar');
        expect(answer).toContain('register or sign in as an investor');
        expect(answer).toContain('due diligence');
    });

    it('returns helpful empty state when no investment opportunities exist', async () => {
        listProjectsMock.mockResolvedValue({ items: [], total: 0 });

        const answer = await getLiveInvestmentOpportunitiesAnswer();

        expect(answer).toContain('no verified published projects open for investment');
        expect(answer).toContain('register as an investor');
    });

    it('returns null on database query failure to distinguish from zero records', async () => {
        listProjectsMock.mockRejectedValue(new Error('db error'));

        const answer = await getLiveInvestmentOpportunitiesAnswer();

        expect(answer).toBeNull();
    });
});

describe('4. Current Jobs / Careers (Live Data)', () => {
    it('returns active published vacancies from career service', async () => {
        listPublicVacanciesMock.mockResolvedValue({
            items: [
                {
                    title: 'Full Stack Developer',
                    department: 'Engineering',
                    location: 'Pune',
                },
                {
                    title: 'Tourism Coordinator',
                    department: 'Operations',
                    location: 'Nashik',
                },
            ],
            total: 2,
        });

        const answer = await getLiveVacanciesAnswer();

        expect(answer).toContain('Yes. Current openings include:');
        expect(answer).toContain('• Full Stack Developer (Engineering)');
        expect(answer).toContain('• Tourism Coordinator (Operations)');
        expect(answer).toContain('Careers page');
        expect(listPublicVacanciesMock).toHaveBeenCalledWith({ limit: 10 });
    });

    it('returns verified empty message when no active openings exist', async () => {
        listPublicVacanciesMock.mockResolvedValue({ items: [], total: 0 });

        const answer = await getLiveVacanciesAnswer();

        expect(answer).toBe('There are currently no verified active job openings.');
    });

    it('returns null on careers query failure to distinguish from zero records', async () => {
        listPublicVacanciesMock.mockRejectedValue(new Error('db error'));

        const answer = await getLiveVacanciesAnswer();

        expect(answer).toBeNull();
    });
});

describe('5. Orchestration & Routing Layer', () => {
    it('routes "What projects are available now?" directly to live database service', async () => {
        createCompletionMock.mockResolvedValueOnce(completion('PUBLIC_PROJECTS'));
        listProjectsMock.mockResolvedValue({
            items: [
                {
                    projectName: 'Project A',
                    projectType: 'Wellness Resort',
                    location: 'Pune',
                },
            ],
            total: 1,
        });

        const reply = await generateChatReply('What projects are available now?');

        expect(reply).toContain('Current published projects include:');
        expect(reply).toContain('• Project A — Wellness Resort, Pune');
        expect(listProjectsMock).toHaveBeenCalledTimes(1);
        expect(retrieveMock).not.toHaveBeenCalled();
    });

    it('routes "what are the current ongoing projects" to live projects', async () => {
        createCompletionMock.mockResolvedValueOnce(completion('PUBLIC_PROJECTS'));
        listProjectsMock.mockResolvedValue({
            items: [
                {
                    projectName: 'Ongoing Resort',
                    projectType: 'Agro Tourism',
                    location: 'Nashik',
                },
            ],
            total: 1,
        });

        const reply = await generateChatReply('what are the current ongoing projects');

        expect(reply).toContain('Current published projects include:');
        expect(reply).toContain('• Ongoing Resort — Agro Tourism, Nashik');
        expect(listProjectsMock).toHaveBeenCalledTimes(1);
        expect(retrieveMock).not.toHaveBeenCalled();
    });

    it('routes "which projects are active" to live projects', async () => {
        createCompletionMock.mockResolvedValueOnce(completion('PUBLIC_PROJECTS'));
        listProjectsMock.mockResolvedValue({
            items: [
                {
                    projectName: 'Active Farmstay',
                    projectType: 'Resort Development',
                    location: 'Kolhapur',
                },
            ],
            total: 1,
        });

        const reply = await generateChatReply('which projects are active');

        expect(reply).toContain('Current published projects include:');
        expect(reply).toContain('• Active Farmstay — Resort Development, Kolhapur');
        expect(listProjectsMock).toHaveBeenCalledTimes(1);
        expect(retrieveMock).not.toHaveBeenCalled();
    });

    it('routes "what type of projects do you do" to STATIC_RAG without calling live project DB', async () => {
        createCompletionMock.mockResolvedValueOnce(completion('ABOUT_SERVICES'));
        retrieveMock.mockResolvedValue([
            {
                title: 'Services Overview',
                content: 'We develop farmstays, agro-resorts, and tourism masterplans for landowners.',
            },
        ]);
        createCompletionMock.mockResolvedValueOnce(completion('[0]'));
        createCompletionMock.mockResolvedValueOnce(
            completion('We develop farmstays, agro-resorts, and tourism masterplans for landowners.')
        );

        const reply = await generateChatReply('what type of projects do you do');

        expect(reply).toContain('We develop farmstays, agro-resorts, and tourism masterplans');
        expect(retrieveMock).toHaveBeenCalled();
        expect(listProjectsMock).not.toHaveBeenCalled();
    });

    it('routes mixed multi-intent "What projects are available now and how can I invest?" independently', async () => {
        listProjectsMock.mockResolvedValue({
            items: [
                {
                    projectName: 'Project Alpha',
                    projectType: 'Eco Resort',
                    location: 'Pune',
                },
            ],
            total: 1,
        });
        retrieveMock.mockResolvedValue([
            {
                title: 'Investment Guide',
                content: 'Investors must complete registration and sign mutual agreements.',
            },
        ]);
        createCompletionMock.mockResolvedValueOnce(completion('[0]'));
        createCompletionMock.mockResolvedValueOnce(
            completion('Investors must complete registration and sign mutual agreements.')
        );

        const reply = await generateChatReply('What projects are available now and how can I invest?');

        // Part 1 is LIVE_DATA
        expect(reply).toContain('Public Projects:\n');
        expect(reply).toContain('• Project Alpha — Eco Resort, Pune');
        expect(listProjectsMock).toHaveBeenCalledTimes(1);

        // Part 2 is STATIC_RAG
        expect(reply).toContain('Investment:\n');
        expect(reply).toContain('Investors must complete registration and sign mutual agreements.');
        expect(retrieveMock).toHaveBeenCalledTimes(1);
    });

    it('routes mixed multi-intent "Are there current vacancies and how can I contact you?" independently', async () => {
        listPublicVacanciesMock.mockResolvedValue({
            items: [
                {
                    title: 'Full Stack Engineer',
                    department: 'Tech',
                },
            ],
            total: 1,
        });
        retrieveMock.mockResolvedValue([
            {
                title: 'Contact Information',
                content: 'You can reach us at info@agrotourismconnect.com or phone +91-9876543210.',
            },
        ]);
        createCompletionMock.mockResolvedValueOnce(completion('[0]'));
        createCompletionMock.mockResolvedValueOnce(
            completion('You can reach us at info@agrotourismconnect.com or phone +91-9876543210.')
        );

        const reply = await generateChatReply('Are there current vacancies and how can I contact you?');

        // Part 1 is LIVE_DATA
        expect(reply).toContain('Jobs:\n');
        expect(reply).toContain('• Full Stack Engineer (Tech)');
        expect(listPublicVacanciesMock).toHaveBeenCalledTimes(1);

        // Part 2 is STATIC_RAG
        expect(reply).toContain('Contact:\n');
        expect(reply).toContain('You can reach us at info@agrotourismconnect.com');
        expect(retrieveMock).toHaveBeenCalledTimes(1);
    });

    it('handles live-service failure inside a mixed multi-intent question gracefully', async () => {
        // Project DB throws
        listProjectsMock.mockRejectedValue(new Error('mongo connection down'));

        // RAG returns fallback or static investment record
        retrieveMock.mockResolvedValue([
            {
                title: 'Investment Guide',
                content: 'Investment requires investor registration and due diligence.',
            },
        ]);
        createCompletionMock.mockResolvedValueOnce(completion('[0]'));
        createCompletionMock.mockResolvedValueOnce(
            completion('Investment requires investor registration and due diligence.')
        );

        const reply = await generateChatReply('What projects are available now and how can I invest?');

        expect(reply).toContain('Public Projects:\n');
        expect(reply).toContain('Investment:\n');
        // Neither section crashes
        expect(reply).not.toContain('mongo connection down');
        expect(reply).toContain('Investment requires investor registration');
    });
});

export const INTENT_DESCRIPTIONS = {
    KNOWLEDGE_CENTER:
        'The website Knowledge Center, its guides, articles, topic cards, categories, contents and publication status. Follow-up questions about what it contains keep this topic.',
    PLATFORM_FEATURES:
        'Website sections, navigation, gallery, user features and how to browse, search, filter or share projects. Describes functionality, not actual available projects. Broad questions about the purpose of this website remain ABOUT_SERVICES.',
    ABOUT_SERVICES:
        'What Agrotourism Connect is, its purpose, services, capabilities and how it helps users or landowners. Conversational references to your project, this project, this platform, this website, what do you do, what does it do, or what is it about ask about this company and its services, even without naming it.',

    PUBLIC_PROJECTS:
        'Actual named, listed, public, available, current or ongoing projects and their status.',

    INVESTMENT:
        'Company/project investment, participation, funding, investment opportunities or returns.',

    OWNER_FOUNDER:
        'Public owner, founder, promoter, leadership or who runs the company.',

    LOGIN_AUTH:
        'Platform login, signup, registration, authentication or account access.',

    JOBS:
        'Company jobs, vacancies, openings, hiring, careers, internships or employment.',

    PRICING:
        'Company service fees, prices, charges, costs or package rates.',

    CONTACT:
        'Company contact methods, phone, email, address, WhatsApp or ways to reach the company.',

    TRAINING:
        'Company training, courses, workshops, practical programs, registration, schedules or fees.',

    GENERAL_TOURISM:
        'Only general educational tourism topics: agro tourism, farm stays, eco tourism, feasibility, resort development, planning, hospitality, marketing or land development. No company-specific facts.',

    GENERAL:
        'Normal questions about other subjects, including software such as React, or general conversation, without requesting Agrotourism Connect facts.',

    UNKNOWN:
        'Meaning is genuinely unclear or cannot confidently be assigned another intent.',
} as const;

export type ChatbotIntent = keyof typeof INTENT_DESCRIPTIONS;

export type CompanyIntent = Exclude<
    ChatbotIntent,
    'GENERAL_TOURISM' | 'GENERAL' | 'UNKNOWN'
>;

export type ChatbotContext =
    | 'INVESTOR'
    | 'LANDOWNER'
    | 'PROJECT'
    | 'WEBSITE'
    | 'LAND'
    | 'TOURISM'
    | 'PARTNERSHIP';

export type ChatbotDataSource = 'STATIC_RAG' | 'LIVE_DATA';
export type ChatbotFreshness = 'STATIC' | 'LIVE';

export interface StructuredIntent {
    action: ChatbotIntent;
    actions: ChatbotIntent[];
    contexts: ChatbotContext[];
    entities?: Record<string, string | number>;
    dataSource?: ChatbotDataSource;
    freshness?: ChatbotFreshness;
}

export type CompanyQuestion = {
    intent: CompanyIntent | 'GENERAL_TOURISM';
    question: string;
};

export const RETRIEVAL_FOCUS: Record<CompanyIntent, string> = {
    KNOWLEDGE_CENTER: 'Knowledge Center overview, six topic cards, guides and articles, contents and publication status',
    PLATFORM_FEATURES: 'public website sections, navigation, gallery, account features, project browsing, search, filters and sharing',
    ABOUT_SERVICES:
        'company overview, core services, Land Development, Resort Development, Agro Tourism, landowner support, tourism development, planning and feasibility',

    PUBLIC_PROJECTS:
        'actual public project listings, named projects, project status and current availability',

    INVESTMENT:
        'verified investment opportunities, participation process, funding terms and returns',

    OWNER_FOUNDER:
        'public company identity, owner, founder, promoter and leadership',

    LOGIN_AUTH:
        'platform login, account access, signup and registration instructions',

    JOBS:
        'current vacancies, career opportunities, internships and hiring details',

    PRICING:
        'published service fees, prices, charges and package rates',

    CONTACT:
        'official public contact information, phone, email, address and contact methods',

    TRAINING:
        'training programs, workshops, courses, schedules, registration and training fees',
};

export type RetrievedKnowledge = {
    title?: string;
    category?: string;
    sourceType?: string;
    sourceName?: string;
    sourceId?: unknown;
    content?: string;
    score?: number;
};

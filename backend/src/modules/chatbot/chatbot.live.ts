import { listProjects } from '../projects/project.service';
import { listPublicVacancies } from '../careers/vacancy.service';
import type { ChatbotIntent } from './chatbot.types';

/**
 * Returns formatted public projects currently active and published in the database.
 * Never exposes unpublished, admin, owner, or internal notes.
 * Returns null if the database service fails.
 */
export async function getLivePublicProjectsAnswer(): Promise<string | null> {
    try {
        const result = await listProjects({ publicOnly: true, limit: 10 });
        const items = result?.items ?? [];

        if (!items.length) {
            return 'There are currently no verified published projects available.';
        }

        const formatted = items.map((project: any) => {
            const name = project.projectName || 'Unnamed Project';
            const type = project.projectType || 'Agrotourism Project';
            const location = project.location ? `, ${project.location}` : '';
            return `• ${name} — ${type}${location}`;
        }).join('\n');

        return `Current published projects include:\n${formatted}`;
    } catch (error) {
        console.error('[chatbot:live] failed to list public projects:', error);
        return null;
    }
}

/**
 * Returns actual projects open for investment exploration.
 * Always lists real projects first, followed by clear next steps and due diligence notices.
 * Returns null if the database service fails.
 */
export async function getLiveInvestmentOpportunitiesAnswer(): Promise<string | null> {
    try {
        const result = await listProjects({ publicOnly: true, limit: 10 });
        const items = result?.items ?? [];

        if (!items.length) {
            return 'There are currently no verified published projects open for investment. You can register as an investor on the platform to receive updates when new opportunities become available.';
        }

        const formatted = items.map((project: any) => {
            const name = project.projectName || 'Unnamed Project';
            const type = project.projectType || 'Agrotourism Project';
            const location = project.location ? `, ${project.location}` : '';
            return `• ${name} — ${type}${location}`;
        }).join('\n');

        return `Current projects open for investment include:\n${formatted}\n\nTo explore detailed projections and express interest, please register or sign in as an investor on the platform. All investments are subject to mutual agreements and independent due diligence.`;
    } catch (error) {
        console.error('[chatbot:live] failed to list investment opportunities:', error);
        return null;
    }
}

/**
 * Returns currently active, verified job vacancies from the careers module.
 * Returns null if the database service fails.
 */
export async function getLiveVacanciesAnswer(): Promise<string | null> {
    try {
        const result = await listPublicVacancies({ limit: 10 });
        const items = result?.items ?? [];

        if (!items.length) {
            return 'There are currently no verified active job openings.';
        }

        const formatted = items.map((vacancy: any) => {
            const title = vacancy.title || 'Role';
            const dept = vacancy.department ? ` (${vacancy.department})` : '';
            return `• ${title}${dept}`;
        }).join('\n');

        return `Yes. Current openings include:\n${formatted}\n\nYou can review complete role requirements and submit applications directly on our Careers page.`;
    } catch (error) {
        console.error('[chatbot:live] failed to list public vacancies:', error);
        return null;
    }
}

/**
 * Route a LIVE_DATA intent to the appropriate backend module.
 * Returns string if handled successfully (including verified zero-records), or null if service fails.
 */
export async function handleLiveQuery(
    intent: ChatbotIntent,
    message: string
): Promise<string | null> {
    try {
        if (intent === 'PUBLIC_PROJECTS') {
            if (/\b(?:invest|investment|funding|returns)\b/iu.test(message)) {
                return await getLiveInvestmentOpportunitiesAnswer();
            }
            return await getLivePublicProjectsAnswer();
        }

        if (intent === 'INVESTMENT') {
            return await getLiveInvestmentOpportunitiesAnswer();
        }

        if (intent === 'JOBS') {
            return await getLiveVacanciesAnswer();
        }

        return null;
    } catch (error) {
        console.error('[chatbot:live] live query routing failed:', error);
        return null;
    }
}

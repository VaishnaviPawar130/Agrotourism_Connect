import type OpenAI from 'openai';
import {
    INTENT_DESCRIPTIONS,
    type ChatbotIntent,
    type CompanyIntent,
    type ChatbotContext,
    type StructuredIntent,
    type CompanyQuestion,
    type ChatbotDataSource,
    type ChatbotFreshness,
} from './chatbot.types';
import { INTENT_CLASSIFIER_SYSTEM_PROMPT } from './chatbot.prompt';
import { detectCompanyQuestions } from './chatbot.detection';

// Re-export types and detection for backward compatibility
export {
    INTENT_DESCRIPTIONS,
    type ChatbotIntent,
    type CompanyIntent,
    type ChatbotContext,
    type StructuredIntent,
    type CompanyQuestion,
    type ChatbotDataSource,
    type ChatbotFreshness,
} from './chatbot.types';
export { detectCompanyQuestions } from './chatbot.detection';

export function isCompanyIntent(
    intent: ChatbotIntent
): intent is CompanyIntent {
    return (
        intent !== 'GENERAL_TOURISM' &&
        intent !== 'GENERAL' &&
        intent !== 'UNKNOWN'
    );
}

/**
 * Detect context, roles, and subjects present in the message.
 */
export function detectContexts(message: string): ChatbotContext[] {
    const normalized = message.normalize('NFKC').toLowerCase();
    const contexts: ChatbotContext[] = [];

    // INVESTOR: investor, investment, investing, invest
    if (/\b(?:investors?|investments?|investing|invest)\b/iu.test(normalized)) {
        contexts.push('INVESTOR');
    }

    // LANDOWNER: landowner, land owner, farmer, property owner, or owning/having land
    if (
        /\b(?:land[\s_-]*owners?|farmers?|property[\s_-]*owners?)\b/iu.test(normalized) ||
        /\b(?:i have|my|own(?:s|ing)?)\s+(?:(?:\d+(?:\.\d+)?\s*)?(?:acres?|gunthas?|hectares?|sq\w+)?\s*(?:of\s+)?(?:land|farmland|property|plot))\b/iu.test(normalized)
    ) {
        contexts.push('LANDOWNER');
    }

    // PARTNERSHIP: partner, partnership, collaborate, collaboration, joint venture
    if (/\b(?:partners?|partnerships?|collaborat(?:e|ion|ing)|joint[\s_-]*venture)\b/iu.test(normalized)) {
        contexts.push('PARTNERSHIP');
    }

    // LAND: land, acres, gunthas, hectares, farmland, plot, field
    if (
        /\b(?:\d+(?:\.\d+)?\s*(?:acres?|gunthas?|hectares?|sq(?:uare)?\s*(?:ft|feet|meters?))|lands?|farmlands?|plots?|fields?)\b/iu.test(normalized)
    ) {
        contexts.push('LAND');
    }

    // TOURISM: tourism, tourist, agro tourism, agri tourism, resort, stay, farmstay, etc.
    if (/\b(?:agro[\s_-]*tourism|agri[\s_-]*tourism|touris[mt]|tourists?|farm[\s_-]*stays?|resorts?|visitors?|hospitality)\b/iu.test(normalized)) {
        contexts.push('TOURISM');
    }

    // PROJECT: project, projects, listing, listings, site, sites
    if (/\b(?:projects?|listings?|sites?)\b/iu.test(normalized)) {
        contexts.push('PROJECT');
    }

    // WEBSITE: website, portal, platform, app, knowledge center, agrotourism connect
    if (/\b(?:websites?|portals?|platforms?|apps?|knowledge[\s_-]*cent(?:er|re)|agrotourism[\s_-]*connect)\b/iu.test(normalized)) {
        contexts.push('WEBSITE');
    }

    return contexts;
}

/**
 * Safely extract structured entities like land size.
 */
export function extractEntities(message: string): Record<string, string | number> {
    const normalized = message.normalize('NFKC');
    const entities: Record<string, string | number> = {};

    // Land size: e.g. "2 acres", "1.5 hectares", "10 gunthas"
    const landMatch = normalized.match(/\b(\d+(?:\.\d+)?\s*(?:acres?|gunthas?|hectares?|sq(?:uare)?\s*(?:ft|feet|meters?)))\b/i);
    if (landMatch) {
        entities.landSize = landMatch[1].trim().toLowerCase();
    }

    return entities;
}

/**
 * Classify whether a question requires live database/inventory state or static business RAG.
 */
export function detectDataSource(
    message: string,
    intent: ChatbotIntent
): { dataSource: ChatbotDataSource; freshness: ChatbotFreshness } {
    const normalized = message.normalize('NFKC').toLowerCase().trim();

    // 1. Freshness terms alone must NOT trigger live data.
    // Only use LIVE_DATA when the question is about supported live entities:
    // PUBLIC_PROJECTS, INVESTMENT opportunities, JOBS.
    if (intent !== 'PUBLIC_PROJECTS' && intent !== 'INVESTMENT' && intent !== 'JOBS') {
        return { dataSource: 'STATIC_RAG', freshness: 'STATIC' };
    }

    // 2. PUBLIC_PROJECTS:
    if (intent === 'PUBLIC_PROJECTS') {
        // Disqualify purely procedural/catalog queries without freshness (e.g. "what type of projects do you do")
        const isProjectCatalogOverview = /\b(?:what\s+type\s+of\s+projects?|types?\s+of\s+projects?)\b/iu.test(normalized);
        if (isProjectCatalogOverview) {
            return { dataSource: 'STATIC_RAG', freshness: 'STATIC' };
        }

        // Live project queries require real-time / ongoing / active / current-state indicators:
        // "available now", "current ongoing", "ongoing projects", "active projects", "which projects are active",
        // "running projects", "latest projects", "listed right now", "open now", "projects available right now"
        const isLiveProjectQuery =
            /\b(?:available\s+now|now\s+available|currently\s+available|open\s+now|listed\s+now|right[\s_-]*now|live)\b/iu.test(normalized) ||
            /\b(?:ongoing|active|running|latest)\s+(?:projects?|listings?)\b/iu.test(normalized) ||
            /\bprojects?\s+(?:are\s+|currently\s+)?(?:active|ongoing|running|available\s+now)\b/iu.test(normalized) ||
            /\bwhich\s+projects?\s+are\s+(?:active|ongoing|running|open|available)\b/iu.test(normalized) ||
            /\bcurrent\s+ongoing\b/iu.test(normalized) ||
            /\bprojects?\s+(?:listed|open)\s+(?:right\s+now|now)\b/iu.test(normalized);

        if (isLiveProjectQuery) {
            return { dataSource: 'LIVE_DATA', freshness: 'LIVE' };
        }
    }

    // 3. INVESTMENT OPPORTUNITIES:
    if (intent === 'INVESTMENT') {
        const isLiveOpportunityQuery =
            /\b(?:projects?\s+open\s+for\s+investment|open\s+for\s+investment|investment\s+opportunities|investment\s+project\s+names?)\b/iu.test(normalized) ||
            /\b(?:available|current|active|open|ongoing|latest|running)\s+(?:investment\s+opportunities|investment\s+projects?|projects?\s+for\s+investment)\b/iu.test(normalized) ||
            (/\b(?:invest|investment)\b/iu.test(normalized) && /\b(?:right[\s_-]*now|now|currently\s+open)\b/iu.test(normalized));

        const isPurelyProcedural =
            /\b(?:how\s+(?:does|can|do)\b|how\s+to\s+invest|procedure|process|terms|returns?|fees?|charges?|policy)\b/iu.test(normalized) &&
            !/\b(?:what\s+are\s+the|which|what|list|names?)\s+(?:current|available|open|active|ongoing|latest)\b/iu.test(normalized);

        if (isLiveOpportunityQuery && !isPurelyProcedural) {
            return { dataSource: 'LIVE_DATA', freshness: 'LIVE' };
        }
    }

    // 4. JOBS / CAREERS:
    if (intent === 'JOBS') {
        // Any vacancy inquiry with a freshness concept (current, available, open, right now, active, etc.)
        const isVacancyWithFreshness =
            /\bvacanc(?:y|ies)\b/iu.test(normalized) &&
            /\b(?:current(?:ly)?|available|open|active|ongoing|latest|right[\s_-]*now|now)\b/iu.test(normalized);

        const isOpeningsRightNow =
            /\bopenings?\s+(?:are\s+)?(?:available|open)\s+(?:right[\s_-]*now|now)\b/iu.test(normalized);

        const isPurelyGeneralHiring =
            /\b(?:how\s+to\s+apply|application\s+process|interview\s+process|career\s+growth)\b/iu.test(normalized);

        if ((isVacancyWithFreshness || isOpeningsRightNow) && !isPurelyGeneralHiring) {
            return { dataSource: 'LIVE_DATA', freshness: 'LIVE' };
        }
    }

    return { dataSource: 'STATIC_RAG', freshness: 'STATIC' };
}

/**
 * Perform structured intent analysis (action + contexts + entities + dataSource + freshness).
 */
export function analyzeMessage(
    message: string,
    history: string[] = []
): StructuredIntent {
    const contexts = detectContexts(message);
    const entities = extractEntities(message);
    const multiParts = detectCompanyQuestions(message);

    if (multiParts.length > 1) {
        const actions = multiParts.map((part) => part.intent);
        const { dataSource, freshness } = detectDataSource(message, actions[0]);
        return {
            action: actions[0],
            actions,
            contexts,
            dataSource,
            freshness,
            ...(Object.keys(entities).length ? { entities } : {}),
        };
    }

    const action = resolveUnknownIntent(message, history);
    const { dataSource, freshness } = detectDataSource(message, action);
    return {
        action,
        actions: [action],
        contexts,
        dataSource,
        freshness,
        ...(Object.keys(entities).length ? { entities } : {}),
    };
}

/**
 * Used only when the LLM response is UNKNOWN
 * or malformed, truncated, empty, or unavailable.
 *
 * We intentionally keep this conservative.
 *
 * Do NOT make the word "here" alone mean ABOUT_SERVICES,
 * because:
 *
 * "What openings are available here?"
 *
 * should remain JOBS when correctly classified.
 */
export function resolveUnknownIntent(
    message: string,
    history: string[] = []
): ChatbotIntent {
    const normalized = message
        .normalize('NFKC')
        .trim()
        .toLowerCase();

    // Contact is the requested action even when the purpose is investment.
    if (/\b(?:contact|email|phone|whatsapp|reach (?:you|someone)|get in touch)\b/u.test(normalized)) return 'CONTACT';
    if (/\bknowledge cent(?:er|re)\b/u.test(normalized)) return 'KNOWLEDGE_CENTER';
    // Workshop registration/pricing must not become account access/service pricing.
    if (/\b(?:training|workshops?|courses?)\b/u.test(normalized)) return 'TRAINING';
    // Authentication / Login / Register (Action takes priority over role context like investor or landowner)
    if (/\b(?:register|registration|sign[\s_-]?(?:in|up)|log[\s_-]?in|create (?:an? )?account|password|account access)\b/u.test(normalized)) return 'LOGIN_AUTH';
    if (/\b(?:owner|founder|cofounder|leadership)\b|\bwho (?:owns|founded|runs)\b/u.test(normalized)) return 'OWNER_FOUNDER';
    if (/\b(?:jobs?|vacanc(?:y|ies)|openings?|hiring|careers?|internships?)\b/u.test(normalized)) return 'JOBS';
    if (/\b(?:pricing|prices?|fees?|charges?|costs?|packages?)\b/u.test(normalized)) return 'PRICING';
    if (/\b(?:invest|investment|investors?|funding|returns)\b/u.test(normalized)) return 'INVESTMENT';
    if (/\b(?:browse|search|filter|sort|share|navigation|gallery|dashboard|platform features)\b/u.test(normalized)) return 'PLATFORM_FEATURES';
    if (/\b(?:(?:public|available|current|ongoing|listed|published|active|running|latest|open)\s+(?:projects?|listings?)|projects?\s+(?:are\s+|currently\s+|now\s+)?(?:available|active|open|ongoing|running)|which\s+projects?\s+are\s+(?:active|ongoing|current|open|available|running)|show\s+me\s+(?:the\s+)?projects?)\b/u.test(normalized)) return 'PUBLIC_PROJECTS';
    if (/\b(?:your services|services (?:do you|you)|what do you do|what type of projects)\b/u.test(normalized)) return 'ABOUT_SERVICES';

    // General tourism educational questions & definitions
    if (
        /\b(?:what is (?:land development|agro[\s_-]*tourism|agri[\s_-]*tourism|tourism feasibility)|can you explain (?:farm stays?|agro[\s_-]*tourism)|how can i develop \d+\s*acres? for tourism|develop it for tourism)\b/u.test(normalized) ||
        /\b(?:land development)\b/u.test(normalized)
    ) {
        return 'GENERAL_TOURISM';
    }

    // Explicit current message intent overrides stale history.
    // Use history ONLY for genuine follow-ups that lack an explicit independent topic.
    const isVagueFollowUp = /^(?:what (?:does|do) (?:it|this|they) (?:contain|include|offer|do)|tell me more|what else)[?.!\s\w]*$/u.test(normalized);
    if (isVagueFollowUp) {
        for (const previous of history.slice(-6).reverse()) {
            const previousIntent = resolveUnknownIntent(previous);
            if (previousIntent !== 'GENERAL') return previousIntent;
        }
    }

    const refersToCompany =
        /\bagro[\s_-]*tourism[\s_-]*connect\b/iu.test(normalized) ||
        /\byour project\b/iu.test(normalized) ||
        /\bthis project\b/iu.test(normalized) ||
        /\bthis platform\b/iu.test(normalized) ||
        /\bthis website\b/iu.test(normalized) ||
        /\byour website\b/iu.test(normalized) ||
        /\bwhat does it do\b/iu.test(normalized) ||
        /\bwhat can i do here\b/iu.test(normalized) ||
        /\bhow do you help landowners\b/iu.test(normalized) ||
        /\bwhat are you guys working on\b/iu.test(normalized) ||
        /\bdescribe the platform\b/iu.test(normalized);

    return refersToCompany ? 'ABOUT_SERVICES' : 'GENERAL';
}

export async function classifyIntent(
    message: string,
    openai: OpenAI,
    model: string,
    history: string[] = []
): Promise<ChatbotIntent> {
    const normalized = message.normalize('NFKC').trim().toLowerCase();

    // Explicit current message intent overrides stale history
    const isVagueFollowUp = /^(?:what (?:does|do) (?:it|this|they) (?:contain|include|offer|do)|tell me more|what else)[?.!\s\w]*$/u.test(normalized);
    const explicitAction = resolveUnknownIntent(message);

    try {
        const response = await openai.chat.completions.create({
            model,
            temperature: 0,
            max_tokens: 32,
            messages: [
                {
                    role: 'system',
                    content: INTENT_CLASSIFIER_SYSTEM_PROMPT,
                },
                ...history.slice(-6).map((content) => ({
                    role: 'user' as const,
                    content: `Earlier user question (context only): ${JSON.stringify(content)}`,
                })),
                {
                    role: 'user',
                    content: message,
                },
            ],
        });

        if (response.choices[0]?.finish_reason === 'length') {
            return resolveUnknownIntent(message, history);
        }

        const raw = response.choices[0]?.message?.content?.trim() ?? '';
        const label = raw.trim().toUpperCase();

        if (Object.prototype.hasOwnProperty.call(INTENT_DESCRIPTIONS, label)) {
            let intent = label as ChatbotIntent;
            if (intent === 'UNKNOWN') {
                return resolveUnknownIntent(message, history);
            }

            // Action priority over role context:
            // If the user's message is an explicit sign-in / login / registration action,
            // do not allow role words (e.g. "investor" or "landowner") to misclassify it as INVESTMENT or ABOUT_SERVICES.
            if (/\b(?:register|registration|sign[\s_-]?(?:in|up)|log[\s_-]?in|create (?:an? )?account|password|account access)\b/u.test(normalized)
                && !/\b(?:training|workshops?|courses?)\b/u.test(normalized)) {
                intent = 'LOGIN_AUTH';
            }

            // If model fell into history trap for a new explicit action question, override with explicit action
            if (explicitAction !== 'GENERAL' && explicitAction !== 'UNKNOWN' && !isVagueFollowUp && intent !== explicitAction && history.length > 0) {
                return explicitAction;
            }

            return intent;
        }

        return resolveUnknownIntent(message, history);
    } catch (error) {
        console.error('[chatbot:intent] classification failed:', error);
        return resolveUnknownIntent(message, history);
    }
}

/** Carry topic references forward without treating previous replies as facts. */
export function contextualizeQuestion(message: string, history: string[] = []): string {
    const followUp = /\b(?:it|its|they|them|those|these)\b|^(?:tell me more|what else|and (?:the )?\w+)/iu.test(message);
    if (!followUp || !history.length) return message;
    return `Earlier user questions (context only, not evidence): ${JSON.stringify(history.slice(-6))}\nCurrent user question: ${message}`;
}

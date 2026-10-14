import type OpenAI from 'openai';
import {
    RETRIEVAL_FOCUS,
    type CompanyIntent,
    type ChatbotContext,
    type RetrievedKnowledge,
} from './chatbot.types';
import {
    retrievePublicServiceKnowledge,
    retrievePublicTopicKnowledge,
    retrieveRelevantKnowledge,
} from './retrieval/retrieval.service';
import { selectIntentSafeEvidence } from './chatbot.evidence';
import { BROAD_EVIDENCE_SYSTEM_PROMPT } from './chatbot.prompt';

/**
 * Broad recovery has no trusted topic, so relevance must be explicitly accepted.
 * Unlike intent-scoped recovery, a failed selector cannot accept records merely
 * because their metadata matches a company topic.
 */
export async function retrieveBroadEvidence(
    question: string,
    openai: OpenAI,
    model: string
): Promise<RetrievedKnowledge[]> {
    try {
        // Same public-only Atlas pipeline and 0.80 threshold as scoped retrieval.
        const retrieved: RetrievedKnowledge[] = await retrieveRelevantKnowledge(question, 5);
        // Broad recovery supports company services/development guidance, not
        // inferred availability, prices, owners, vacancies or investment terms.
        const candidates = selectIntentSafeEvidence('ABOUT_SERVICES', retrieved)
            .filter((item) => typeof item.score === 'number'
                && Number.isFinite(item.score) && item.score >= 0.80);
        if (!candidates.length) return [];

        const response = await openai.chat.completions.create({
            model,
            temperature: 0,
            max_tokens: 100,
            messages: [
                {
                    role: 'system',
                    content: BROAD_EVIDENCE_SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: JSON.stringify({
                        question,
                        sources: candidates.map((item, index) => ({
                            index,
                            title: item.title,
                            content: item.content,
                        })),
                    }),
                },
            ],
        });
        if (response.choices[0]?.finish_reason === 'length') return [];
        const indexes: unknown = JSON.parse(response.choices[0]?.message?.content ?? '');
        if (!Array.isArray(indexes) || indexes.length > candidates.length
            || new Set(indexes).size !== indexes.length
            || !indexes.every((index) => Number.isInteger(index) && index >= 0 && index < candidates.length)) {
            return [];
        }
        return indexes.map((index: number) => candidates[index]);
    } catch {
        // Never bypass relevance verification or expose provider details on failure.
        return [];
    }
}

/**
 * Retrieve verified public knowledge for a company-specific intent.
 * Enriched with optional context/role parameters.
 */
export async function retrieveIntentKnowledge(
    message: string,
    intent: CompanyIntent,
    contexts: ChatbotContext[] = []
): Promise<RetrievedKnowledge[]> {
    let knowledge: RetrievedKnowledge[] = [];
    const contextTerms = contexts.map((c) => c.toLowerCase());
    const terms = new Set([
        ...(message.toLowerCase().match(/[a-z]{4,}/g) ?? []),
        ...contextTerms,
    ]);
    const relevance = (item: RetrievedKnowledge) => [...terms].reduce((score, term) =>
        score + ((item.title ?? '').toLowerCase().includes(term) ? 3 : 0)
        + ((item.content ?? '').toLowerCase().includes(term) ? 1 : 0), 0);
    const rank = (items: RetrievedKnowledge[]) => [...items].sort((a, b) => relevance(b) - relevance(a));

    const contextContextStr = contexts.length ? `\n\nContext / Role:\n${contexts.join(', ')}` : '';

    try {
        knowledge = await retrieveRelevantKnowledge(
            `
Agrotourism Connect

Intent:
${intent}${contextContextStr}

Relevant information:
${RETRIEVAL_FOCUS[intent]}

User question:
${message}
            `.trim(),
            5
        );
    } catch (error) {
        console.error(
            '[chatbot:evidence] Vector retrieval failed:',
            error
        );
        knowledge = [];
    }

    // ABOUT_SERVICES FALLBACK
    if (intent === 'ABOUT_SERVICES') {
        try {
            const services = await retrievePublicServiceKnowledge(40);
            const importantServices = services.filter((item) => {
                return (
                    item.sourceId === 'company:overview' ||
                    item.sourceId === 'service:core-services'
                );
            });

            knowledge = [
                ...importantServices,
                ...knowledge,
                ...rank(services),
            ];
        } catch (error) {
            console.warn(
                '[chatbot:evidence] Public service lookup unavailable:',
                error
            );
        }
    }

    if (intent !== 'ABOUT_SERVICES' && intent !== 'PUBLIC_PROJECTS') {
        try {
            const topics = await retrievePublicTopicKnowledge(intent);
            // Topic records cannot be crowded out by unrelated vector matches.
            knowledge = [...rank(topics), ...knowledge];
        } catch (error) {
            console.warn('[chatbot:evidence] Public topic lookup unavailable');
        }
    }

    // CLEAN + FILTER + DEDUPLICATE
    const seen = new Set<string>();
    const filtered = knowledge.filter((item) => {
        if (
            typeof item.content !== 'string' ||
            !item.content.trim()
        ) {
            return false;
        }

        // PUBLIC_PROJECTS must contain actual project records only.
        if (
            intent === 'PUBLIC_PROJECTS' &&
            item.sourceType !== 'PROJECT'
        ) {
            return false;
        }

        const key = [
            item.sourceType ?? '',
            item.sourceId ?? '',
            item.title ?? '',
            item.content,
        ].join(':');

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });

    return filtered.slice(0, 5);
}

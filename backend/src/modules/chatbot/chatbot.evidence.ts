import type OpenAI from 'openai';
import {
    RETRIEVAL_FOCUS,
    type CompanyIntent,
    type RetrievedKnowledge,
} from './chatbot.types';
import { buildEvidenceSelectorPrompt } from './chatbot.prompt';

// Re-export retrieval functions and types for compatibility
export { retrieveIntentKnowledge, retrieveBroadEvidence } from './chatbot.retrieval';
export type { RetrievedKnowledge } from './chatbot.types';

/**
 * Conservative recovery using only the records returned by retrieval.
 * Topic metadata AND supporting content are required; keyword overlap alone
 * cannot turn a service, contact form, or navigation card into a factual listing.
 */
export function selectIntentSafeEvidence(
    intent: CompanyIntent,
    knowledge: RetrievedKnowledge[]
): RetrievedKnowledge[] {
    return knowledge.filter((item) => {
        const content = item.content?.trim() ?? '';
        if (!content) return false;
        const category = item.category ?? '';
        const type = item.sourceType ?? '';
        const id = String(item.sourceId ?? '');
        switch (intent) {
            case 'ABOUT_SERVICES':
                return ['COMPANY', 'SERVICE'].includes(type)
                    && ['ABOUT_SERVICES', 'SERVICES'].includes(category);
            case 'CONTACT':
                return (category === 'CONTACT' || type === 'CONTACT' || id.startsWith('contact:'))
                    && /contact|e-?mail|enquir|instagram|phone|whatsapp/i.test(content);
            case 'LOGIN_AUTH':
                return (category === 'LOGIN_AUTH' || id.startsWith('auth:'))
                    && /register|registration|login|sign.in|password|account/i.test(content);
            case 'INVESTMENT':
                return (category === 'INVESTMENT' || ['service:investment-platform', 'service:investor-facilitation'].includes(id))
                    && /invest(?:ment|or|ing)?/i.test(content);
            case 'KNOWLEDGE_CENTER':
                return category === 'KNOWLEDGE_CENTER' && /knowledge cent(?:er|re)/i.test(content);
            case 'PLATFORM_FEATURES':
                return category === 'PLATFORM_FEATURES' && /page|website|dashboard|profile|project|gallery|navigation/i.test(content);
            case 'PUBLIC_PROJECTS':
                return type === 'PROJECT';
            case 'JOBS':
                return category === 'JOBS' && /\b(?:hiring|vacanc(?:y|ies)|job|opening|position)\b/i.test(content)
                    && !/does not (?:confirm|establish)|process description|careers feature/i.test(content);
            case 'PRICING':
                return category === 'PRICING' && /\b(?:price|pricing|fee|cost|charge|rate)\b/i.test(content)
                    && /(?:\u20b9|\$|INR|Rs\.?|USD)\s*\d|\d\s*(?:rupees|INR|USD)|free of charge/i.test(content);
            case 'OWNER_FOUNDER':
                return category === 'OWNER_FOUNDER' && /\b(?:founded by|owned by|founder is|owner is|co-founder|founder:|owner:)\s*\S+/i.test(content);
            case 'TRAINING':
                return category === 'TRAINING' && /\b(?:training|workshop|course)\b/i.test(content)
                    && !/not (?:a |currently )?(?:course|training)|no (?:training|courses)|does not (?:confirm|establish)/i.test(content);
        }
    });
}

/**
 * Select verified evidence using LLM semantic selection with safe fallbacks.
 */
export async function selectRelevantEvidence(
    message: string,
    intent: CompanyIntent,
    knowledge: RetrievedKnowledge[],
    openai: OpenAI,
    model: string
): Promise<RetrievedKnowledge[]> {
    if (!knowledge.length) {
        return selectIntentSafeEvidence(intent, knowledge);
    }

    // PUBLIC_PROJECTS SAFETY FILTER
    if (intent === 'PUBLIC_PROJECTS') {
        knowledge = knowledge.filter((item) => item.sourceType === 'PROJECT');
        if (!knowledge.length) {
            return selectIntentSafeEvidence(intent, knowledge);
        }
    }

    // SEMANTIC EVIDENCE SELECTION
    try {
        const response = await openai.chat.completions.create({
            model,
            temperature: 0,
            max_tokens: 100,
            messages: [
                {
                    role: 'system',
                    content: buildEvidenceSelectorPrompt(intent, RETRIEVAL_FOCUS[intent]),
                },
                {
                    role: 'user',
                    content: JSON.stringify({
                        question: message,
                        sources: knowledge.map((item, index) => ({
                            index,
                            title: item.title,
                            content: item.content,
                        })),
                    }),
                },
            ],
        });

        if (response.choices[0]?.finish_reason === 'length') {
            return selectIntentSafeEvidence(intent, knowledge);
        }

        const raw = response.choices[0]?.message?.content?.trim() ?? '';

        let indexes: unknown;
        try {
            indexes = JSON.parse(raw);
        } catch {
            console.warn('[chatbot:evidence] Invalid evidence selector response:', raw);
            return selectIntentSafeEvidence(intent, knowledge);
        }

        // Must be an array.
        if (!Array.isArray(indexes) || indexes.length === 0) {
            return selectIntentSafeEvidence(intent, knowledge);
        }

        // Cannot select more records than exist.
        if (indexes.length > knowledge.length) {
            return selectIntentSafeEvidence(intent, knowledge);
        }

        // Every element must be a valid integer index.
        if (!indexes.every((index) => Number.isInteger(index) && index >= 0 && index < knowledge.length)) {
            return selectIntentSafeEvidence(intent, knowledge);
        }

        // Duplicate indexes are considered malformed.
        if (new Set(indexes).size !== indexes.length) {
            return selectIntentSafeEvidence(intent, knowledge);
        }

        return indexes.map((index: number) => knowledge[index]);
    } catch (error) {
        console.error('[chatbot:evidence] Evidence selection failed:', error);
        return selectIntentSafeEvidence(intent, knowledge);
    }
}

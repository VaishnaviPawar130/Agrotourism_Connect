import type { CompanyQuestion, CompanyIntent } from './chatbot.types';
import { resolveUnknownIntent, isCompanyIntent } from './chatbot.intent';

/**
 * Recognize separate, explicit company requests without changing the single-label contract.
 * Reuse deterministic recovery so multi-part questions also work during provider outages.
 * Ambiguous or mixed general/company requests stay on the existing classifier path.
 */
export function detectCompanyQuestions(message: string): CompanyQuestion[] {
    const parts = message.normalize('NFKC')
        .split(/\s*\b(?:and(?:\s+also)?|or|also|plus|along with|as well as)\b\s*|[;?\n]+|,\s*(?=and\b|(?:how|what|who|are|do|tell|can)\b)/iu)
        .map((part) => part.trim()).filter(Boolean);
    if (parts.length < 2) return [];

    const questions: CompanyQuestion[] = [];
    for (const question of parts) {
        let intent = resolveUnknownIntent(question);
        if (/\b(?:about|describe|explain)\s+(?:the\s+)?project\b/iu.test(question)) {
            intent = 'ABOUT_SERVICES';
        }
        // Account role alternatives are still one registration question.
        if (questions.at(-1)?.intent === 'LOGIN_AUTH'
            && /^(?:(?:an?|as an?)\s+)?(?:landowner|investor)[.!\s]*$/iu.test(question)) {
            questions[questions.length - 1].question += ` or ${question}`;
            continue;
        }
        // "Training and registration/fees" describes one program, not account access/pricing.
        if (questions.at(-1)?.intent === 'TRAINING'
            && /^(?:(?:its|the)\s+)?(?:registration|fees?|prices?|costs?)[.!\s]*$/iu.test(question)) {
            questions[questions.length - 1].question += ` and ${question}`;
            continue;
        }
        // Preserve both company intents and general tourism intents.
        // If a split part is GENERAL (e.g. conversational filler or off-topic), do not discard valid intents.
        if (intent === 'GENERAL' || intent === 'UNKNOWN') {
            continue;
        }
        if (!isCompanyIntent(intent) && intent !== 'GENERAL_TOURISM') {
            continue;
        }
        const existing = questions.find((part) => part.intent === intent);
        if (existing) existing.question += ` and ${question}`;
        else questions.push({ intent, question });
    }
    return questions.length > 1 ? questions.slice(0, 3) : [];
}

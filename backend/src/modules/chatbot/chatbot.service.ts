import OpenAI from 'openai';

import {
    classifyIntent,
    contextualizeQuestion,
    detectContexts,
    detectDataSource,
    isCompanyIntent,
} from './chatbot.intent';
import { detectCompanyQuestions } from './chatbot.detection';
import { handleLiveQuery } from './chatbot.live';
import type {
    ChatbotContext,
    ChatbotIntent,
    CompanyIntent,
    RetrievedKnowledge,
} from './chatbot.types';

import {
    retrieveIntentKnowledge,
    retrieveBroadEvidence,
} from './chatbot.retrieval';
import {
    selectRelevantEvidence,
} from './chatbot.evidence';

import {
    intentFallback,
} from './chatbot.fallback';

import {
    cleanChatbotReply,
    synthesizeEvidence,
} from './chatbot.response';
import {
    GENERAL_TOURISM_SYSTEM_PROMPT,
    buildGroundedAnswerPrompt,
} from './chatbot.prompt';

/**
 * User-facing message for OpenRouter/provider failures.
 *
 * Never expose the actual provider error to the user.
 */
function providerFailureMessage(
    error: any
): string {
    if (error?.status === 429) {
        return 'The AI assistant has reached its current usage limit. Please try again later.';
    }

    if (
        error?.status === 401 ||
        error?.status === 403
    ) {
        return 'The AI assistant is temporarily unavailable. Please try again later.';
    }

    return 'I’m unable to provide a response right now. Please try again later.';
}

/**
 * Generate educational answers only for related tourism questions.
 */
async function generateGeneralAnswer(
    message: string,
    openai: OpenAI,
    model: string
): Promise<string> {
    try {
        const response = await openai.chat.completions.create({
            model,
            temperature: 0.3,
            messages: [
                {
                    role: 'system',
                    content: GENERAL_TOURISM_SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: message,
                },
            ],
        });

        const raw = response.choices[0]?.message?.content ?? '';
        const cleaned = cleanChatbotReply(raw);

        if (!cleaned.trim()) {
            return intentFallback(message, 'GENERAL_TOURISM');
        }

        return cleaned;
    } catch (error) {
        console.error('[chatbot] general answer failed:', error);
        return intentFallback(message, 'GENERAL_TOURISM');
    }
}

/**
 * Generate the final company-specific answer using ONLY
 * the evidence accepted by semantic selection or the intent-safe filter.
 */
async function generateGroundedAnswer(
    message: string,
    intent: ChatbotIntent,
    knowledge: RetrievedKnowledge[],
    openai: OpenAI,
    model: string,
    contexts: ChatbotContext[] = []
): Promise<string> {
    // Extractive synthesized fallback eliminates raw paragraph dumps & duplicate caveats.
    const evidenceAnswer = () => synthesizeEvidence(message, intent, knowledge, contexts);

    const safeSources = knowledge.map((item, index) => ({
        index,
        title: item.title ?? '',
        category: item.category ?? '',
        sourceType: item.sourceType ?? '',
        sourceName: item.sourceName ?? '',
        content: item.content ?? '',
    }));

    try {
        const response = await openai.chat.completions.create({
            model,
            temperature: 0.2,
            messages: [
                {
                    role: 'system',
                    content: buildGroundedAnswerPrompt(JSON.stringify(safeSources)),
                },
                {
                    role: 'user',
                    content: message,
                },
            ],
        });

        const raw = response.choices[0]?.message?.content ?? '';
        const cleaned = cleanChatbotReply(raw);

        /**
         * Important: Empty AI output must NOT become generic welcome.
         * Preserve the selected evidence when the provider cannot summarize it.
         */
        if (!cleaned.trim() || response.choices[0]?.finish_reason === 'length'
            || /^(?:thinking process|here['\u2019]s a thinking process|response safety:)/i.test(cleaned)) {
            return evidenceAnswer();
        }

        return cleaned;
    } catch (error) {
        console.error('[chatbot] grounded answer failed:', error);
        return evidenceAnswer();
    }
}

async function answerCompanyQuestion(
    message: string,
    question: string,
    intent: CompanyIntent,
    openai: OpenAI,
    model: string,
    contexts: ChatbotContext[] = []
): Promise<string> {
    let knowledge: RetrievedKnowledge[] = [];

    try {
        knowledge = await retrieveIntentKnowledge(question, intent, contexts);
    } catch (error) {
        console.error('[chatbot] retrieval failed:', error);
        return intentFallback(message, intent);
    }

    // NO VERIFIED KNOWLEDGE
    if (!knowledge.length) {
        return intentFallback(message, intent);
    }

    // SELECT RELEVANT EVIDENCE
    let selected: RetrievedKnowledge[] = [];

    try {
        selected = await selectRelevantEvidence(
            question,
            intent,
            knowledge,
            openai,
            model
        );
    } catch (error) {
        console.error('[chatbot] evidence selection failed:', error);
        return intentFallback(message, intent);
    }

    // NO ACCEPTED EVIDENCE
    if (!selected.length) {
        return intentFallback(message, intent);
    }

    // FINAL GROUNDED ANSWER
    return generateGroundedAnswer(
        question,
        intent,
        selected,
        openai,
        model,
        contexts
    );
}

/**
 * Main chatbot orchestration.
 */
export async function generateChatReply(
    message: string,
    history: string[] = []
): Promise<string> {
    // STEP 0: VALIDATE CONFIGURATION
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    const model = process.env.OPENROUTER_MODEL?.trim();

    if (!apiKey || !model) {
        return 'The AI assistant is temporarily unavailable. Please try again later.';
    }

    const openai = new OpenAI({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
    });

    // STEP 1: CLASSIFY USER INTENT & CHECK MULTI-INTENT
    const contexts = detectContexts(message);
    const parts = detectCompanyQuestions(message);
    if (parts.length > 1) {
        const sections: string[] = [];
        for (const part of parts) {
            let answer: string;
            const subContexts = detectContexts(part.question);
            const { dataSource } = detectDataSource(part.question, part.intent);

            if (dataSource === 'LIVE_DATA') {
                const liveAnswer = await handleLiveQuery(part.intent, part.question);
                if (liveAnswer) {
                    answer = liveAnswer;
                } else if (part.intent === 'GENERAL_TOURISM') {
                    answer = await generateGeneralAnswer(
                        part.question,
                        openai,
                        model
                    );
                } else {
                    // Fall back to RAG on live-service failure
                    answer = await answerCompanyQuestion(
                        part.question,
                        contextualizeQuestion(part.question, history),
                        part.intent,
                        openai,
                        model,
                        subContexts.length ? subContexts : contexts
                    );
                }
            } else if (part.intent === 'GENERAL_TOURISM') {
                answer = await generateGeneralAnswer(
                    part.question,
                    openai,
                    model
                );
            } else {
                answer = await answerCompanyQuestion(
                    part.question,
                    contextualizeQuestion(part.question, history),
                    part.intent,
                    openai,
                    model,
                    subContexts.length ? subContexts : contexts
                );
            }
            const label = part.intent.toLowerCase().split('_')
                .map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
            sections.push(`${label}:\n${answer}`);
        }
        return sections.join('\n\n');
    }

    let intent: ChatbotIntent;

    try {
        intent = await classifyIntent(
            message,
            openai,
            model,
            history
        );
    } catch (error) {
        console.error('[chatbot] classification failed:', error);
        return providerFailureMessage(error);
    }

    // STEP 2: LIVE DATA ROUTING (Live backend/database services for current-state queries)
    const { dataSource } = detectDataSource(message, intent);
    if (dataSource === 'LIVE_DATA') {
        const liveAnswer = await handleLiveQuery(intent, message);
        if (liveAnswer) {
            return liveAnswer;
        }
    }

    // STEP 3: GENERAL QUESTIONS
    if (intent === 'GENERAL_TOURISM') {
        return generateGeneralAnswer(
            message,
            openai,
            model
        );
    }

    // STEP 3: UNKNOWN & GENERAL
    if (intent === 'UNKNOWN' || intent === 'GENERAL') {
        const question = contextualizeQuestion(message, history);
        const evidence = await retrieveBroadEvidence(question, openai, model);
        if (evidence.length) {
            return generateGroundedAnswer(question, intent, evidence, openai, model, contexts);
        }
        return intentFallback(message, intent);
    }

    const question = contextualizeQuestion(message, history);

    // STEP 4: COMPANY-SPECIFIC RAG
    if (isCompanyIntent(intent)) {
        return answerCompanyQuestion(message, question, intent, openai, model, contexts);
    }

    // DEFENSIVE FALLBACK
    return intentFallback(message, intent);
}

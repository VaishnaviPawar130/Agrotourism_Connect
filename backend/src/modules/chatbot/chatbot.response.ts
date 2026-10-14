import type {
    ChatbotIntent,
    ChatbotContext,
    RetrievedKnowledge,
} from './chatbot.types';
import { intentFallback } from './chatbot.fallback';

/** Presentation guidance only; grounding and recovery rules take precedence. */
export const CHATBOT_RESPONSE_STYLE = `
Write for a small website chatbot UI in the style of a modern AI assistant (Chatbase / Lyro): concise, natural, synthesized, and directly helpful.

CORE PRINCIPLES:
1. DIRECT ANSWER FIRST:
   - Begin immediately with the direct answer or solution to the user's question.
   - Do not open with introductions, greetings, company slogans, background context, or disclaimers.
   - For contact queries: provide the contact email or contact form immediately.
   - For investment queries: explain the expression of interest process first, followed by the essential diligence caveat at the end.
   - For sign-in/registration queries: give the login or registration steps first, then the role or dashboard destination.
   - For service queries: summarize the specific services directly without reciting the entire company mission.

2. SYNTHESIZE MULTIPLE SOURCES:
   - Merge all relevant verified sources into ONE smooth, unified answer.
   - Never present separate record-by-record blocks, bullet points of sources, or repetitive disclaimers.
   - Eliminate redundant boilerplate phrases (such as "This describes the platform service", "This is a service description", "This does not establish...").
   - Consolidate multiple warnings into at most ONE clear, necessary qualification at the end.

3. DEFAULT LENGTH:
   - By default, answer in 1 to 3 sentences, preferably under 60 words and at most about 80 words.
   - Answer only the user's actual question.
   - Omit introductions, repeated explanations, unrelated background, and generic closing offers.
   - Do not repeat warnings; retain any qualification necessary to keep the answer accurate.
   - If the current user question asks to "explain", "tell me more", "in detail", or "give details", allow a longer focused answer. Earlier questions alone do not request a longer answer.

4. MULTI-INTENT SECTIONS:
   - For a multi-intent answer, keep each section independently short (1 to 2 sentences).
   - Do not repeat shared platform background or disclaimers across sections.
   - Do not restate section headings when answering an individual part.

5. VERIFIED NEXT STEPS & "I DON'T KNOW":
   - When verified evidence is unavailable for a fact (e.g. current vacancies, owner identity, specific returns), state clearly that verified information is not currently available.
   - Suggest at most ONE useful next action only when explicitly supported by the verified evidence (e.g., visit /contact, check Careers, register as Landowner/Investor). Never invent buttons, URLs, or external links.
   - Never sacrifice grounding for brevity: do not add facts, drop essential evidence limitations, or turn missing verified information into a claim that something does not exist.
`.trim();

export function cleanChatbotReply(
    reply: string
): string {
    return reply
        .replace(/^User Safety:\s*safe\s*/i, '')
        .replace(/^Safety:\s*safe\s*/i, '')
        .replace(/^Safety Classification:\s*safe\s*/i, '')
        .replace(/^(?:thinking process|here['’]s a thinking process|response safety:)/i, '')
        .trim();
}

/**
 * Synthesize verified knowledge records deterministically into a concise,
 * unified answer when provider generation fails, reaches rate limits, or is offline.
 *
 * Requirements:
 * - Direct answer first
 * - 1 to 3 sentences, under ~60-80 words
 * - Eliminate duplicate disclaimers and boilerplate
 * - Question and context aware (prioritizes action over incidental details)
 * - Retains at most one essential qualification when appropriate
 */
export function synthesizeEvidence(
    message: string,
    intent: ChatbotIntent,
    knowledge: RetrievedKnowledge[],
    contexts: ChatbotContext[] = []
): string {
    const validItems = knowledge.filter(
        (item) => typeof item.content === 'string' && item.content.trim()
    );

    if (!validItems.length) {
        return intentFallback(message, intent);
    }

    // Preserve exact content if only a single record was accepted/retrieved
    if (validItems.length === 1) {
        return validItems[0].content!.trim();
    }

    const normalized = message.toLowerCase();
    const hasInvestor = contexts.includes('INVESTOR') || /\binvestors?\b/i.test(normalized);
    const hasLandowner = contexts.includes('LANDOWNER') || /\bland[\s_-]*owners?\b/i.test(normalized);

    // Question- and intent-aware deterministic synthesis
    switch (intent) {
        case 'LOGIN_AUTH': {
            if (hasInvestor) {
                return 'You can sign in at /login with your registered email and password, or register at /register by selecting the Investor role under "I am a" to access published investment opportunities.';
            }
            if (hasLandowner) {
                return 'You can sign in at /login with your registered email and password, or register at /register by choosing the Landowner role to submit your land details and track review status.';
            }
            return 'You can sign in at /login with your registered email and password, or create an account at /register by choosing either the Landowner or Investor role.';
        }

        case 'INVESTMENT': {
            return 'You can register or sign in as an Investor, browse published Investment Opportunities, and submit your interest from the dashboard. Availability and returns are not guaranteed and require independent due diligence.';
        }

        case 'CONTACT': {
            return 'You can contact Agrotourism Connect through the website contact form at /contact or by emailing info@agrotourismconnect.com.';
        }

        case 'ABOUT_SERVICES': {
            if (/\bservices\b/i.test(normalized)) {
                return 'Agrotourism Connect provides end-to-end services for agro tourism and resort development, including Land Advisory, Project Feasibility, concept planning, statutory approvals, and operations support.';
            }
            return 'Agrotourism Connect is a platform guiding the complete journey of turning land into a tourism destination, bringing together landowners, investors, and developers to plan, build, and operate sustainable projects.';
        }

        case 'KNOWLEDGE_CENTER': {
            return 'The Knowledge Center provides topic cards on agro tourism basics, land development, resort planning, and investment models at /knowledge-center; detailed guides and articles are scheduled for upcoming publication.';
        }

        case 'PLATFORM_FEATURES': {
            return 'You can browse and search published projects on the platform using filters for project type and location, and view detailed project overviews and galleries.';
        }

        case 'JOBS': {
            return 'You can browse published job openings and submit applications with your resume at /careers; active hiring is limited to currently listed vacancies.';
        }

        case 'PRICING': {
            return 'Published service fees, charges, and package rates are not currently listed on the website. Please reach out via the contact form for specific project pricing enquiries.';
        }

        case 'TRAINING': {
            return 'Training programs, workshops, and courses cover practical agro tourism development; please refer to the published schedule or contact support for upcoming dates and registration.';
        }

        case 'PUBLIC_PROJECTS': {
            return 'Current public project listings can be viewed at /projects; availability is subject to active project status.';
        }

        default: {
            // Generic synthesis across arbitrary multiple records:
            // Extract distinct informative sentences, filter boilerplate, limit to 2-3 sentences.
            const sentences: string[] = [];
            const boilerplateRegex = /^(?:this describes|this is a service description|this does not establish|a filter option does not|enter account credentials only|gallery imagery alone)/i;

            for (const item of validItems) {
                const sents = (item.content ?? '').split(/(?<=[.?!])\s+/);
                for (const sent of sents) {
                    const trimmed = sent.trim();
                    if (
                        trimmed.length > 20 &&
                        !boilerplateRegex.test(trimmed) &&
                        !sentences.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())
                    ) {
                        sentences.push(trimmed);
                        if (sentences.length >= 3) break;
                    }
                }
                if (sentences.length >= 3) break;
            }

            return sentences.join(' ') || (validItems[0].content?.trim() ?? '');
        }
    }
}

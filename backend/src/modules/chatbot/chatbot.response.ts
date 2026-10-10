/** Presentation guidance only; grounding and recovery rules take precedence. */
export const CHATBOT_RESPONSE_STYLE = `
Write for a small website chatbot UI.
By default, answer in 1 to 3 sentences, preferably under 60 words and at most about 80 words.
Answer only the user's actual question. Start with the useful answer or action.
Omit introductions, repeated explanations, unrelated background, and generic closing offers.
Do not repeat warnings; retain any qualification necessary to keep the answer accurate.
If the current user question asks to "explain", "tell me more", "in detail", or "give details",
allow a longer focused answer. Earlier questions alone do not request a longer answer.
For a multi-intent answer, keep each section independently short; expand only a part requesting detail.
Do not restate section headings when answering an individual part.
Never sacrifice grounding for brevity: do not add facts, drop essential evidence limitations,
or turn missing verified information into a claim that something does not exist.
`.trim();

export function cleanChatbotReply(
    reply: string
): string {
    return reply
        .replace(
            /^User Safety:\s*safe\s*/i,
            ''
        )
        .replace(
            /^Safety:\s*safe\s*/i,
            ''
        )
        .replace(
            /^Safety Classification:\s*safe\s*/i,
            ''
        )
        .trim();
}

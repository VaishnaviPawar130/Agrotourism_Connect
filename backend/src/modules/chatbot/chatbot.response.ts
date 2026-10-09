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
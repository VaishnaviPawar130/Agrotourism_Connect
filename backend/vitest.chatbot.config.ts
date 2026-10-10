import { defineConfig } from 'vitest/config';

// Chatbot unit tests mock all external services and need no MongoDB setup.
export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/test/chatbot.test.ts', 'src/test/chatbot.knowledge.test.ts', 'src/test/chatbot.recovery.test.ts'],
    },
});

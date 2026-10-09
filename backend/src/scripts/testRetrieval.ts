import 'dotenv/config';
import mongoose from 'mongoose';
import { retrieveIntentKnowledge } from '../modules/chatbot/chatbot.evidence';
import { KnowledgeChunk } from '../modules/chatbot/knowledge/knowledge.model';
import { PUBLIC_KNOWLEDGE } from '../modules/chatbot/publicKnowledge/publicKnowledge.data';
import dns from 'node:dns';
import type { CompanyIntent } from '../modules/chatbot/chatbot.intent';

dns.setServers(['8.8.8.8', '1.1.1.1']);
const questions = [
    'What does your project do?',
    'What does this platform do?',
    'What is Agrotourism Connect?',
    'What services do you provide?',
    'How can you help a landowner?',
];

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/agrotourism_connect', {
            serverSelectionTimeoutMS: 10000,
        });
        const stored = await KnowledgeChunk.find({
            visibility: 'PUBLIC', 'metadata.managedBy': 'public-website-sync',
        }).select('sourceId content').lean();
        const missing = PUBLIC_KNOWLEDGE.filter((record) =>
            !stored.some((item) => item.sourceId === record.sourceId && item.content === record.content));
        console.log(`[rag:test-retrieval] ${stored.length} synced public records; ${missing.length} records missing or outdated.`);
        if (missing.length) {
            console.log('[rag:test-retrieval] Re-sync with: npm run rag:sync-public');
            process.exitCode = 1;
        }
        for (const question of questions) {
            const results = await retrieveIntentKnowledge(question, 'ABOUT_SERVICES');
            const supported = results.some((item) =>
                ['COMPANY', 'SERVICE'].includes(item.sourceType ?? '') && Boolean(item.content?.trim()));
            console.log(JSON.stringify({
                question, intent: 'ABOUT_SERVICES', passed: supported,
                titles: results.map((item) => item.title)
            }));
            if (!supported) process.exitCode = 1;
        }
        const topicChecks: { question: string; intent: CompanyIntent; expected: string }[] = [
            { question: 'What is Knowledge Center here?', intent: 'KNOWLEDGE_CENTER', expected: 'knowledge:center-overview' },
            { question: 'What topics does Knowledge Center contain?', intent: 'KNOWLEDGE_CENTER', expected: 'knowledge:center-topics' },
            { question: 'How do I browse projects?', intent: 'PLATFORM_FEATURES', expected: 'website:project-search' },
            { question: 'What is the email?', intent: 'CONTACT', expected: 'contact:email-location' },
            { question: 'How do I register?', intent: 'LOGIN_AUTH', expected: 'auth:registration' },
            { question: 'How can I express investment interest?', intent: 'INVESTMENT', expected: 'investment:express-interest' },
        ];
        for (const { question, intent, expected } of topicChecks) {
            const results = await retrieveIntentKnowledge(question, intent);
            const passed = results.some((item) => item.sourceId === expected);
            console.log(JSON.stringify({ question, intent, passed, titles: results.map((item) => item.title) }));
            if (!passed) process.exitCode = 1;
        }
        const projects = await retrieveIntentKnowledge('What projects are available?', 'PUBLIC_PROJECTS');
        const isolated = projects.every((item) => item.sourceType === 'PROJECT');
        console.log(JSON.stringify({
            intent: 'PUBLIC_PROJECTS', passed: isolated, count: projects.length,
            note: projects.length ? 'Only project records returned.' : 'No public project evidence; use the project fallback.'
        }));
        if (!isolated) process.exitCode = 1;
    } catch (error) {
        console.error('[rag:test-retrieval] Failed:', error instanceof Error ? error.name : 'UnknownError');
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

run();

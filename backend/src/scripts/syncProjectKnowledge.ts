import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { syncPublicProjectsToKnowledge } from '../modules/chatbot/projectKnowledge/projectKnowledge.service';

async function main() {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
        throw new Error('No live MongoDB connection — aborting sync.');
    }

    const result = await syncPublicProjectsToKnowledge();
    console.log(`[rag:sync-projects] Synced ${result.synced} public project(s) to knowledge_chunks.`);

    await mongoose.disconnect();
    console.log('[rag:sync-projects] Done.');
}

main().catch(async (err) => {
    console.error('[rag:sync-projects] Failed:', err);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
});

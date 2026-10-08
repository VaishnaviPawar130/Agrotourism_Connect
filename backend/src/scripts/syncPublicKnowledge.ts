import 'dotenv/config';
import mongoose from 'mongoose';
import { syncPublicKnowledge } from '../modules/chatbot/publicKnowledge/publicKnowledge.service';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);
async function run() {
    try {
        const planned = await syncPublicKnowledge({ dryRun: true });
        if (process.argv.includes('--dry-run')) {
            console.log(`[rag:sync-public] Validated ${planned.planned} public records; no database or embedding calls made.`);
            return;
        }
        // Fail promptly instead of continuing with a disconnected/buffering model.
        await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/agrotourism_connect', {
            serverSelectionTimeoutMS: 10000,
        });
        const result = await syncPublicKnowledge();
        console.log(`[rag:sync-public] Synced ${result.synced} public records into knowledgechunks.`);
    } catch (error) {
        // Do not print provider responses, connection strings or database host details.
        console.error('[rag:sync-public] Failed:', error instanceof Error ? error.name : 'UnknownError');
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

run();

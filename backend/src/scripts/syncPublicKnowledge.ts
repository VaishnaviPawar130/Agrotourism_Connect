import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { syncPublicKnowledge } from '../modules/chatbot/publicKnowledge/publicKnowledge.service';

async function run() {
    try {
        await connectDB();

        console.log('[debug] Mongo host:', mongoose.connection.host);
        console.log('[debug] Mongo database:', mongoose.connection.name);

        const result = await syncPublicKnowledge();

        console.log(
            `[rag:sync-public] Synced ${result.synced} public knowledge record(s).`
        );

        console.log(
            '[debug] knowledge count:',
            await mongoose.connection
                .collection('knowledgechunks')
                .countDocuments()
        );

    } catch (error) {
        console.error('[rag:sync-public] Failed:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

run();
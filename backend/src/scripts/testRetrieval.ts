import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { retrieveRelevantKnowledge } from '../modules/chatbot/retrieval/retrieval.service';

async function run() {
    try {
        await connectDB();

        const results = await retrieveRelevantKnowledge(
            'What services does Agrotourism Connect provide?'
        );

        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('[rag:test-retrieval] Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();

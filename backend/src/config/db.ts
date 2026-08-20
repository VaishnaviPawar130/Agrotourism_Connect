import mongoose from 'mongoose';
import { env } from './env';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDB(): Promise<void> {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      console.log(`[db] Connected to MongoDB at ${env.MONGODB_URI}`);
      return;
    } catch (err) {
      attempt += 1;
      console.error(`[db] MongoDB connection attempt ${attempt} failed:`, (err as Error).message);
      if (attempt >= MAX_RETRIES) {
        console.error('[db] Max retries reached. Continuing without a live DB connection.');
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[db] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[db] MongoDB connection error:', err.message);
});

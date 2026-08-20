import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

async function main() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`[server] Agrotourism Connect API running on port ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});

import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

async function main() {
  await connectDB();
  // Bind to 0.0.0.0 (not just localhost) so the process is reachable from
  // outside its container — required on Railway and similar PaaS hosts.
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`[server] Agrotourism Connect API running on port ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});

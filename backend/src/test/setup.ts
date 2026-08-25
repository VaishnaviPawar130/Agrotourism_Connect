import { beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

/**
 * Starts one in-memory MongoDB instance for the test run and points
 * MONGODB_URI at it. This must run — and MONGODB_URI must be set — before
 * any module that reads `env.MONGODB_URI` (src/config/env.ts, a top-level
 * const evaluated at import time) is imported. Test files therefore import
 * the app/db modules with a dynamic `await import(...)` inside a `beforeAll`,
 * never as a static top-level import, so this setup always runs first.
 *
 * Using a real, isolated in-memory database (rather than mocks) means these
 * tests exercise the actual Mongoose schema/queries — and can never touch
 * the real dev/prod database, since MONGODB_URI is overridden here.
 */
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_SECRET = 'test_secret_for_vitest_only_not_used_anywhere_else';
  process.env.NODE_ENV = 'test';

  // app.ts never connects to the database itself (only server.ts's main()
  // does, via connectDB() — which these tests never run), so the connection
  // has to be established here, against the in-memory instance above.
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod?.stop();
});

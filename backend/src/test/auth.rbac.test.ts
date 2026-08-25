import { describe, it, expect, beforeAll } from 'vitest';
import type { Express } from 'express';
import request from 'supertest';

/**
 * Regression coverage for the staff role-leak investigation: a SUPER_ADMIN
 * invites a PROJECT_MANAGER, and every layer (login response, JWT, /users/me,
 * RBAC-gated routes) must reflect PROJECT_MANAGER — never the inviting
 * SUPER_ADMIN's role — both at login time and after a live role/status
 * change, without requiring the client to log in again.
 *
 * The app/db modules are imported dynamically inside `beforeAll`, after
 * `src/test/setup.ts` (registered via vitest.config.ts `setupFiles`) has
 * already started an in-memory MongoDB and set MONGODB_URI — env.ts reads
 * that value once, at import time, so importing app.ts too early would
 * connect to whatever MONGODB_URI happened to be set beforehand (e.g. the
 * real dev database from a stray .env), not the isolated test instance.
 */

let app: Express;
// Logged in once in beforeAll and reused by every test — auth endpoints are
// rate-limited (see middleware/rateLimit.ts authRateLimit, 20 req/15min per
// IP), which is real, intentional production behavior that these tests must
// respect rather than work around, so each test logs in as SUPER_ADMIN as
// rarely as possible.
let superAdminToken: string;

const SUPER_ADMIN = { fullName: 'Test Super Admin', email: 'super@rbac-test.local', mobile: '9000000001', password: 'SuperSecret@123' };

async function seedSuperAdmin() {
  const { User } = await import('../modules/users/user.model');
  const { UserRole, UserStatus } = await import('../modules/users/user.types');
  const bcrypt = (await import('bcryptjs')).default;

  await User.create({
    fullName: SUPER_ADMIN.fullName,
    email: SUPER_ADMIN.email,
    mobile: SUPER_ADMIN.mobile,
    passwordHash: await bcrypt.hash(SUPER_ADMIN.password, 10),
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
  });
}

beforeAll(async () => {
  const appModule = await import('../app');
  app = appModule.default;
  await seedSuperAdmin();

  const loginRes = await request(app).post('/api/v1/auth/login').send({ email: SUPER_ADMIN.email, password: SUPER_ADMIN.password });
  superAdminToken = loginRes.body.data.token;
});

async function loginAs(email: string, password: string) {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  expect(res.status).toBe(200);
  return res.body.data as { user: { role: string }; token: string };
}

function decodeJwtPayload(token: string): { role: string; id: string } {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
}

async function inviteAndAcceptProjectManager(superAdminToken: string, email: string) {
  const inviteRes = await request(app)
    .post('/api/v1/users/staff')
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ fullName: 'Test PM', email, mobile: '9000000002', role: 'PROJECT_MANAGER' });
  expect(inviteRes.status).toBe(201);
  expect(inviteRes.body.data.staff.role).toBe('PROJECT_MANAGER');

  const inviteToken = inviteRes.body.data.inviteToken as string;
  const acceptRes = await request(app)
    .post('/api/v1/auth/reset-password')
    .send({ token: inviteToken, newPassword: 'PmSecret@123' });
  expect(acceptRes.status).toBe(200);

  return { userId: inviteRes.body.data.staff._id as string };
}

describe('Staff invite → login role integrity', () => {
  it('1. PROJECT_MANAGER login returns role PROJECT_MANAGER', async () => {
    await inviteAndAcceptProjectManager(superAdminToken, 'pm1@rbac-test.local');

    const { user } = await loginAs('pm1@rbac-test.local', 'PmSecret@123');
    expect(user.role).toBe('PROJECT_MANAGER');
    expect(user.role).not.toBe('SUPER_ADMIN');
  });

  it('2. /users/me returns PROJECT_MANAGER for the PM session', async () => {
    await inviteAndAcceptProjectManager(superAdminToken, 'pm2@rbac-test.local');

    const { token: pmToken } = await loginAs('pm2@rbac-test.local', 'PmSecret@123');
    const meRes = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${pmToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.role).toBe('PROJECT_MANAGER');
  });

  it('3. PROJECT_MANAGER never receives SUPER_ADMIN permissions (staff-management route is forbidden)', async () => {
    await inviteAndAcceptProjectManager(superAdminToken, 'pm3@rbac-test.local');

    const { token: pmToken } = await loginAs('pm3@rbac-test.local', 'PmSecret@123');
    // Listing staff is SUPER_ADMIN/ADMIN only — a PM must be rejected.
    const staffListRes = await request(app).get('/api/v1/users/staff').set('Authorization', `Bearer ${pmToken}`);
    expect(staffListRes.status).toBe(403);

    // A PM must not be able to invite another staff member either.
    const inviteAttempt = await request(app)
      .post('/api/v1/users/staff')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ fullName: 'Should Fail', email: 'should-fail@rbac-test.local', mobile: '9000000003', role: 'PROJECT_MANAGER' });
    expect(inviteAttempt.status).toBe(403);
  });

  it('4. SUPER_ADMIN remains SUPER_ADMIN after inviting a PROJECT_MANAGER', async () => {
    const meBefore = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${superAdminToken}`);
    expect(meBefore.body.data.role).toBe('SUPER_ADMIN');

    await inviteAndAcceptProjectManager(superAdminToken, 'pm4@rbac-test.local');

    // The Super Admin's own session must be completely unaffected by having
    // just created a PROJECT_MANAGER account.
    const meAfter = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${superAdminToken}`);
    expect(meAfter.body.data.role).toBe('SUPER_ADMIN');
  });

  it('5. A role change in the DB takes effect immediately, without re-login', async () => {
    const { userId } = await inviteAndAcceptProjectManager(superAdminToken, 'pm5@rbac-test.local');
    const { token: pmToken } = await loginAs('pm5@rbac-test.local', 'PmSecret@123');

    // Still forbidden before the promotion.
    let staffListRes = await request(app).get('/api/v1/users/staff').set('Authorization', `Bearer ${pmToken}`);
    expect(staffListRes.status).toBe(403);

    // Super Admin promotes the PM to ADMIN.
    const promoteRes = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ role: 'ADMIN' });
    expect(promoteRes.status).toBe(200);
    expect(promoteRes.body.data.role).toBe('ADMIN');

    // The SAME still-valid PM-issued token must now be treated as ADMIN —
    // proving authorization reads the current DB role, not the stale JWT claim.
    staffListRes = await request(app).get('/api/v1/users/staff').set('Authorization', `Bearer ${pmToken}`);
    expect(staffListRes.status).toBe(200);

    const meRes = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${pmToken}`);
    expect(meRes.body.data.role).toBe('ADMIN');
  });

  it('6. An INACTIVE user is denied access on the very next request', async () => {
    const { userId } = await inviteAndAcceptProjectManager(superAdminToken, 'pm6@rbac-test.local');
    const { token: pmToken } = await loginAs('pm6@rbac-test.local', 'PmSecret@123');

    const meBefore = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${pmToken}`);
    expect(meBefore.status).toBe(200);

    const deactivateRes = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ status: 'INACTIVE' });
    expect(deactivateRes.status).toBe(200);

    const meAfter = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${pmToken}`);
    expect(meAfter.status).toBe(403);
    expect(meAfter.body.message).toMatch(/inactive/i);
  });

  it('7. A stale JWT role claim never overrides the current DB role', async () => {
    const { userId } = await inviteAndAcceptProjectManager(superAdminToken, 'pm7@rbac-test.local');
    const { token: pmToken } = await loginAs('pm7@rbac-test.local', 'PmSecret@123');

    const payload = decodeJwtPayload(pmToken);
    expect(payload.role).toBe('PROJECT_MANAGER');

    // Demote/change the DB role directly to something the JWT claim does not say.
    await request(app).patch(`/api/v1/users/${userId}`).set('Authorization', `Bearer ${superAdminToken}`).send({ role: 'ADMIN' });

    // The JWT payload itself is unchanged (still says PROJECT_MANAGER) — but
    // every authorization decision must use the freshly-loaded DB role.
    const staffListRes = await request(app).get('/api/v1/users/staff').set('Authorization', `Bearer ${pmToken}`);
    expect(staffListRes.status).toBe(200); // only passes because the server used ADMIN, not the stale PROJECT_MANAGER claim

    const meRes = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${pmToken}`);
    // The DB role (ADMIN) wins over the token's original embedded claim (PROJECT_MANAGER).
    expect(meRes.body.data.role).toBe('ADMIN');
    expect(meRes.body.data.role).not.toBe(payload.role);
  });
});

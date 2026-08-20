import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../modules/users/user.model';
import { UserRole, UserStatus } from '../modules/users/user.types';
import mongoose from 'mongoose';

const SUPER_ADMIN_EMAIL = 'pawarvaishu15@gmail.com';
const SUPER_ADMIN_PASSWORD = 'AgroConnect@2026';

async function seed() {
  await connectDB();

  const existing = await User.findOne({ email: SUPER_ADMIN_EMAIL });
  if (existing) {
    console.log(`[seed] Super Admin already exists: ${SUPER_ADMIN_EMAIL}`);
  } else {
    const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
    await User.create({
      fullName: 'Super Admin',
      email: SUPER_ADMIN_EMAIL,
      mobile: '9999999999',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    });
    console.log('[seed] Super Admin created:');
    console.log(`        email:    ${SUPER_ADMIN_EMAIL}`);
    console.log(`        password: ${SUPER_ADMIN_PASSWORD}`);
  }

  await mongoose.disconnect();
  console.log('[seed] Done.');
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});

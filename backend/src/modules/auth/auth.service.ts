import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../users/user.model';
import { UserRole, UserStatus } from '../users/user.types';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';
import { RegisterInput, LoginInput, SELF_ASSIGNABLE_ROLES } from './auth.validation';
import { toPublicUser } from '../users/user.serialize';

const BCRYPT_ROUNDS = 12;

function signToken(payload: { id: string; role: UserRole; email: string }) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as SignOptions);
}

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  // `role` is already constrained to the self-assignable set by registerSchema;
  // defaulting here keeps the service safe even if called directly.
  const role = input.role && SELF_ASSIGNABLE_ROLES.includes(input.role) ? input.role : UserRole.LANDOWNER;

  const user = await User.create({
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    mobile: input.mobile,
    passwordHash,
    role,
    city: input.city,
    state: input.state,
    status: UserStatus.ACTIVE,
  });

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return { user: toPublicUser(user), token };
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const match = await bcrypt.compare(input.password, user.passwordHash);
  if (!match) throw ApiError.unauthorized('Invalid email or password');

  if (user.status === UserStatus.BLOCKED) throw ApiError.forbidden('Your account has been blocked');
  if (user.status === UserStatus.INACTIVE) throw ApiError.forbidden('Your account is inactive');

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return { user: toPublicUser(user), token };
}

export async function requestPasswordReset(email: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return null; // do not reveal whether the email exists

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  return rawToken;
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+passwordHash +resetPasswordToken +resetPasswordExpires');

  if (!user) throw ApiError.badRequest('Reset token is invalid or has expired');

  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return user;
}

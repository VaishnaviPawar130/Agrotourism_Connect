import crypto from 'crypto';
import { FilterQuery } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, IUser } from './user.model';
import { UpdateUserInput, CreateStaffInput } from './user.validation';
import { UserRole, UserStatus } from './user.types';
import { ApiError } from '../../utils/ApiError';
import { escapeRegex } from '../../utils/escapeRegex';

export const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];
const CUSTOMER_ROLES = [UserRole.LANDOWNER, UserRole.INVESTOR];
const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function findUserByEmail(email: string, withPassword = false) {
  const query = User.findOne({ email: email.toLowerCase() });
  if (withPassword) query.select('+passwordHash');
  return query.exec();
}

export async function findUserById(id: string) {
  return User.findById(id);
}

/**
 * Shared list query. `roleScope` pins the result to either the customer pool
 * (LANDOWNER/INVESTOR) or the staff pool (SUPER_ADMIN/ADMIN/PROJECT_MANAGER)
 * — the two audiences are never mixed in one listing, so a `role` filter
 * within that scope can only narrow within the caller's own audience.
 */
async function listUsersByScope(
  roleScope: UserRole[],
  params: { page?: number; limit?: number; role?: string; status?: string; search?: string }
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: FilterQuery<IUser> = {
    role: params.role && roleScope.includes(params.role as UserRole) ? params.role : { $in: roleScope },
  };
  if (params.status) filter.status = params.status;
  if (params.search) {
    const term = escapeRegex(params.search);
    filter.$or = [
      { fullName: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
      { mobile: { $regex: term, $options: 'i' } },
    ];
  }
  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

/** Customer-facing user list (Dashboard → Users): LANDOWNER/INVESTOR only. */
export async function listUsers(params: { page?: number; limit?: number; role?: string; status?: string; search?: string }) {
  return listUsersByScope(CUSTOMER_ROLES, params);
}

/** Internal staff list (Dashboard → Staff): SUPER_ADMIN/ADMIN/PROJECT_MANAGER only. */
export async function listStaff(params: { page?: number; limit?: number; role?: string; status?: string; search?: string }) {
  return listUsersByScope(STAFF_ROLES, params);
}

/**
 * Creates an internal staff account with no usable password, and returns a
 * one-time invite token (raw, unhashed) the caller must hand to the new
 * staff member out-of-band. The account is provisioned in PENDING_VERIFICATION
 * status until the invite is accepted via the existing reset-password flow,
 * which sets a real password and clears the token.
 *
 * Permission matrix (enforced here, not just at the route):
 *   - SUPER_ADMIN may create ADMIN or PROJECT_MANAGER.
 *   - ADMIN may create PROJECT_MANAGER only — never ADMIN or SUPER_ADMIN.
 *   - Nobody else may reach this function (route-level `authorize` blocks
 *     PROJECT_MANAGER and customers before it is even called).
 */
export async function createStaff(input: CreateStaffInput, actor: { id: string; role: UserRole }) {
  const isSuperAdmin = actor.role === UserRole.SUPER_ADMIN;
  if (!isSuperAdmin && input.role !== UserRole.PROJECT_MANAGER) {
    throw ApiError.forbidden('Admins may only invite Project Managers');
  }

  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  // The account needs *a* passwordHash to satisfy the schema, but it must
  // never be usable to log in before the invite is accepted — a random,
  // never-returned, never-logged value that is immediately overwritten by
  // resetPassword() once the invite link is used.
  const placeholderPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const staff = await User.create({
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    mobile: input.mobile,
    passwordHash: placeholderPasswordHash,
    role: input.role,
    status: UserStatus.PENDING_VERIFICATION,
    resetPasswordToken: hashedToken,
    resetPasswordExpires: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
  });

  return { staff, inviteToken: rawToken };
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
  actor: { id: string; role: UserRole }
) {
  const target = await User.findById(id);
  if (!target) throw ApiError.notFound('User not found');

  const isSuperAdmin = actor.role === UserRole.SUPER_ADMIN;

  // Only a Super Admin may grant or revoke the Super Admin role, or modify an
  // existing Super Admin. Without this an ADMIN could promote themselves and
  // take irreversible control of the platform.
  if (!isSuperAdmin) {
    if (input.role === UserRole.SUPER_ADMIN) {
      throw ApiError.forbidden('Only a Super Admin can grant the Super Admin role');
    }
    if (target.role === UserRole.SUPER_ADMIN) {
      throw ApiError.forbidden('Only a Super Admin can modify a Super Admin account');
    }
    // An Admin's staff-management remit is limited to Project Managers — they
    // may not touch a fellow Admin's account, nor promote anyone to ADMIN.
    if (input.role === UserRole.ADMIN) {
      throw ApiError.forbidden('Only a Super Admin can grant the Admin role');
    }
    if (STAFF_ROLES.includes(target.role) && target.role !== UserRole.PROJECT_MANAGER) {
      throw ApiError.forbidden('Only a Super Admin can modify this account');
    }
  }

  // A customer (LANDOWNER/INVESTOR) can never be turned into staff, by anyone,
  // through this endpoint — staff accounts are only ever minted by createStaff.
  if (CUSTOMER_ROLES.includes(target.role) && input.role !== undefined && STAFF_ROLES.includes(input.role)) {
    throw ApiError.forbidden('Customers cannot be promoted to staff here — use the staff invite flow');
  }
  // Symmetrically, a staff account can never be demoted into a customer role
  // through this endpoint, to keep the two pools cleanly separated.
  if (STAFF_ROLES.includes(target.role) && input.role !== undefined && CUSTOMER_ROLES.includes(input.role)) {
    throw ApiError.forbidden('Staff accounts cannot be converted to customers');
  }

  // Nobody may change their own role or status — that is a separation-of-duties
  // control and also prevents an accidental self-lockout.
  if (String(target._id) === actor.id && (input.role !== undefined || input.status !== undefined)) {
    throw ApiError.badRequest('You cannot change your own role or status');
  }

  Object.assign(target, input);
  await target.save();
  return target;
}

export async function deleteUser(id: string) {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function changePassword(id: string, oldPassword: string, newPassword: string) {
  const user = await User.findById(id).select('+passwordHash');
  if (!user) throw ApiError.notFound('User not found');
  const match = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!match) throw ApiError.badRequest('Current password is incorrect');
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  return user;
}

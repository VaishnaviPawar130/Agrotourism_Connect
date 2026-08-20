import { FilterQuery } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, IUser } from './user.model';
import { UpdateUserInput } from './user.validation';
import { UserRole } from './user.types';
import { ApiError } from '../../utils/ApiError';
import { escapeRegex } from '../../utils/escapeRegex';

export async function findUserByEmail(email: string, withPassword = false) {
  const query = User.findOne({ email: email.toLowerCase() });
  if (withPassword) query.select('+passwordHash');
  return query.exec();
}

export async function findUserById(id: string) {
  return User.findById(id);
}

export async function listUsers(params: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: FilterQuery<IUser> = {};
  if (params.role) filter.role = params.role;
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

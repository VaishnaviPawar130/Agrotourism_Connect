import { FilterQuery } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, IUser } from './user.model';
import { UpdateUserInput } from './user.validation';
import { ApiError } from '../../utils/ApiError';

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
    filter.$or = [
      { fullName: { $regex: params.search, $options: 'i' } },
      { email: { $regex: params.search, $options: 'i' } },
      { mobile: { $regex: params.search, $options: 'i' } },
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

export async function updateUser(id: string, input: UpdateUserInput) {
  const user = await User.findByIdAndUpdate(id, input, { new: true });
  if (!user) throw ApiError.notFound('User not found');
  return user;
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
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return user;
}

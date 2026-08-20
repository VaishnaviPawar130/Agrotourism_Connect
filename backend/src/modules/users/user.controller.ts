import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { updateUserSchema, changePasswordSchema } from './user.validation';
import * as userService from './user.service';
import { toPublicUser, toPublicUsers } from './user.serialize';
import { ApiError } from '../../utils/ApiError';
import { logAudit } from '../auditLogs/auditLog.service';

export const listUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, role, status, search } = req.query as Record<string, string>;
  const result = await userService.listUsers({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    role,
    status,
    search,
  });
  sendSuccess(res, { ...result, items: toPublicUsers(result.items) }, 'Users fetched');
});

export const getUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.findUserById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  sendSuccess(res, toPublicUser(user), 'User fetched');
});

export const getMeHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.findUserById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');
  sendSuccess(res, toPublicUser(user), 'Current user fetched');
});

export const updateUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateUserSchema.parse(req.body);
  const user = await userService.updateUser(req.params.id, input, req.user!);
  await logAudit({ userId: req.user!.id, action: 'USER_UPDATED', entity: 'User', entityId: user.id });
  sendSuccess(res, toPublicUser(user), 'User updated');
});

export const deleteUserHandler = asyncHandler(async (req: Request, res: Response) => {
  // Guard against an admin deleting their own account and locking the platform out.
  if (req.params.id === req.user!.id) {
    throw ApiError.badRequest('You cannot delete your own account');
  }
  await userService.deleteUser(req.params.id);
  await logAudit({ userId: req.user!.id, action: 'USER_DELETED', entity: 'User', entityId: req.params.id });
  sendSuccess(res, null, 'User deleted');
});

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);
  await userService.changePassword(req.user!.id, oldPassword, newPassword);
  await logAudit({ userId: req.user!.id, action: 'PASSWORD_CHANGED', entity: 'User', entityId: req.user!.id });
  sendSuccess(res, null, 'Password changed successfully');
});

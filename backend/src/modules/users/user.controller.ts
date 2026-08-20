import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { updateUserSchema } from './user.validation';
import * as userService from './user.service';
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
  sendSuccess(res, result, 'Users fetched');
});

export const getUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.findUserById(req.params.id);
  if (!user) return sendSuccess(res, null, 'User not found', 404);
  sendSuccess(res, user, 'User fetched');
});

export const getMeHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.findUserById(req.user!.id);
  sendSuccess(res, user, 'Current user fetched');
});

export const updateUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateUserSchema.parse(req.body);
  const user = await userService.updateUser(req.params.id, input);
  await logAudit({ userId: req.user!.id, action: 'USER_UPDATED', entity: 'User', entityId: user.id });
  sendSuccess(res, user, 'User updated');
});

export const deleteUserHandler = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id);
  await logAudit({ userId: req.user!.id, action: 'USER_DELETED', entity: 'User', entityId: req.params.id });
  sendSuccess(res, null, 'User deleted');
});

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
  await userService.changePassword(req.user!.id, oldPassword, newPassword);
  sendSuccess(res, null, 'Password changed successfully');
});

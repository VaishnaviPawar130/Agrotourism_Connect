import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateObjectId } from '../../middleware/validateObjectId';
import { UserRole } from './user.types';
import * as ctrl from './user.controller';

const router = Router();

router.use(authenticate);

router.get('/me', ctrl.getMeHandler);
router.post('/change-password', ctrl.changePasswordHandler);

router.get('/', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ctrl.listUsersHandler);
router.get('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), validateObjectId(), ctrl.getUserHandler);
router.patch('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), validateObjectId(), ctrl.updateUserHandler);
router.delete('/:id', authorize(UserRole.SUPER_ADMIN), validateObjectId(), ctrl.deleteUserHandler);

export default router;

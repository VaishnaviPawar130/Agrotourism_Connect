import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from './user.types';
import * as ctrl from './user.controller';

const router = Router();

router.use(authenticate);

router.get('/me', ctrl.getMeHandler);
router.post('/change-password', ctrl.changePasswordHandler);

router.get('/', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ctrl.listUsersHandler);
router.get('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ctrl.getUserHandler);
router.patch('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ctrl.updateUserHandler);
router.delete('/:id', authorize(UserRole.SUPER_ADMIN), ctrl.deleteUserHandler);

export default router;

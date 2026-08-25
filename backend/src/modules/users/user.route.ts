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

// Staff (internal team) management — a separate audience from the customer
// listing above. Route-level `authorize` admits SUPER_ADMIN and ADMIN; the
// finer-grained "ADMIN may only invite/manage PROJECT_MANAGER" rule is
// enforced in userService.createStaff / updateUser, since it depends on the
// specific role being granted, not just the actor's own role.
router.get('/staff', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ctrl.listStaffHandler);
router.post('/staff', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ctrl.createStaffHandler);

router.get('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), validateObjectId(), ctrl.getUserHandler);
router.patch('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), validateObjectId(), ctrl.updateUserHandler);
router.delete('/:id', authorize(UserRole.SUPER_ADMIN), validateObjectId(), ctrl.deleteUserHandler);

export default router;

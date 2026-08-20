import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../users/user.types';
import * as ctrl from './project.controller';

const router = Router();
const STAFF = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

// Public routes
router.get('/public', ctrl.listPublicProjectsHandler);
router.get('/public/:slug', ctrl.getPublicProjectBySlugHandler);

// Authenticated / staff routes
router.use(authenticate);
router.post('/', authorize(...STAFF), ctrl.createProjectHandler);
router.get('/', authorize(...STAFF), ctrl.listProjectsHandler);
router.get('/:id', authorize(...STAFF), ctrl.getProjectHandler);
router.patch('/:id', authorize(...STAFF), ctrl.updateProjectHandler);
router.delete('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ctrl.deleteProjectHandler);

export default router;

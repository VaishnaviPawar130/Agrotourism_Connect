import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateObjectId } from '../../middleware/validateObjectId';
import { UserRole } from '../users/user.types';
import * as ctrl from './vacancy.controller';

const router = Router();
const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

// Public routes — read-only, published + non-expired vacancies only.
router.get('/public', ctrl.listPublicVacanciesHandler);
router.get('/public/:id', validateObjectId(), ctrl.getPublicVacancyHandler);

// Staff-only management.
router.use(authenticate);
router.use(authorize(...STAFF_ROLES));

router.post('/', ctrl.createVacancyHandler);
router.get('/', ctrl.listVacanciesHandler);
router.get('/:id', validateObjectId(), ctrl.getVacancyHandler);
router.patch('/:id', validateObjectId(), ctrl.updateVacancyHandler);
router.patch('/:id/status', validateObjectId(), ctrl.updateVacancyStatusHandler);
router.patch('/:id/featured', validateObjectId(), ctrl.setVacancyFeaturedHandler);
router.patch('/:id/urgent', validateObjectId(), ctrl.setVacancyUrgentHandler);
router.delete('/:id', validateObjectId(), ctrl.deleteVacancyHandler);

export default router;

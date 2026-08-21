import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateObjectId } from '../../middleware/validateObjectId';
import { UserRole } from '../users/user.types';
import * as ctrl from './vendor.controller';

const router = Router();
const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

router.use(authenticate);
router.use(authorize(...STAFF_ROLES));

router.post('/', ctrl.createVendorHandler);
router.get('/', ctrl.listVendorsHandler);
router.get('/:id', validateObjectId(), ctrl.getVendorHandler);
router.patch('/:id', validateObjectId(), ctrl.updateVendorHandler);
router.delete('/:id', validateObjectId(), ctrl.deleteVendorHandler);

export default router;

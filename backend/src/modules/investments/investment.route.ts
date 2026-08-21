import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateObjectId } from '../../middleware/validateObjectId';
import { UserRole } from '../users/user.types';
import * as ctrl from './investment.controller';

const router = Router();
const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

router.use(authenticate);
router.use(authorize(...STAFF_ROLES));

router.post('/', ctrl.createInvestmentHandler);
router.get('/', ctrl.listInvestmentsHandler);
router.get('/:id', validateObjectId(), ctrl.getInvestmentHandler);
router.patch('/:id', validateObjectId(), ctrl.updateInvestmentHandler);
router.delete('/:id', validateObjectId(), ctrl.deleteInvestmentHandler);

router.post('/:id/payments', validateObjectId(), ctrl.addPaymentHandler);
router.patch('/:id/payments/:paymentId', validateObjectId('id', 'paymentId'), ctrl.updatePaymentStatusHandler);
router.delete('/:id/payments/:paymentId', validateObjectId('id', 'paymentId'), ctrl.deletePaymentHandler);

export default router;

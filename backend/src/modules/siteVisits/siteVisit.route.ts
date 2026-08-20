import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { UserRole } from '../users/user.types';
import * as ctrl from './siteVisit.controller';

const router = Router();
const STAFF = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

router.use(authenticate, authorize(...STAFF));

router.post('/', ctrl.createSiteVisitHandler);
router.get('/', ctrl.listSiteVisitsHandler);
router.get('/:id', ctrl.getSiteVisitHandler);
router.patch('/:id', ctrl.updateSiteVisitHandler);
router.post('/:id/photos', upload.array('photos', 10), ctrl.uploadSiteVisitPhotosHandler);

export default router;

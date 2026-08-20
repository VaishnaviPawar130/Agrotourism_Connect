import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { validateObjectId } from '../../middleware/validateObjectId';
import { UserRole } from '../users/user.types';
import * as ctrl from './land.controller';

const router = Router();

router.use(authenticate);

router.post('/', ctrl.createLandHandler);
router.get('/', ctrl.listLandsHandler);
router.get('/:id', validateObjectId(), ctrl.getLandHandler);
router.patch('/:id', validateObjectId(), ctrl.updateLandHandler);
router.patch(
  '/:id/status',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validateObjectId(),
  ctrl.updateLandStatusHandler
);
router.post('/:id/files', validateObjectId(), upload.array('files', 10), ctrl.uploadLandFilesHandler);
router.delete('/:id', validateObjectId(), ctrl.deleteLandHandler);

export default router;

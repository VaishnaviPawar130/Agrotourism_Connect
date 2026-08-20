import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { UserRole } from '../users/user.types';
import * as ctrl from './document.controller';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('file'), ctrl.uploadDocumentHandler);
router.get('/', ctrl.listDocumentsHandler);
router.get('/:id/download', ctrl.downloadDocumentHandler);
router.delete('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ctrl.deleteDocumentHandler);

export default router;

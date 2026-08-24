import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateObjectId } from '../../middleware/validateObjectId';
import { publicFormRateLimit } from '../../middleware/rateLimit';
import { resumeUpload } from './resumeUpload';
import { UserRole } from '../users/user.types';
import * as ctrl from './jobApplication.controller';

const router = Router();
const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

// Public, unauthenticated endpoint — rate limited against form/resume spam.
router.post('/', publicFormRateLimit, resumeUpload.single('resume'), ctrl.createJobApplicationHandler);

// Staff-only management.
router.use(authenticate);
router.use(authorize(...STAFF_ROLES));

router.get('/', ctrl.listJobApplicationsHandler);
router.get('/:id', validateObjectId(), ctrl.getJobApplicationHandler);
router.get('/:id/resume', validateObjectId(), ctrl.downloadResumeHandler);
router.patch('/:id/status', validateObjectId(), ctrl.updateApplicationStatusHandler);
router.post('/:id/notes', validateObjectId(), ctrl.addApplicationNoteHandler);

export default router;

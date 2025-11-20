import { Router } from 'express';
import { listTrainingModules, createTrainingModule, listAssignments, completeAssignment } from './training.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.get('/training-modules', requireAuth, listTrainingModules);
router.post('/training-modules', requireAuth, createTrainingModule);
router.get('/users/:userId/training-assignments', requireAuth, listAssignments);
router.patch('/training-assignments/:id/complete', requireAuth, completeAssignment);

export default router;

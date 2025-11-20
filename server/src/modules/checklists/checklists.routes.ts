import { Router } from 'express';
import { listTemplates, createTemplate, startRun, updateRunItem, listRuns, completeRun } from './checklists.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.get('/templates', requireAuth, listTemplates);
router.post('/templates', requireAuth, createTemplate);
router.post('/runs', requireAuth, startRun);
router.get('/runs', requireAuth, listRuns);
router.patch('/runs/:id/complete', requireAuth, completeRun);
router.patch('/run-items/:id', requireAuth, updateRunItem);

export default router;

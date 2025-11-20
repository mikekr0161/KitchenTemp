import { Router } from 'express';
import { listWaste, createWaste, wasteSummary } from './waste.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.get('/locations/:locationId/waste-logs', requireAuth, listWaste);
router.post('/locations/:locationId/waste-logs', requireAuth, createWaste);
router.get('/waste/summary', requireAuth, wasteSummary);

export default router;

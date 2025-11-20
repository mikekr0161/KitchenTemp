import { Router } from 'express';
import { listShifts, createShift, clockIn, clockOut } from './shifts.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.get('/locations/:locationId/shifts', requireAuth, listShifts);
router.post('/locations/:locationId/shifts', requireAuth, createShift);
router.post('/shifts/:id/clock-in', requireAuth, clockIn);
router.post('/shifts/:id/clock-out', requireAuth, clockOut);

export default router;

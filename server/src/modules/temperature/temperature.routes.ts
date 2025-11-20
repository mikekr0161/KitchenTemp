import { Router } from 'express';
import { listEquipment, createEquipment, logTemperature, listLogs } from './temperature.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.get('/locations/:locationId/equipment', requireAuth, listEquipment);
router.post('/locations/:locationId/equipment', requireAuth, createEquipment);
router.get('/equipment/:id/temperature-logs', requireAuth, listLogs);
router.post('/equipment/:id/temperature-logs', requireAuth, logTemperature);

export default router;

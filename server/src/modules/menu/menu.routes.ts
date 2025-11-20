import { Router } from 'express';
import { listMenuItems, createMenuItem, toggleAvailability, listAllergens } from './menu.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.get('/locations/:locationId/menu-items', requireAuth, listMenuItems);
router.post('/locations/:locationId/menu-items', requireAuth, createMenuItem);
router.patch('/menu-items/:id/availability', requireAuth, toggleAvailability);
router.get('/allergens', requireAuth, listAllergens);

export default router;

import { Router } from 'express';
import { getLocations, createLocation, updateLocation } from './locations.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/requireRole';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', requireAuth, getLocations);
router.post('/', requireAuth, requireRole([Role.OWNER, Role.MANAGER]), createLocation);
router.patch('/:id', requireAuth, requireRole([Role.OWNER, Role.MANAGER]), updateLocation);

export default router;

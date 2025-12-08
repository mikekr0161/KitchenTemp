import { Router } from 'express';
import { getExperienceOverview } from './overview.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.get('/overview', requireAuth, getExperienceOverview);

export default router;

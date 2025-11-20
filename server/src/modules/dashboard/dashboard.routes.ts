import { Router } from 'express';
import { getDashboard } from './dashboard.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.get('/', requireAuth, getDashboard);

export default router;

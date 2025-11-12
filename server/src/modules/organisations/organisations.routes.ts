import { Router } from 'express';
import { getMyOrganisation } from './organisations.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.get('/me', requireAuth, getMyOrganisation);

export default router;

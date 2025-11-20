import { Router } from 'express';
import { listNotifications, markNotification } from './notifications.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.get('/notifications', requireAuth, listNotifications);
router.patch('/notifications/:id', requireAuth, markNotification);

export default router;

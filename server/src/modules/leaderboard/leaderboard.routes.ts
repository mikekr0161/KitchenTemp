import { Router } from 'express';
import { venueLeaderboard, staffLeaderboard } from './leaderboard.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.get('/leaderboards/venues', requireAuth, venueLeaderboard);
router.get('/leaderboards/staff', requireAuth, staffLeaderboard);

export default router;

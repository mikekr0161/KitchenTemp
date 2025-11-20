import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/requireAuth';

const prisma = new PrismaClient();

export const venueLeaderboard = async (req: AuthenticatedRequest, res: Response) => {
  const locations = await prisma.venueScore.findMany({
    where: { location: { organisation_id: req.user!.organisationId } },
    include: { location: true },
    orderBy: { total_points: 'desc' },
    take: 10,
  });
  res.json({ data: locations });
};

export const staffLeaderboard = async (req: AuthenticatedRequest, res: Response) => {
  const { locationId } = req.query;
  const staff = await prisma.gamificationPoint.groupBy({
    by: ['user_id'],
    where: { user: { organisation_id: req.user!.organisationId }, ...(locationId ? { user: { user_locations: { some: { location_id: String(locationId) } } } } : {}) },
    _sum: { points: true },
    orderBy: { _sum: { points: 'desc' } },
    take: 10,
  });
  const enriched = await Promise.all(
    staff.map(async (row) => ({
      ...row,
      user: await prisma.user.findUnique({ where: { id: row.user_id } }),
    }))
  );
  res.json({ data: enriched });
};

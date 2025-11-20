import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/requireAuth';
import { z } from 'zod';

const prisma = new PrismaClient();

const wasteSchema = z.object({
  location_id: z.string(),
  ingredient_id: z.string().optional(),
  menu_item_id: z.string().optional(),
  type: z.string(),
  estimated_quantity: z.number(),
  estimated_cost: z.number(),
  notes: z.string().optional(),
});

export const listWaste = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { locationId } = req.params;
    const logs = await prisma.wasteLog.findMany({
      where: { location_id: locationId, location: { organisation_id: req.user!.organisationId } },
      include: { ingredient: true, menu_item: true },
      orderBy: { logged_at: 'desc' },
      take: 50,
    });
    res.json({ data: logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load waste' });
  }
};

export const createWaste = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = wasteSchema.parse(req.body);
    const log = await prisma.wasteLog.create({
      data: {
        ...payload,
        logged_at: new Date(),
        logged_by_user_id: req.user!.id,
      },
    });
    res.status(201).json({ data: log });
  } catch (error) {
    res.status(400).json({ error: 'Invalid waste payload' });
  }
};

export const wasteSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const organisationId = req.user!.organisationId;
    const series = await prisma.$queryRaw<{ week: string; cost: number }[]>`
      SELECT to_char(date_trunc('week', wl."logged_at"), 'IYYY-IW') as week,
             SUM(wl.estimated_cost) as cost
      FROM "WasteLog" wl
      JOIN "Location" l ON wl.location_id = l.id
      WHERE l.organisation_id = ${organisationId}
        AND wl."logged_at" >= NOW() - INTERVAL '90 days'
      GROUP BY 1
      ORDER BY 1
    `;
    res.json({ data: series });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load waste summary' });
  }
};

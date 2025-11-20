import { Response } from 'express';
import { PrismaClient, ShiftStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/requireAuth';
import { z } from 'zod';

const prisma = new PrismaClient();

const shiftSchema = z.object({
  location_id: z.string(),
  user_id: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  status: z.string().optional(),
  source: z.string().optional(),
});

export const listShifts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { locationId } = req.params;
    const shifts = await prisma.shift.findMany({
      where: { location_id: locationId, location: { organisation_id: req.user!.organisationId } },
      include: { user: true, location: true },
      orderBy: { start_time: 'asc' },
      take: 50,
    });
    res.json({ data: shifts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load shifts' });
  }
};

export const createShift = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = shiftSchema.parse(req.body);
    const shift = await prisma.shift.create({
      data: {
        ...payload,
        start_time: new Date(payload.start_time),
        end_time: new Date(payload.end_time),
      },
    });
    res.status(201).json({ data: shift });
  } catch (error) {
    res.status(400).json({ error: 'Invalid shift payload' });
  }
};

export const clockIn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await prisma.timeEntry.create({
      data: {
        shift_id: id,
        user_id: req.user!.id,
        clock_in_time: new Date(),
        clock_in_method: 'MOBILE',
      },
    });
    res.status(201).json({ data: entry });
  } catch (error) {
    res.status(400).json({ error: 'Failed to clock in' });
  }
};

export const clockOut = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await prisma.timeEntry.findFirst({
      where: { shift_id: id, user_id: req.user!.id },
      orderBy: { clock_in_time: 'desc' },
    });
    if (!entry) return res.status(404).json({ error: 'No time entry' });

    const updated = await prisma.timeEntry.update({
      where: { id: entry.id },
      data: { clock_out_time: new Date() },
    });
    await prisma.shift.update({ where: { id }, data: { status: ShiftStatus.COMPLETED } });
    res.json({ data: updated });
  } catch (error) {
    res.status(400).json({ error: 'Failed to clock out' });
  }
};

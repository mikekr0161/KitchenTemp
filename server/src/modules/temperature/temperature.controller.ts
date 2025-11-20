import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/requireAuth';
import { z } from 'zod';

const prisma = new PrismaClient();

const equipmentSchema = z.object({
  name: z.string(),
  type: z.string(),
  target_temp_min: z.number().optional(),
  target_temp_max: z.number().optional(),
  active: z.boolean().optional(),
});

const temperatureSchema = z.object({
  temperature_c: z.number(),
  recorded_at: z.string().optional(),
  notes: z.string().optional(),
});

export const listEquipment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { locationId } = req.params;
    const equipment = await prisma.equipment.findMany({
      where: { location_id: locationId, location: { organisation_id: req.user!.organisationId } },
      include: { temperature_logs: { orderBy: { recorded_at: 'desc' }, take: 1 } },
    });
    res.json({ data: equipment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load equipment' });
  }
};

export const createEquipment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = equipmentSchema.parse(req.body);
    const equipment = await prisma.equipment.create({
      data: {
        ...payload,
        location_id: req.params.locationId,
      },
    });
    res.status(201).json({ data: equipment });
  } catch (error) {
    res.status(400).json({ error: 'Invalid equipment payload' });
  }
};

export const logTemperature = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = temperatureSchema.parse(req.body);
    const equipment = await prisma.equipment.findFirst({
      where: { id: req.params.id, location: { organisation_id: req.user!.organisationId } },
    });
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });

    const is_within_range =
      (equipment.target_temp_min === null || payload.temperature_c >= (equipment.target_temp_min ?? -999)) &&
      (equipment.target_temp_max === null || payload.temperature_c <= (equipment.target_temp_max ?? 999));

    const log = await prisma.temperatureLog.create({
      data: {
        equipment_id: equipment.id,
        user_id: req.user!.id,
        recorded_at: payload.recorded_at ? new Date(payload.recorded_at) : new Date(),
        temperature_c: payload.temperature_c,
        is_within_range,
        notes: payload.notes,
      },
    });
    res.status(201).json({ data: log });
  } catch (error) {
    res.status(400).json({ error: 'Failed to log temperature' });
  }
};

export const listLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.temperatureLog.findMany({
      where: { equipment: { id: req.params.id, location: { organisation_id: req.user!.organisationId } } },
      orderBy: { recorded_at: 'desc' },
      take: 50,
    });
    res.json({ data: logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load logs' });
  }
};

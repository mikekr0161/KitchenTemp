import { Response } from 'express';
import { PrismaClient, ChecklistRunStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/requireAuth';
import { z } from 'zod';

const prisma = new PrismaClient();

const templateSchema = z.object({
  name: z.string(),
  category: z.string(),
  frequency: z.string(),
  location_id: z.string().optional(),
  items: z.array(
    z.object({
      order_index: z.number(),
      label: z.string(),
      description: z.string().optional(),
      is_required: z.boolean().default(true),
      requires_photo: z.boolean().default(false),
    })
  ),
});

const runSchema = z.object({
  checklist_template_id: z.string(),
  location_id: z.string(),
});

const runItemSchema = z.object({
  value: z.string().optional(),
  notes: z.string().optional(),
  photo_url: z.string().optional(),
  status: z.nativeEnum(ChecklistRunStatus).optional(),
});

export const listTemplates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const templates = await prisma.checklistTemplate.findMany({
      where: { organisation_id: req.user!.organisationId },
      include: { items: true, runs: { take: 3, orderBy: { started_at: 'desc' } } },
    });
    res.json({ data: templates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load templates' });
  }
};

export const createTemplate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = templateSchema.parse(req.body);
    const template = await prisma.checklistTemplate.create({
      data: {
        name: payload.name,
        category: payload.category as any,
        frequency: payload.frequency as any,
        organisation_id: req.user!.organisationId,
        location_id: payload.location_id,
        items: { create: payload.items },
      },
      include: { items: true },
    });
    res.status(201).json({ data: template });
  } catch (error) {
    res.status(400).json({ error: 'Invalid checklist payload' });
  }
};

export const startRun = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = runSchema.parse(req.body);
    const run = await prisma.checklistRun.create({
      data: {
        checklist_template_id: payload.checklist_template_id,
        location_id: payload.location_id,
        started_by_user_id: req.user!.id,
        started_at: new Date(),
        status: ChecklistRunStatus.IN_PROGRESS,
        run_items: {
          create: await prisma.checklistItem
            .findMany({ where: { checklist_template_id: payload.checklist_template_id } })
            .then((items) =>
              items.map((item) => ({
                checklist_item_id: item.id,
              }))
            ),
        },
      },
      include: { run_items: true },
    });
    res.status(201).json({ data: run });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to start run' });
  }
};

export const updateRunItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload = runItemSchema.parse(req.body);
    const updated = await prisma.checklistRunItem.update({
      where: { id },
      data: {
        value: payload.value,
        notes: payload.notes,
        photo_url: payload.photo_url,
        checked_at: new Date(),
        checked_by_user_id: req.user!.id,
      },
    });
    res.json({ data: updated });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update item' });
  }
};

export const completeRun = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.checklistRun.update({
      where: { id },
      data: { status: ChecklistRunStatus.COMPLETED, completed_at: new Date() },
      include: { run_items: true },
    });
    res.json({ data: updated });
  } catch (error) {
    res.status(400).json({ error: 'Failed to complete run' });
  }
};

export const listRuns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const runs = await prisma.checklistRun.findMany({
      where: { template: { organisation_id: req.user!.organisationId } },
      include: { template: true, location: true, started_by: true, run_items: true },
      orderBy: { started_at: 'desc' },
      take: 20,
    });
    res.json({ data: runs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load runs' });
  }
};

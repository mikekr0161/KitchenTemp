import { Response } from 'express';
import { PrismaClient, TrainingAssignmentStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/requireAuth';
import { z } from 'zod';

const prisma = new PrismaClient();

const moduleSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  content: z.string().optional(),
  estimated_minutes: z.number(),
  category: z.string(),
});

export const listTrainingModules = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const modules = await prisma.trainingModule.findMany({
      where: { organisation_id: req.user!.organisationId },
    });
    res.json({ data: modules });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load training modules' });
  }
};

export const createTrainingModule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = moduleSchema.parse(req.body);
    const module = await prisma.trainingModule.create({
      data: { ...payload, organisation_id: req.user!.organisationId },
    });
    res.status(201).json({ data: module });
  } catch (error) {
    res.status(400).json({ error: 'Invalid module payload' });
  }
};

export const listAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assignments = await prisma.trainingAssignment.findMany({
      where: { user_id: req.params.userId },
      include: { training_module: true, result: true },
    });
    res.json({ data: assignments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load assignments' });
  }
};

export const completeAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { score, passed } = req.body;
    const completed = await prisma.trainingAssignment.update({
      where: { id },
      data: { status: TrainingAssignmentStatus.COMPLETED, updated_at: new Date() },
    });
    await prisma.trainingResult.upsert({
      where: { training_assignment_id: id },
      update: { completed_at: new Date(), score, passed },
      create: { training_assignment_id: id, completed_at: new Date(), score, passed },
    });
    await prisma.gamificationPoint.create({
      data: {
        user_id: completed.user_id,
        source_type: 'TRAINING',
        source_id: completed.id,
        points: 25,
        awarded_at: new Date(),
      },
    });
    res.json({ data: completed });
  } catch (error) {
    res.status(400).json({ error: 'Failed to complete assignment' });
  }
};

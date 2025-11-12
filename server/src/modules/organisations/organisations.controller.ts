import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/requireAuth';

const prisma = new PrismaClient();

export const getMyOrganisation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const organisation = await prisma.organisation.findUnique({
      where: { id: req.user!.organisationId },
    });
    if (!organisation) {
      return res.status(404).json({ error: 'Organisation not found' });
    }
    res.json({ data: organisation });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

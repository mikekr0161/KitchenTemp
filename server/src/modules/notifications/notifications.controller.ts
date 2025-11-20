import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/requireAuth';

const prisma = new PrismaClient();

export const listNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user!.id },
      orderBy: { created_at: 'desc' },
    });
    res.json({ data: notifications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load notifications' });
  }
};

export const markNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({ where: { id }, data: { is_read: true } });
    res.json({ data: notification });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update notification' });
  }
};

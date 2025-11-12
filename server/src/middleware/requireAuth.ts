import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    organisationId: string;
    role: Role;
  };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; organisationId: string; role: Role; };

    // You might want to check if the user still exists in the database
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = { id: decoded.userId, organisationId: decoded.organisationId, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

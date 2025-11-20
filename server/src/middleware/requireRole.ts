import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from './requireAuth';
import { Role } from '@prisma/client';

export const requireRole = (roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

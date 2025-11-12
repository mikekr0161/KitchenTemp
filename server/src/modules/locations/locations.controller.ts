import { Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/requireAuth';
import { z } from 'zod';

const prisma = new PrismaClient();

const locationSchema = z.object({
  name: z.string(),
  address: z.string(),
  city: z.string(),
  postcode: z.string(),
  country: z.string(),
});

export const getLocations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const locations = await prisma.location.findMany({
      where: { organisation_id: req.user!.organisationId },
    });
    res.json({ data: locations });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createLocation = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, address, city, postcode, country } = locationSchema.parse(req.body);

      const location = await prisma.location.create({
        data: {
          name,
          address,
          city,
          postcode,
          country,
          organisation_id: req.user!.organisationId,
        },
      });

      res.status(201).json({ data: location });
    } catch (error) {
      res.status(400).json({ error });
    }
  };

  export const updateLocation = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, address, city, postcode, country, active } = req.body;

      const location = await prisma.location.update({
        where: { id },
        data: {
          name,
          address,
          city,
          postcode,
          country,
          active,
        },
      });

      res.json({ data: location });
    } catch (error) {
      res.status(400).json({ error });
    }
  };

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/requireAuth';
import { z } from 'zod';

const prisma = new PrismaClient();

const menuItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  is_active: z.boolean().optional(),
  ingredient_ids: z.array(z.string()).optional(),
  allergen_ids: z.array(z.string()).optional(),
});

export const listMenuItems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { locationId } = req.params;
    const items = await prisma.menuItem.findMany({
      where: { location_id: locationId, location: { organisation_id: req.user!.organisationId } },
      include: { allergens: { include: { allergen: true } }, live_menu_status: true },
    });
    res.json({ data: items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load menu items' });
  }
};

export const createMenuItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = menuItemSchema.parse(req.body);
    const item = await prisma.menuItem.create({
      data: {
        name: payload.name,
        description: payload.description,
        price: payload.price,
        is_active: payload.is_active ?? true,
        location_id: req.params.locationId,
        ingredients: {
          create: payload.ingredient_ids?.map((id) => ({ ingredient_id: id, quantity: 1 })) || [],
        },
        allergens: { create: payload.allergen_ids?.map((id) => ({ allergen_id: id })) || [] },
      },
      include: { allergens: true },
    });
    res.status(201).json({ data: item });
  } catch (error) {
    res.status(400).json({ error: 'Invalid menu item payload' });
  }
};

export const toggleAvailability = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;
    const status = await prisma.liveMenuStatus.upsert({
      where: { menu_item_id: id },
      update: { is_available, last_updated_by_user_id: req.user!.id, last_updated_at: new Date() },
      create: { menu_item_id: id, is_available, last_updated_by_user_id: req.user!.id, last_updated_at: new Date() },
    });
    res.json({ data: status });
  } catch (error) {
    res.status(400).json({ error: 'Failed to toggle availability' });
  }
};

export const listAllergens = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const allergens = await prisma.allergen.findMany();
    res.json({ data: allergens });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load allergens' });
  }
};

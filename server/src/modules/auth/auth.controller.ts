import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from './auth.validation';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, organisationName } = registerSchema.parse(req).body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const organisation = await prisma.organisation.create({
      data: {
        name: organisationName,
        billing_email: email,
        plan: 'FREE', // Default plan
        timezone: 'UTC', // Default timezone
      },
    });

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        organisation_id: organisation.id,
        global_role: 'OWNER',
      },
    });

    res.status(201).json({ data: { userId: user.id, organisationId: organisation.id } });
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req).body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, organisationId: user.organisation_id, role: user.global_role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { userId: user.id, organisationId: user.organisation_id, role: user.global_role },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
      );

    // In a real application, you would store the refresh token in the database
    // For simplicity, we are not doing that here yet.

    res.json({ data: { accessToken, refreshToken, user: { id: user.id, organisationId: user.organisation_id, role: user.global_role } } });
  } catch (error) {
    res.status(400).json({ error });
  }
};

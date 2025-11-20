import { Response } from 'express';
import { PrismaClient, ShiftStatus, TrainingAssignmentStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/requireAuth';

const prisma = new PrismaClient();

export const getDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const organisationId = req.user!.organisationId;

    const [locations, hygieneScores, openChecklists, upcomingShifts, todayWaste, wasteSeries, checklistSeries, trainingResults, notifications] =
      await Promise.all([
        prisma.location.findMany({ where: { organisation_id: organisationId, active: true }, take: 5 }),
        prisma.hygieneScore.findMany({
          where: { location: { organisation_id: organisationId } },
          orderBy: { period_end: 'desc' },
          take: 5,
        }),
        prisma.checklistRun.count({
          where: { status: { in: ['PENDING', 'IN_PROGRESS'] }, template: { organisation_id: organisationId } },
        }),
        prisma.shift.findMany({
          where: {
            status: { in: [ShiftStatus.PLANNED, ShiftStatus.CONFIRMED] },
            user: { organisation_id: organisationId },
            start_time: { gte: new Date() },
          },
          include: { location: true, user: true },
          orderBy: { start_time: 'asc' },
          take: 5,
        }),
        prisma.wasteLog.aggregate({
          _sum: { estimated_cost: true },
          where: {
            location: { organisation_id: organisationId },
            logged_at: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        }),
        prisma.$queryRaw<{ day: string; cost: number }[]>`
          SELECT to_char("logged_at", 'YYYY-MM-DD') as day, SUM("estimated_cost") as cost
          FROM "WasteLog" wl
          JOIN "Location" l ON wl.location_id = l.id
          WHERE l.organisation_id = ${organisationId}
            AND "logged_at" >= NOW() - INTERVAL '30 days'
          GROUP BY 1
          ORDER BY 1 ASC
        `,
        prisma.$queryRaw<{ day: string; rate: number }[]>`
          SELECT to_char(cr."started_at", 'YYYY-MM-DD') as day,
                 AVG(CASE WHEN cr.status = 'COMPLETED' THEN 1 ELSE 0 END)::float as rate
          FROM "ChecklistRun" cr
          JOIN "ChecklistTemplate" ct ON cr.checklist_template_id = ct.id
          WHERE ct.organisation_id = ${organisationId}
            AND cr."started_at" >= NOW() - INTERVAL '30 days'
          GROUP BY 1
          ORDER BY 1 ASC
        `,
        prisma.trainingAssignment.findMany({
          where: { user: { organisation_id: organisationId }, status: TrainingAssignmentStatus.COMPLETED },
          include: { user: true, training_module: true, result: true },
          orderBy: { updated_at: 'desc' },
          take: 5,
        }),
        prisma.notification.findMany({
          where: { user: { organisation_id: organisationId } },
          orderBy: { created_at: 'desc' },
          take: 10,
        }),
      ]);

    res.json({
      data: {
        locations,
        hygieneScores,
        openChecklists,
        upcomingShifts,
        todayWaste: todayWaste._sum.estimated_cost || 0,
        wasteSeries,
        checklistSeries,
        trainingResults,
        notifications,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

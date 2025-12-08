import { Response } from 'express';
import { PrismaClient, ChecklistRunStatus, TrainingAssignmentStatus, TemperatureStatus, IncidentStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/requireAuth';

const prisma = new PrismaClient();

const startOfDay = (date: Date) => {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
};

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const getExperienceOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const organisationId = req.user!.organisationId;
    const today = startOfDay(new Date());

    const [organisation, activeSites, openChecklists, completedToday, overdueChecklists, openAlerts, criticalAlerts, openIncidents,
      incidentsLast30, trainingDue] = await Promise.all([
      prisma.organisation.findUnique({ where: { id: organisationId } }),
      prisma.location.count({ where: { organisation_id: organisationId, active: true } }),
      prisma.checklistRun.count({
        where: {
          status: { in: [ChecklistRunStatus.PENDING, ChecklistRunStatus.IN_PROGRESS] },
          template: { organisation_id: organisationId },
          started_at: { gte: today },
        },
      }),
      prisma.checklistRun.count({
        where: {
          status: ChecklistRunStatus.COMPLETED,
          template: { organisation_id: organisationId },
          completed_at: { gte: today },
        },
      }),
      prisma.checklistRun.count({
        where: {
          status: ChecklistRunStatus.OVERDUE,
          template: { organisation_id: organisationId },
        },
      }),
      prisma.temperatureAlert.count({
        where: {
          device: { organisation_id: organisationId },
          resolved_at: null,
        },
      }),
      prisma.temperatureAlert.count({
        where: {
          device: { organisation_id: organisationId },
          resolved_at: null,
          severity: TemperatureStatus.CRITICAL,
        },
      }),
      prisma.incidentReport.count({
        where: {
          organisation_id: organisationId,
          status: { in: [IncidentStatus.OPEN, IncidentStatus.IN_REVIEW] },
        },
      }),
      prisma.incidentReport.count({
        where: {
          organisation_id: organisationId,
          occurred_at: { gte: daysAgo(30) },
        },
      }),
      prisma.trainingAssignment.count({
        where: {
          status: { in: [TrainingAssignmentStatus.ASSIGNED, TrainingAssignmentStatus.IN_PROGRESS, TrainingAssignmentStatus.OVERDUE] },
          training_module: { organisation_id: organisationId },
        },
      }),
    ]);

    const quickActions = [
      ...(openChecklists > 0
        ? [{
            title: "Finish today's checklists",
            description: `${openChecklists} run${openChecklists === 1 ? '' : 's'} still need attention today`,
            href: '/checklists',
          }]
        : []),
      ...(openAlerts > 0
        ? [{
            title: 'Review temperature alerts',
            description: `${openAlerts} alert${openAlerts === 1 ? '' : 's'} awaiting review (${criticalAlerts} critical)`,
            href: '/temperature',
          }]
        : []),
      ...(openIncidents > 0
        ? [{
            title: 'Update open incidents',
            description: `${openIncidents} incident${openIncidents === 1 ? '' : 's'} are in review`,
            href: '/waste',
          }]
        : []),
      { title: 'Add a new log', description: 'Capture waste, temperature, or hygiene updates in seconds', href: '/menu' },
    ];

    const spotlight = [
      {
        label: 'Checklist health',
        value: `${completedToday} completed / ${openChecklists + completedToday + overdueChecklists || '0'} scheduled today`,
      },
      {
        label: 'Training due',
        value: `${trainingDue} assignment${trainingDue === 1 ? '' : 's'}`,
      },
      {
        label: 'Incidents (30d)',
        value: `${incidentsLast30} logged`,
      },
    ];

    res.json({
      data: {
        organisationName: organisation?.name ?? 'Your organisation',
        welcomeMessage: 'Everything you need to stay audit-ready today',
        heroCta: 'See what matters most and take action quickly.',
        activeSites,
        todaysChecklists: {
          open: openChecklists,
          completed: completedToday,
          overdue: overdueChecklists,
        },
        temperatureAlerts: {
          open: openAlerts,
          critical: criticalAlerts,
        },
        incidents: {
          open: openIncidents,
          last30Days: incidentsLast30,
        },
        trainingDue,
        quickActions,
        spotlight,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load the experience overview' });
  }
};

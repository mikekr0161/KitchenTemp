import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/dashboard';

type QuickAction = { title: string; description: string; href: string };
type SpotlightItem = { label: string; value: string };

type ExperienceOverview = {
  organisationName: string;
  welcomeMessage: string;
  heroCta: string;
  activeSites: number;
  todaysChecklists: { open: number; completed: number; overdue: number };
  temperatureAlerts: { open: number; critical: number };
  incidents: { open: number; last30Days: number };
  trainingDue: number;
  quickActions: QuickAction[];
  spotlight: SpotlightItem[];
};

const StatCard = ({ title, value, accent }: { title: string; value: string; accent?: string }) => (
  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <div className="text-sm text-slate-500">{title}</div>
    <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    {accent && <div className="mt-1 text-xs font-medium text-emerald-600">{accent}</div>}
  </div>
);

const QuickActionCard = ({ action }: { action: QuickAction }) => (
  <a
    href={action.href}
    className="flex flex-col justify-between rounded-xl bg-slate-900 p-4 text-white transition hover:translate-y-[-2px] hover:shadow-lg"
  >
    <div>
      <div className="text-sm uppercase tracking-wide text-slate-300">Action</div>
      <div className="mt-1 text-lg font-semibold">{action.title}</div>
      <p className="mt-2 text-sm text-slate-200">{action.description}</p>
    </div>
    <div className="mt-4 text-xs font-semibold text-amber-200">Open</div>
  </a>
);

const Dashboard = () => {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

  if (isLoading) {
    return <div className="text-slate-500">Loading a cleaner workspace for you...</div>;
  }

  const overview: ExperienceOverview = data?.data || {
    organisationName: 'Your organisation',
    welcomeMessage: 'Everything you need to stay audit-ready today',
    heroCta: 'See what matters most and take action quickly.',
    activeSites: 0,
    todaysChecklists: { open: 0, completed: 0, overdue: 0 },
    temperatureAlerts: { open: 0, critical: 0 },
    incidents: { open: 0, last30Days: 0 },
    trainingDue: 0,
    quickActions: [],
    spotlight: [],
  };

  const checklistTotal = overview.todaysChecklists.open + overview.todaysChecklists.completed + overview.todaysChecklists.overdue;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-600 p-6 text-white shadow-lg">
        <div className="grid gap-4 md:grid-cols-[2fr,1fr] md:items-center">
          <div>
            <div className="text-sm uppercase tracking-wide text-emerald-200">Welcome back</div>
            <h1 className="mt-2 text-3xl font-bold">{overview.organisationName}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-100">{overview.welcomeMessage}</p>
            <p className="mt-1 text-sm text-slate-200">{overview.heroCta}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-slate-900 md:grid-cols-3">
            <div className="rounded-xl bg-white/90 p-3 text-center">
              <div className="text-xs font-semibold text-slate-500">Active sites</div>
              <div className="text-2xl font-bold">{overview.activeSites}</div>
            </div>
            <div className="rounded-xl bg-white/90 p-3 text-center">
              <div className="text-xs font-semibold text-slate-500">Checklists today</div>
              <div className="text-2xl font-bold">{checklistTotal}</div>
            </div>
            <div className="rounded-xl bg-white/90 p-3 text-center">
              <div className="text-xs font-semibold text-slate-500">Alerts open</div>
              <div className="text-2xl font-bold">{overview.temperatureAlerts.open}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Checklists"
          value={`${overview.todaysChecklists.completed}/${checklistTotal || 0} completed today`}
          accent={overview.todaysChecklists.overdue > 0 ? `${overview.todaysChecklists.overdue} overdue` : 'On track'}
        />
        <StatCard
          title="Temperature alerts"
          value={`${overview.temperatureAlerts.open} open`}
          accent={overview.temperatureAlerts.critical > 0 ? `${overview.temperatureAlerts.critical} critical` : 'All stable'}
        />
        <StatCard
          title="Training"
          value={`${overview.trainingDue} assignment${overview.trainingDue === 1 ? '' : 's'} due`}
          accent={overview.trainingDue === 0 ? 'Nothing pending' : 'Schedule follow-up'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {overview.quickActions.length > 0 ? (
          overview.quickActions.map((action) => <QuickActionCard key={action.title} action={action} />)
        ) : (
          <div className="rounded-xl bg-white p-4 text-slate-600 shadow-sm ring-1 ring-slate-100">
            You are all caught up. Great job keeping the operation steady today!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Incidents"
          value={`${overview.incidents.open} open / ${overview.incidents.last30Days} last 30d`}
          accent={overview.incidents.open > 0 ? 'Needs manager review' : 'Clear'}
        />
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="text-sm font-semibold text-slate-700">Spotlight</div>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {overview.spotlight.map((item) => (
              <div key={item.label} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>{item.label}</span>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
            {overview.spotlight.length === 0 && <div className="text-slate-500">Nothing to highlight right now.</div>}
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="text-sm font-semibold text-slate-700">Readiness checklist</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              <span>Confirm all sites have completed opening checks.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
              <span>Review temperature exceptions before service changeover.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
              <span>Schedule any overdue training follow-ups.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

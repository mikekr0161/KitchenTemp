import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/dashboard';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });

const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
  <div className="rounded-xl bg-white p-4 shadow-sm">
    <div className="text-sm text-slate-500">{title}</div>
    <div className="text-2xl font-semibold text-slate-900">{value}</div>
    {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
  </div>
);

const Dashboard = () => {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

  if (isLoading) return <div>Loading...</div>;

  const dashboard = data?.data || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Today</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard title="Open Checklists" value={dashboard.openChecklists?.toString() || '0'} />
        <StatCard
          title="Upcoming Shifts"
          value={dashboard.upcomingShifts?.length || 0}
          subtitle={dashboard.upcomingShifts?.[0]?.start_time ? `Next: ${formatTime(dashboard.upcomingShifts[0].start_time)}` : undefined}
        />
        <StatCard title="Today's Waste" value={`£${dashboard.todayWaste?.toFixed(2)}`} />
        <StatCard title="Locations" value={dashboard.locations?.length || 0} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Waste (last 30 days)</div>
          <div className="space-y-2 text-sm text-slate-700">
            {dashboard.wasteSeries?.map((point: any) => (
              <div key={point.day} className="flex justify-between border-b pb-1">
                <span>{point.day}</span>
                <span>£{Number(point.cost).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Checklist completion (last 30 days)</div>
          <div className="space-y-2 text-sm text-slate-700">
            {dashboard.checklistSeries?.map((point: any) => (
              <div key={point.day} className="flex justify-between border-b pb-1">
                <span>{point.day}</span>
                <span>{(Number(point.rate) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Recent Training</div>
          <div className="space-y-2 text-sm text-slate-700">
            {dashboard.trainingResults?.map((assignment: any) => (
              <div key={assignment.id} className="flex justify-between border-b pb-1">
                <span>{assignment.training_module.title}</span>
                <span className="text-slate-500">{assignment.user.first_name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Notifications</div>
          <div className="space-y-2 text-sm text-slate-700">
            {dashboard.notifications?.map((n: any) => (
              <div key={n.id} className="flex justify-between border-b pb-1">
                <span>{n.title}</span>
                <span className="text-slate-500">{formatDay(n.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

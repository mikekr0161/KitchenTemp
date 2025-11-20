import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getMyOrganisation } from '../api/organisations';
import NotificationsDropdown from './NotificationsDropdown';

const navSections = [
  { label: 'Dashboard', to: '/' },
  { label: 'Checklists', to: '/checklists' },
  { label: 'Temperature Logs', to: '/temperature' },
  { label: 'Inventory & Waste', to: '/waste' },
  { label: 'Menu', to: '/menu' },
  { label: 'Shifts', to: '/shifts' },
  { label: 'Training', to: '/training' },
  { label: 'Leaderboards', to: '/leaderboard' },
];

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ['organisation'], queryFn: getMyOrganisation });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button className="text-lg font-semibold" onClick={() => navigate('/')}>KitchenControl Pro</button>
          <div className="rounded bg-slate-100 px-3 py-1 text-sm text-slate-600">{data?.data?.name}</div>
        </div>
        <div className="flex items-center gap-4">
          <NotificationsDropdown />
          <button onClick={logout} className="rounded bg-slate-900 px-3 py-1 text-sm font-medium text-white">Logout</button>
        </div>
      </header>
      <div className="flex">
        <nav className="w-60 shrink-0 border-r bg-white px-4 py-6">
          <ul className="space-y-2 text-sm font-medium text-slate-700">
            {navSections.map((nav) => (
              <li key={nav.to}>
                <Link className="block rounded px-3 py-2 hover:bg-slate-100" to={nav.to}>
                  {nav.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

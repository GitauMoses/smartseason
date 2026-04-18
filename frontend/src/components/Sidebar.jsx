import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/fields', label: 'Fields' },
  { to: '/admin/agents', label: 'Agents' }
];

const agentNav = [
  { to: '/agent/dashboard', label: 'Dashboard' },
  { to: '/agent/fields', label: 'My Fields' }
];

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const items = user?.role === 'admin' ? adminNav : agentNav;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-200">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">
          SS
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">SmartSeason</p>
          <p className="text-xs text-slate-500">Field monitoring</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((i) => (
          <NavItem key={i.to} {...i} />
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3">
          <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
        </div>
        <button onClick={signOut} className="btn-secondary w-full">
          Log out
        </button>
      </div>
    </aside>
  );
}

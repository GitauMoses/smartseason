import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, signOut } = useAuth();
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm">
          SS
        </div>
        <span className="font-semibold text-slate-900">SmartSeason</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{user?.name}</p>
          <p className="text-xs capitalize text-slate-500">{user?.role}</p>
        </div>
        <button onClick={signOut} className="btn-secondary !px-3 !py-1.5 text-xs">
          Log out
        </button>
      </div>
    </header>
  );
}

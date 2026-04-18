import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RoleRoute({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    const target = user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard';
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}

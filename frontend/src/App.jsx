import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleRoute from './routes/RoleRoute.jsx';
import AppShell from './components/AppShell.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import FieldsList from './pages/admin/FieldsList.jsx';
import FieldDetail from './pages/admin/FieldDetail.jsx';
import CreateField from './pages/admin/CreateField.jsx';
import AgentsList from './pages/admin/AgentsList.jsx';

import AgentDashboard from './pages/agent/AgentDashboard.jsx';
import MyFields from './pages/agent/MyFields.jsx';
import AgentFieldDetail from './pages/agent/FieldDetail.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route element={<RoleRoute role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/fields" element={<FieldsList />} />
            <Route path="/admin/fields/new" element={<CreateField />} />
            <Route path="/admin/fields/:id" element={<FieldDetail />} />
            <Route path="/admin/agents" element={<AgentsList />} />
          </Route>

          <Route element={<RoleRoute role="agent" />}>
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/fields" element={<MyFields />} />
            <Route path="/agent/fields/:id" element={<AgentFieldDetail />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

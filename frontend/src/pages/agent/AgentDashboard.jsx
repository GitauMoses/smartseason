import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import FieldsTable from '../../components/FieldsTable.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { listMyFields } from '../../api/agent.js';
import { apiError } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listMyFields();
        if (!cancelled) setFields(data);
      } catch (err) {
        if (!cancelled) setError(apiError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    const counts = { active: 0, at_risk: 0, completed: 0 };
    for (const f of fields) {
      if (f.status === 'Active') counts.active++;
      else if (f.status === 'At Risk') counts.at_risk++;
      else if (f.status === 'Completed') counts.completed++;
    }
    return counts;
  }, [fields]);

  if (loading) return <LoadingSpinner label="Loading your fields..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Agent'}`}
        subtitle="Your assigned fields and their current health."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card title="My fields" value={fields.length} accent="brand" />
        <Card title="Active" value={stats.active} accent="green" />
        <Card title="At risk" value={stats.at_risk} accent="amber" />
        <Card title="Completed" value={stats.completed} accent="gray" />
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">All assigned fields</h3>
        <FieldsTable
          fields={fields}
          detailPathPrefix="/agent/fields"
          showAgent={false}
          emptyTitle="No fields assigned yet"
          emptyMessage="Contact your coordinator to be assigned fields."
        />
      </div>
    </div>
  );
}

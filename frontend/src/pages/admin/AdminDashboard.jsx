import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import Badge from '../../components/Badge.jsx';
import { getDashboard, listFields } from '../../api/admin.js';
import { apiError } from '../../api/client.js';
import FieldsTable from '../../components/FieldsTable.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [s, f] = await Promise.all([getDashboard(), listFields()]);
        if (!cancelled) {
          setStats(s);
          setFields(f);
        }
      } catch (err) {
        if (!cancelled) setError(apiError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!stats) return null;

  const maxStage = Math.max(1, ...Object.values(stats.stage_breakdown));

  return (
    <div>
      <PageHeader
        title="Admin dashboard"
        subtitle="Overview of every field and agent on SmartSeason."
        actions={
          <Link to="/admin/fields/new" className="btn-primary">+ New field</Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total fields" value={stats.total_fields} accent="brand" />
        <Card title="Active" value={stats.status_breakdown.active} accent="green" hint="Healthy and on schedule" />
        <Card title="At risk" value={stats.status_breakdown.at_risk} accent="amber" hint="Needs attention" />
        <Card title="Completed" value={stats.status_breakdown.completed} accent="gray" hint="Harvested" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700">Stage breakdown</h3>
          <p className="mt-1 text-xs text-slate-500">Current stage distribution across all fields.</p>
          <div className="mt-4 space-y-3">
            {Object.entries(stats.stage_breakdown).map(([stage, count]) => (
              <div key={stage} className="flex items-center gap-3">
                <div className="w-24"><Badge stage={stage} /></div>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(count / maxStage) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-10 text-right text-sm font-semibold text-slate-700">{count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700">Team</h3>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.total_agents}</p>
          <p className="mt-1 text-xs text-slate-500">field agents active</p>
          <Link to="/admin/agents" className="mt-4 inline-flex text-sm font-medium text-brand-700 hover:text-brand-800">
            View agents →
          </Link>
        </div>
      </div>

      {stats.stale_fields.length > 0 && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-200 text-amber-800">
              !
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900">
                {stats.stale_fields.length} {stats.stale_fields.length === 1 ? 'field hasn\'t' : 'fields haven\'t'} been updated in 7+ days
              </h3>
              <p className="mt-0.5 text-xs text-amber-800">
                Check in with the assigned agent or review these plots.
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {stats.stale_fields.map((f) => (
                  <li key={f.id} className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2">
                    <Link to={`/admin/fields/${f.id}`} className="font-medium text-amber-900 hover:underline">
                      {f.name}
                    </Link>
                    <span className="text-xs text-amber-800 capitalize">
                      {f.crop_type} — {f.days_since_update} days
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">All fields</h3>
        <FieldsTable
          fields={fields}
          detailPathPrefix="/admin/fields"
          emptyTitle="No fields yet"
          emptyMessage="Create your first field to begin tracking."
        />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { listAgents, listFields } from '../../api/admin.js';
import { apiError } from '../../api/client.js';
import { formatDate } from '../../utils/formatDate.js';

export default function AgentsList() {
  const [agents, setAgents] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, f] = await Promise.all([listAgents(), listFields()]);
        if (!cancelled) {
          setAgents(a);
          setFields(f);
        }
      } catch (err) {
        if (!cancelled) setError(apiError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function countsFor(agentId) {
    const assigned = fields.filter((f) => f.assigned_agent_id === agentId);
    return {
      total: assigned.length,
      at_risk: assigned.filter((f) => f.status === 'At Risk').length,
      completed: assigned.filter((f) => f.status === 'Completed').length
    };
  }

  if (loading) return <LoadingSpinner label="Loading agents..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle={`${agents.length} ${agents.length === 1 ? 'agent' : 'agents'} in the field`}
      />
      {agents.length === 0 ? (
        <EmptyState title="No agents yet" message="Invite agents to start monitoring fields." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => {
            const c = countsFor(a.id);
            return (
              <div key={a.id} className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-700">
                    {a.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.email}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Stat label="Fields" value={c.total} />
                  <Stat label="At risk" value={c.at_risk} accent="amber" />
                  <Stat label="Completed" value={c.completed} />
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Joined {formatDate(a.created_at)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }) {
  const color = accent === 'amber' ? 'text-amber-700' : 'text-slate-800';
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2">
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

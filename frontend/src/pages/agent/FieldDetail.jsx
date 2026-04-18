import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import Badge from '../../components/Badge.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { getMyField, addFieldUpdate } from '../../api/agent.js';
import { apiError } from '../../api/client.js';
import { formatDate, formatDateTime, daysAgo } from '../../utils/formatDate.js';

const STAGE_ORDER = ['planted', 'growing', 'ready', 'harvested'];

export default function AgentFieldDetail() {
  const { id } = useParams();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newStage, setNewStage] = useState('');
  const [observation, setObservation] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const f = await getMyField(id);
      setField(f);
      setNewStage(f.current_stage);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!observation.trim()) {
      setSubmitError('Observation is required.');
      return;
    }
    setSubmitting(true);
    try {
      const { field: updated } = await addFieldUpdate(id, {
        new_stage: newStage,
        observation: observation.trim()
      });
      setField(updated);
      setObservation('');
    } catch (err) {
      setSubmitError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading field..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!field) return null;

  const currentIdx = STAGE_ORDER.indexOf(field.current_stage);
  const allowedStages = STAGE_ORDER.slice(currentIdx);

  return (
    <div>
      <PageHeader
        title={field.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="capitalize">{field.crop_type}</span>
            <span>•</span>
            <Badge stage={field.current_stage} />
            <StatusPill status={field.status} />
          </span>
        }
        actions={<Link to="/agent/fields" className="btn-secondary">← Back</Link>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700">Field details</h3>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <Detail label="Crop" value={<span className="capitalize">{field.crop_type}</span>} />
            <Detail label="Planted" value={formatDate(field.planting_date)} />
            <Detail label="Current stage" value={<Badge stage={field.current_stage} />} />
            <Detail label="Status" value={<StatusPill status={field.status} />} />
          </dl>
          {field.notes && (
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{field.notes}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Log a progress update</h3>
          <div>
            <label className="label">New stage</label>
            <select
              className="input"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
            >
              {allowedStages.map((s) => (
                <option key={s} value={s}>
                  {s}{s === field.current_stage ? ' (current)' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">Stages can only advance forward.</p>
          </div>
          <div>
            <label className="label">Observation</label>
            <textarea
              rows="4"
              className="input"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="What did you see on the field today?"
            />
          </div>
          <ErrorMessage message={submitError} />
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saving...' : 'Submit update'}
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">
          Update history {field.updates?.length ? `(${field.updates.length})` : ''}
        </h3>
        {field.updates && field.updates.length > 0 ? (
          <div className="card overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {field.updates.map((u) => (
                <li key={u.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <Badge stage={u.new_stage} />
                    <span className="text-sm font-medium text-slate-900">
                      {u.agent?.name || 'You'}
                    </span>
                    <span className="text-xs text-slate-500">
                      · {formatDateTime(u.created_at)} · {daysAgo(u.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{u.observation}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState
            title="No updates yet"
            message="Log the first update using the form above."
          />
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{value}</dd>
    </div>
  );
}

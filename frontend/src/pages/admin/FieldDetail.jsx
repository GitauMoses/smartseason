import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import Badge from '../../components/Badge.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { getField, updateField, deleteField, assignField, listAgents } from '../../api/admin.js';
import { apiError } from '../../api/client.js';
import { formatDate, formatDateTime, daysAgo } from '../../utils/formatDate.js';

const CROPS = ['maize', 'wheat', 'rice', 'tea', 'beans', 'sunflower', 'vegetables', 'coffee', 'sorghum'];
const STAGES = ['planted', 'growing', 'ready', 'harvested'];

export default function FieldDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [actionError, setActionError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [f, a] = await Promise.all([getField(id), listAgents()]);
      setField(f);
      setAgents(a);
      setForm({
        name: f.name,
        crop_type: f.crop_type,
        planting_date: f.planting_date,
        current_stage: f.current_stage,
        notes: f.notes || ''
      });
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

  async function handleSave(e) {
    e.preventDefault();
    setActionError('');
    setSaving(true);
    try {
      const updated = await updateField(id, form);
      setField(updated);
      setEditing(false);
    } catch (err) {
      setActionError(apiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${field.name}"? This cannot be undone.`)) return;
    try {
      await deleteField(id);
      navigate('/admin/fields', { replace: true });
    } catch (err) {
      setActionError(apiError(err));
    }
  }

  async function handleAssign(agentId) {
    setActionError('');
    try {
      const updated = await assignField(id, agentId);
      setField(updated);
    } catch (err) {
      setActionError(apiError(err));
    }
  }

  if (loading) return <LoadingSpinner label="Loading field..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!field) return null;

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
        actions={
          <>
            <Link to="/admin/fields" className="btn-secondary">← Back</Link>
            {!editing && (
              <>
                <button className="btn-secondary" onClick={() => setEditing(true)}>Edit</button>
                <button className="btn-danger" onClick={handleDelete}>Delete</button>
              </>
            )}
          </>
        }
      />

      <ErrorMessage message={actionError} />

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Edit field</h3>
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Crop type</label>
                  <select
                    className="input"
                    value={form.crop_type}
                    onChange={(e) => setForm({ ...form, crop_type: e.target.value })}
                  >
                    {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Planting date</label>
                  <input
                    type="date"
                    className="input"
                    value={form.planting_date}
                    onChange={(e) => setForm({ ...form, planting_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Current stage</label>
                <select
                  className="input"
                  value={form.current_stage}
                  onChange={(e) => setForm({ ...form, current_stage: e.target.value })}
                >
                  {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea
                  rows="4"
                  className="input"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Field details</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Detail label="Crop" value={<span className="capitalize">{field.crop_type}</span>} />
                <Detail label="Stage" value={<Badge stage={field.current_stage} />} />
                <Detail label="Planted" value={formatDate(field.planting_date)} />
                <Detail label="Status" value={<StatusPill status={field.status} />} />
                <Detail label="Created by" value={field.creator?.name || '—'} />
                <Detail label="Created at" value={formatDate(field.created_at)} />
              </dl>
              {field.notes && (
                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{field.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-700">Assigned agent</h3>
          <p className="mt-3 text-base font-medium text-slate-900">
            {field.agent?.name || <span className="text-slate-400">Unassigned</span>}
          </p>
          {field.agent?.email && (
            <p className="text-xs text-slate-500">{field.agent.email}</p>
          )}
          <div className="mt-4">
            <label className="label">Reassign to</label>
            <select
              className="input"
              value={field.assigned_agent_id || ''}
              onChange={(e) => handleAssign(e.target.value || null)}
            >
              <option value="">Unassigned</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
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
                      {u.agent?.name || 'Unknown agent'}
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
            message="The assigned agent hasn't logged any progress updates on this field."
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

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { createField, listAgents } from '../../api/admin.js';
import { apiError } from '../../api/client.js';

const CROPS = ['maize', 'wheat', 'rice', 'tea', 'beans', 'sunflower', 'vegetables', 'coffee', 'sorghum'];

export default function CreateField() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({
    name: '',
    crop_type: 'maize',
    planting_date: '',
    notes: '',
    assigned_agent_id: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listAgents().then(setAgents).catch(() => {});
  }, []);

  function update(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        crop_type: form.crop_type,
        planting_date: form.planting_date,
        notes: form.notes.trim() || null,
        assigned_agent_id: form.assigned_agent_id || null
      };
      const field = await createField(payload);
      navigate(`/admin/fields/${field.id}`, { replace: true });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Create a new field"
        subtitle="Add a plot to track through the season."
        actions={<Link to="/admin/fields" className="btn-secondary">Cancel</Link>}
      />

      <form onSubmit={handleSubmit} className="card max-w-2xl space-y-5 p-6">
        <div>
          <label className="label" htmlFor="name">Field name</label>
          <input
            id="name"
            required
            className="input"
            placeholder="e.g. Nakuru North Plot A"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="crop">Crop type</label>
            <select
              id="crop"
              className="input"
              value={form.crop_type}
              onChange={(e) => update('crop_type', e.target.value)}
            >
              {CROPS.map((c) => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="planting">Planting date</label>
            <input
              id="planting"
              type="date"
              required
              className="input"
              value={form.planting_date}
              onChange={(e) => update('planting_date', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="agent">Assign to agent</label>
          <select
            id="agent"
            className="input"
            value={form.assigned_agent_id}
            onChange={(e) => update('assigned_agent_id', e.target.value)}
          >
            <option value="">— Leave unassigned —</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            rows="4"
            className="input"
            placeholder="Variety, irrigation, terrain notes..."
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
          />
        </div>

        <ErrorMessage message={error} />

        <div className="flex justify-end gap-2 pt-2">
          <Link to="/admin/fields" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Creating...' : 'Create field'}
          </button>
        </div>
      </form>
    </div>
  );
}

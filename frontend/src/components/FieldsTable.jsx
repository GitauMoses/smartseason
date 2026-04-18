import { Link } from 'react-router-dom';
import Badge from './Badge.jsx';
import StatusPill from './StatusPill.jsx';
import EmptyState from './EmptyState.jsx';
import { daysAgo } from '../utils/formatDate.js';

export default function FieldsTable({ fields, detailPathPrefix, showAgent = true, emptyTitle, emptyMessage }) {
  if (!fields || fields.length === 0) {
    return <EmptyState title={emptyTitle || 'No fields yet'} message={emptyMessage} />;
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead className="bg-slate-50">
            <tr>
              <th className="th">Name</th>
              <th className="th">Crop</th>
              <th className="th">Stage</th>
              <th className="th">Status</th>
              {showAgent && <th className="th">Agent</th>}
              <th className="th">Last update</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {fields.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="td font-medium text-slate-900">{f.name}</td>
                <td className="td capitalize">{f.crop_type}</td>
                <td className="td"><Badge stage={f.current_stage} /></td>
                <td className="td"><StatusPill status={f.status} /></td>
                {showAgent && (
                  <td className="td">{f.agent?.name || <span className="text-slate-400">Unassigned</span>}</td>
                )}
                <td className="td text-slate-500">
                  {f.updates && f.updates.length > 0
                    ? daysAgo(f.updates[0].created_at)
                    : <span className="text-amber-600">No updates</span>}
                </td>
                <td className="td text-right">
                  <Link to={`${detailPathPrefix}/${f.id}`} className="text-brand-700 hover:text-brand-800 font-medium">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

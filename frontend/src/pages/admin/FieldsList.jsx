import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import FieldsTable from '../../components/FieldsTable.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { listFields } from '../../api/admin.js';
import { apiError } from '../../api/client.js';

export default function FieldsList() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await listFields();
        if (!cancelled) setFields(data);
      } catch (err) {
        if (!cancelled) setError(apiError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return fields.filter((f) => {
      if (filter !== 'all' && f.status !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.crop_type.toLowerCase().includes(q) ||
        f.agent?.name?.toLowerCase().includes(q)
      );
    });
  }, [fields, filter, query]);

  return (
    <div>
      <PageHeader
        title="Fields"
        subtitle={`${fields.length} ${fields.length === 1 ? 'field' : 'fields'} under management`}
        actions={<Link to="/admin/fields/new" className="btn-primary">+ New field</Link>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search by name, crop or agent..."
          className="input sm:max-w-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="input sm:max-w-[10rem]"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="Active">Active</option>
          <option value="At Risk">At Risk</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {loading && <LoadingSpinner label="Loading fields..." />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && (
        <FieldsTable
          fields={filtered}
          detailPathPrefix="/admin/fields"
          emptyTitle={fields.length === 0 ? 'No fields yet' : 'No matches'}
          emptyMessage={
            fields.length === 0
              ? 'Create your first field to begin tracking.'
              : 'Try a different search or filter.'
          }
        />
      )}
    </div>
  );
}

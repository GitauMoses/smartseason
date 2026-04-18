import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import FieldsTable from '../../components/FieldsTable.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { listMyFields } from '../../api/agent.js';
import { apiError } from '../../api/client.js';

export default function MyFields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

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

  const filtered = useMemo(() => {
    return fields.filter((f) => {
      if (filter !== 'all' && f.status !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.crop_type.toLowerCase().includes(q);
    });
  }, [fields, query, filter]);

  return (
    <div>
      <PageHeader
        title="My fields"
        subtitle={`${fields.length} ${fields.length === 1 ? 'field' : 'fields'} assigned to you`}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          className="input sm:max-w-sm"
          placeholder="Search by name or crop..."
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

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && (
        <FieldsTable
          fields={filtered}
          detailPathPrefix="/agent/fields"
          showAgent={false}
          emptyTitle={fields.length === 0 ? 'No fields assigned yet' : 'No matches'}
          emptyMessage={
            fields.length === 0
              ? 'Contact your coordinator to be assigned fields.'
              : 'Try a different search or filter.'
          }
        />
      )}
    </div>
  );
}

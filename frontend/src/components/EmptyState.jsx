export default function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {message && <p className="mt-1 text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

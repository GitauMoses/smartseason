export default function LoadingSpinner({ label = 'Loading...', size = 'md' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-[3px]'
  };
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-slate-500">
      <div className={`${sizes[size]} animate-spin rounded-full border-slate-300 border-t-brand-600`} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

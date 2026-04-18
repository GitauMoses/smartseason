export function statusStyles(status) {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200';
    case 'At Risk':
      return 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200';
    case 'Completed':
      return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200';
  }
}

export function stageStyles(stage) {
  switch (stage) {
    case 'planted':
      return 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200';
    case 'growing':
      return 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200';
    case 'ready':
      return 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200';
    case 'harvested':
      return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200';
  }
}

export function stageLabel(stage) {
  if (!stage) return '';
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

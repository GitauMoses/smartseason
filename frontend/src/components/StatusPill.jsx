import { statusStyles } from '../utils/statusColor.js';

export default function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles(status)}`}>
      {status}
    </span>
  );
}

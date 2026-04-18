import { stageStyles, stageLabel } from '../utils/statusColor.js';

export default function Badge({ stage }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stageStyles(stage)}`}>
      {stageLabel(stage)}
    </span>
  );
}

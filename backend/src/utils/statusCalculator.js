const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysBetween(start, end = new Date()) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.floor((e.getTime() - s.getTime()) / MS_PER_DAY);
}

function computeStatus(field) {
  const stage = field.current_stage;
  if (stage === 'harvested') return 'Completed';

  const updates = field.updates || [];
  const lastUpdate = updates.length
    ? updates.reduce((latest, u) => {
        const d = new Date(u.created_at);
        return d > latest ? d : latest;
      }, new Date(0))
    : null;

  if (stage !== 'planted') {
    if (!lastUpdate || daysBetween(lastUpdate) > 14) {
      return 'At Risk';
    }
  }

  if (field.planting_date && daysBetween(field.planting_date) > 120 && stage !== 'harvested') {
    return 'At Risk';
  }

  return 'Active';
}

function daysSinceLastUpdate(field) {
  const updates = field.updates || [];
  if (!updates.length) {
    return daysBetween(field.created_at || field.planting_date);
  }
  const latest = updates.reduce((latest, u) => {
    const d = new Date(u.created_at);
    return d > latest ? d : latest;
  }, new Date(0));
  return daysBetween(latest);
}

function attachStatus(field) {
  if (!field) return field;
  const plain = typeof field.toJSON === 'function' ? field.toJSON() : field;
  plain.status = computeStatus(plain);
  plain.days_since_update = daysSinceLastUpdate(plain);
  return plain;
}

function attachStatusAll(fields) {
  return fields.map(attachStatus);
}

module.exports = {
  computeStatus,
  attachStatus,
  attachStatusAll,
  daysBetween,
  daysSinceLastUpdate
};

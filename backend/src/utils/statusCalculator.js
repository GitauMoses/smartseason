const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysBetween(start, end = new Date()) {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime())) return 0;
  return Math.floor((e.getTime() - s.getTime()) / MS_PER_DAY);
}

// Sequelize returns camelCase after toJSON() — handle both camelCase and snake_case
function getUpdateDate(u) {
  return u.createdAt || u.created_at || null;
}

function getFieldCreatedAt(field) {
  return field.createdAt || field.created_at || null;
}

function getFieldPlantingDate(field) {
  return field.plantingDate || field.planting_date || null;
}

function getFieldStage(field) {
  return field.currentStage || field.current_stage || null;
}

function computeStatus(field) {
  const stage = getFieldStage(field);
  if (stage === 'harvested') return 'Completed';

  const updates = field.updates || [];

  const lastUpdate = updates.length
    ? updates.reduce((latest, u) => {
        const d = new Date(getUpdateDate(u));
        return !isNaN(d.getTime()) && d > latest ? d : latest;
      }, new Date(0))
    : null;

  const validLastUpdate = lastUpdate && lastUpdate.getTime() > 0 ? lastUpdate : null;

  if (stage !== 'planted') {
    if (!validLastUpdate || daysBetween(validLastUpdate) > 14) {
      return 'At Risk';
    }
  }

  const plantingDate = getFieldPlantingDate(field);
  if (plantingDate && daysBetween(plantingDate) > 120 && stage !== 'harvested') {
    return 'At Risk';
  }

  return 'Active';
}

function daysSinceLastUpdate(field) {
  const updates = field.updates || [];
  if (!updates.length) {
    return daysBetween(getFieldCreatedAt(field) || getFieldPlantingDate(field));
  }
  const latest = updates.reduce((latest, u) => {
    const d = new Date(getUpdateDate(u));
    return !isNaN(d.getTime()) && d > latest ? d : latest;
  }, new Date(0));
  if (latest.getTime() === 0) {
    return daysBetween(getFieldCreatedAt(field) || getFieldPlantingDate(field));
  }
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

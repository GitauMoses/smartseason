const { Op } = require('sequelize');
const { User, Field, FieldUpdate } = require('../models');
const { success, error } = require('../utils/response');
const {
  attachStatus,
  attachStatusAll,
  daysSinceLastUpdate
} = require('../utils/statusCalculator');

const VALID_STAGES = ['planted', 'growing', 'ready', 'harvested'];

async function listFields(req, res) {
  const fields = await Field.findAll({
    include: [
      { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      { model: FieldUpdate, as: 'updates' }
    ],
    order: [
      ['created_at', 'DESC'],
      [{ model: FieldUpdate, as: 'updates' }, 'created_at', 'DESC']
    ]
  });
  return success(res, { fields: attachStatusAll(fields) });
}

async function getField(req, res) {
  const field = await Field.findByPk(req.params.id, {
    include: [
      { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      {
        model: FieldUpdate,
        as: 'updates',
        include: [{ model: User, as: 'agent', attributes: ['id', 'name'] }]
      }
    ],
    order: [[{ model: FieldUpdate, as: 'updates' }, 'created_at', 'DESC']]
  });
  if (!field) return error(res, 'Field not found', 404);
  return success(res, { field: attachStatus(field) });
}

async function createField(req, res) {
  const { name, crop_type, planting_date, notes, current_stage, assigned_agent_id } = req.body || {};
  if (!name || !crop_type || !planting_date) {
    return error(res, 'Name, crop_type and planting_date are required', 400);
  }
  if (current_stage && !VALID_STAGES.includes(current_stage)) {
    return error(res, 'Invalid current_stage', 400);
  }
  if (assigned_agent_id) {
    const agent = await User.findByPk(assigned_agent_id);
    if (!agent || agent.role !== 'agent') {
      return error(res, 'Assigned agent not found', 400);
    }
  }

  const field = await Field.create({
    name,
    crop_type,
    planting_date,
    notes: notes || null,
    current_stage: current_stage || 'planted',
    assigned_agent_id: assigned_agent_id || null,
    created_by: req.user.id
  });

  const withRelations = await Field.findByPk(field.id, {
    include: [
      { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
      { model: FieldUpdate, as: 'updates' }
    ]
  });
  return success(res, { field: attachStatus(withRelations) }, 201);
}

async function updateField(req, res) {
  const field = await Field.findByPk(req.params.id);
  if (!field) return error(res, 'Field not found', 404);

  const { name, crop_type, planting_date, notes, current_stage, assigned_agent_id } = req.body || {};
  if (current_stage && !VALID_STAGES.includes(current_stage)) {
    return error(res, 'Invalid current_stage', 400);
  }
  if (assigned_agent_id) {
    const agent = await User.findByPk(assigned_agent_id);
    if (!agent || agent.role !== 'agent') {
      return error(res, 'Assigned agent not found', 400);
    }
  }

  await field.update({
    name: name ?? field.name,
    crop_type: crop_type ?? field.crop_type,
    planting_date: planting_date ?? field.planting_date,
    notes: notes !== undefined ? notes : field.notes,
    current_stage: current_stage ?? field.current_stage,
    assigned_agent_id: assigned_agent_id !== undefined ? assigned_agent_id : field.assigned_agent_id
  });

  const withRelations = await Field.findByPk(field.id, {
    include: [
      { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
      { model: FieldUpdate, as: 'updates' }
    ]
  });
  return success(res, { field: attachStatus(withRelations) });
}

async function deleteField(req, res) {
  const field = await Field.findByPk(req.params.id);
  if (!field) return error(res, 'Field not found', 404);
  await field.destroy();
  return success(res, { deleted: true });
}

async function assignField(req, res) {
  const { agent_id } = req.body || {};
  if (!agent_id) return error(res, 'agent_id is required', 400);

  const field = await Field.findByPk(req.params.id);
  if (!field) return error(res, 'Field not found', 404);

  const agent = await User.findByPk(agent_id);
  if (!agent || agent.role !== 'agent') {
    return error(res, 'Agent not found', 400);
  }

  await field.update({ assigned_agent_id: agent_id });
  const withRelations = await Field.findByPk(field.id, {
    include: [
      { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
      { model: FieldUpdate, as: 'updates' }
    ]
  });
  return success(res, { field: attachStatus(withRelations) });
}

async function listAgents(req, res) {
  const agents = await User.findAll({
    where: { role: 'agent' },
    attributes: ['id', 'name', 'email', 'created_at'],
    order: [['name', 'ASC']]
  });
  return success(res, { agents });
}

async function dashboard(req, res) {
  const fields = await Field.findAll({
    include: [{ model: FieldUpdate, as: 'updates' }]
  });
  const withStatus = attachStatusAll(fields);

  const statusBreakdown = { active: 0, at_risk: 0, completed: 0 };
  const stageBreakdown = { planted: 0, growing: 0, ready: 0, harvested: 0 };

  for (const f of withStatus) {
    if (f.status === 'Active') statusBreakdown.active++;
    else if (f.status === 'At Risk') statusBreakdown.at_risk++;
    else if (f.status === 'Completed') statusBreakdown.completed++;
    if (stageBreakdown[f.current_stage] !== undefined) stageBreakdown[f.current_stage]++;
  }

  const stale = withStatus
    .filter((f) => f.days_since_update >= 7 && f.current_stage !== 'harvested')
    .map((f) => ({
      id: f.id,
      name: f.name,
      crop_type: f.crop_type,
      days_since_update: f.days_since_update
    }))
    .sort((a, b) => b.days_since_update - a.days_since_update);

  const totalAgents = await User.count({ where: { role: 'agent' } });

  return success(res, {
    total_fields: withStatus.length,
    status_breakdown: statusBreakdown,
    stage_breakdown: stageBreakdown,
    stale_fields: stale,
    total_agents: totalAgents
  });
}

module.exports = {
  listFields,
  getField,
  createField,
  updateField,
  deleteField,
  assignField,
  listAgents,
  dashboard
};

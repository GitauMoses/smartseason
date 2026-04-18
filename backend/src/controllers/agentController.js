const { User, Field, FieldUpdate } = require('../models');
const { success, error } = require('../utils/response');
const { attachStatus, attachStatusAll } = require('../utils/statusCalculator');

const STAGE_ORDER = ['planted', 'growing', 'ready', 'harvested'];

async function listMyFields(req, res) {
  const fields = await Field.findAll({
    where: { assigned_agent_id: req.user.id },
    include: [
      { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
      { model: FieldUpdate, as: 'updates' }
    ],
    order: [
      ['created_at', 'DESC'],
      [{ model: FieldUpdate, as: 'updates' }, 'created_at', 'DESC']
    ]
  });
  return success(res, { fields: attachStatusAll(fields) });
}

async function getMyField(req, res) {
  const field = await Field.findByPk(req.params.id, {
    include: [
      { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
      {
        model: FieldUpdate,
        as: 'updates',
        include: [{ model: User, as: 'agent', attributes: ['id', 'name'] }]
      }
    ],
    order: [[{ model: FieldUpdate, as: 'updates' }, 'created_at', 'DESC']]
  });
  if (!field) return error(res, 'Field not found', 404);
  if (field.assigned_agent_id !== req.user.id) {
    return error(res, 'This field is not assigned to you', 403);
  }
  return success(res, { field: attachStatus(field) });
}

async function addUpdate(req, res) {
  const { new_stage, observation } = req.body || {};
  if (!new_stage || !observation) {
    return error(res, 'new_stage and observation are required', 400);
  }
  if (!STAGE_ORDER.includes(new_stage)) {
    return error(res, 'Invalid stage', 400);
  }

  const field = await Field.findByPk(req.params.id);
  if (!field) return error(res, 'Field not found', 404);
  if (field.assigned_agent_id !== req.user.id) {
    return error(res, 'This field is not assigned to you', 403);
  }

  const currentIdx = STAGE_ORDER.indexOf(field.current_stage);
  const nextIdx = STAGE_ORDER.indexOf(new_stage);
  if (nextIdx < currentIdx) {
    return error(res, 'Stage can only move forward', 400);
  }

  const update = await FieldUpdate.create({
    field_id: field.id,
    agent_id: req.user.id,
    new_stage,
    observation
  });

  if (nextIdx > currentIdx) {
    await field.update({ current_stage: new_stage });
  }

  const withRelations = await Field.findByPk(field.id, {
    include: [
      { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
      {
        model: FieldUpdate,
        as: 'updates',
        include: [{ model: User, as: 'agent', attributes: ['id', 'name'] }]
      }
    ],
    order: [[{ model: FieldUpdate, as: 'updates' }, 'created_at', 'DESC']]
  });

  return success(res, {
    update: update.toJSON(),
    field: attachStatus(withRelations)
  }, 201);
}

module.exports = { listMyFields, getMyField, addUpdate };

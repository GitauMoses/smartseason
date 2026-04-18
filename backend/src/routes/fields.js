const router = require('express').Router();
const { authGuard } = require('../middleware/auth');
const { User, Field, FieldUpdate } = require('../models');
const { success, error } = require('../utils/response');
const { attachStatus } = require('../utils/statusCalculator');

router.get('/:id', authGuard, async (req, res) => {
  const field = await Field.findByPk(req.params.id, {
    include: [
      { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
      {
        model: FieldUpdate,
        as: 'updates',
        include: [{ model: User, as: 'agent', attributes: ['id', 'name'] }]
      }
    ]
  });
  if (!field) return error(res, 'Field not found', 404);

  if (req.user.role === 'agent' && field.assigned_agent_id !== req.user.id) {
    return error(res, 'Not authorized to view this field', 403);
  }
  return success(res, { field: attachStatus(field) });
});

module.exports = router;

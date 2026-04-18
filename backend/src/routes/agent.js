const router = require('express').Router();
const ctrl = require('../controllers/agentController');
const { authGuard, requireAgent } = require('../middleware/auth');

router.use(authGuard, requireAgent);

router.get('/fields', ctrl.listMyFields);
router.get('/fields/:id', ctrl.getMyField);
router.post('/fields/:id/updates', ctrl.addUpdate);

module.exports = router;

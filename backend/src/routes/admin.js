const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { authGuard, requireAdmin } = require('../middleware/auth');

router.use(authGuard, requireAdmin);

router.get('/dashboard', ctrl.dashboard);
router.get('/agents', ctrl.listAgents);

router.get('/fields', ctrl.listFields);
router.post('/fields', ctrl.createField);
router.get('/fields/:id', ctrl.getField);
router.put('/fields/:id', ctrl.updateField);
router.delete('/fields/:id', ctrl.deleteField);
router.post('/fields/:id/assign', ctrl.assignField);

module.exports = router;

const router = require('express').Router();
const { register, login, me } = require('../controllers/authController');
const { authGuard } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authGuard, me);

module.exports = router;

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { error } = require('../utils/response');

async function authGuard(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return error(res, 'Authentication required', 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.sub);
    if (!user) return error(res, 'User no longer exists', 401);

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    next();
  } catch (err) {
    return error(res, 'Invalid or expired token', 401);
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return error(res, 'Authentication required', 401);
    if (req.user.role !== role) {
      return error(res, `Access restricted to ${role}s`, 403);
    }
    next();
  };
}

module.exports = {
  authGuard,
  requireAdmin: requireRole('admin'),
  requireAgent: requireRole('agent')
};

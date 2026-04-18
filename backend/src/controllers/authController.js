const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { success, error } = require('../utils/response');

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

async function register(req, res) {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) {
    return error(res, 'Name, email and password are required', 400);
  }
  if (password.length < 8) {
    return error(res, 'Password must be at least 8 characters', 400);
  }
  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) return error(res, 'An account with this email already exists', 409);

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: role === 'admin' ? 'admin' : 'agent'
  });

  const token = signToken(user);
  return success(res, { token, user: publicUser(user) }, 201);
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return error(res, 'Email and password are required', 400);

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) return error(res, 'Invalid credentials', 401);

  const match = await bcrypt.compare(password, user.password);
  if (!match) return error(res, 'Invalid credentials', 401);

  const token = signToken(user);
  return success(res, { token, user: publicUser(user) });
}

async function me(req, res) {
  return success(res, { user: req.user });
}

module.exports = { register, login, me };

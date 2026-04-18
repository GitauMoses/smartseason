require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, User } = require('./src/models');
const { error } = require('./src/utils/response');

const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const agentRoutes = require('./src/routes/agent');
const fieldRoutes = require('./src/routes/fields');

const app = express();

const allowedOrigins = [
  /\.vercel\.app$/,
  /\.railway\.app$/,
  /^http:\/\/localhost:\d+$/
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some((pattern) =>
      typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
    );
    callback(null, allowed);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', service: 'smartseason-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/fields', fieldRoutes);

app.use((req, res) => error(res, `Route ${req.method} ${req.path} not found`, 404));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  return error(res, err.message || 'Internal server error', err.status || 500);
});

const PORT = process.env.PORT || 5000;

async function autoSeedIfEmpty() {
  try {
    const count = await User.count();
    if (count === 0) {
      console.log('Empty database detected — running seeder...');
      const { run } = require('./seeders/run');
      await run();
    } else {
      console.log(`Database has ${count} user(s) — skipping seed.`);
    }
  } catch (err) {
    console.error('Auto-seed check failed:', err.message);
  }
}

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log(`Database connected (${sequelize.getDialect()}).`);
    await autoSeedIfEmpty();
    app.listen(PORT, () => {
      console.log(`SmartSeason API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) start();

module.exports = app;

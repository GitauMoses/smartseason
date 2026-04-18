require('dotenv').config();
const path = require('path');
const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const url = process.env.DATABASE_URL || `sqlite:${path.join(__dirname, '..', '..', 'smartseason.sqlite')}`;

const isSqlite = url.startsWith('sqlite:') || url === 'sqlite';

const base = {
  logging: false,
  define: {
    underscored: true,
    timestamps: true
  }
};

let sequelize;

if (isSqlite) {
  const storage = url === 'sqlite' ? ':memory:' : url.replace(/^sqlite:/, '');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    ...base
  });
} else {
  const options = { dialect: 'postgres', ...base };
  if (env === 'production') {
    options.dialectOptions = { ssl: { require: true, rejectUnauthorized: false } };
  }
  sequelize = new Sequelize(url, options);
}

sequelize.isSqlite = isSqlite;

module.exports = sequelize;

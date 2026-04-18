const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Field = sequelize.define('Field', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  crop_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  planting_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  current_stage: {
    type: DataTypes.ENUM('planted', 'growing', 'ready', 'harvested'),
    allowNull: false,
    defaultValue: 'planted'
  },
  assigned_agent_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'fields',
  underscored: true
});

module.exports = Field;

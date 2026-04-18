const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FieldUpdate = sequelize.define('FieldUpdate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  field_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  agent_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  new_stage: {
    type: DataTypes.ENUM('planted', 'growing', 'ready', 'harvested'),
    allowNull: false
  },
  observation: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'field_updates',
  underscored: true,
  updatedAt: false
});

module.exports = FieldUpdate;

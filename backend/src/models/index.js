const sequelize = require('../config/db');
const User = require('./User');
const Field = require('./Field');
const FieldUpdate = require('./FieldUpdate');

User.hasMany(Field, { as: 'createdFields', foreignKey: 'created_by' });
User.hasMany(Field, { as: 'assignedFields', foreignKey: 'assigned_agent_id' });

Field.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
Field.belongsTo(User, { as: 'agent', foreignKey: 'assigned_agent_id' });
Field.hasMany(FieldUpdate, { as: 'updates', foreignKey: 'field_id', onDelete: 'CASCADE' });

FieldUpdate.belongsTo(Field, { foreignKey: 'field_id' });
FieldUpdate.belongsTo(User, { as: 'agent', foreignKey: 'agent_id' });

module.exports = {
  sequelize,
  User,
  Field,
  FieldUpdate
};

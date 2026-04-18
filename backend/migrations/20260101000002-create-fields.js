'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fields', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      crop_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      planting_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      current_stage: {
        type: Sequelize.ENUM('planted', 'growing', 'ready', 'harvested'),
        allowNull: false,
        defaultValue: 'planted'
      },
      assigned_agent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('fields', ['assigned_agent_id']);
    await queryInterface.addIndex('fields', ['current_stage']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('fields');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_fields_current_stage";');
  }
};

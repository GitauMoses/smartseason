'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('field_updates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      field_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'fields', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      agent_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      new_stage: {
        type: Sequelize.ENUM('planted', 'growing', 'ready', 'harvested'),
        allowNull: false
      },
      observation: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('field_updates', ['field_id']);
    await queryInterface.addIndex('field_updates', ['agent_id']);
    await queryInterface.addIndex('field_updates', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('field_updates');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_field_updates_new_stage";');
  }
};

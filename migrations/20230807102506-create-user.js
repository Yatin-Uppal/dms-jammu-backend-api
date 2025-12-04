'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      first_name: {
        type: Sequelize.STRING(100)
      },
      last_name: {
        type: Sequelize.STRING(100)
      },
      username: {
        type: Sequelize.STRING(100),
        unique: true
      },
      password: {
        type: Sequelize.STRING(100)
      },
      refresh_token: {
        type: Sequelize.STRING(1000)
      },
      is_blocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {

        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {

        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('skt_varieties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      skt_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'skt_details', // Name of the referenced table (skt_details)
          key: 'id', // The name of the referenced column in skt_details
        },
      },
      variety_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'variety_details', // Name of the referenced table (variety_details)
          key: 'id', // The name of the referenced column in variety_details
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
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
    await queryInterface.dropTable('skt_varieties');
  }
};
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('variety_load_status_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      driver_vehicle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'driver_vehicle_details', // Name of the referenced table (driver_vehicle_details)
          key: 'id', // The name of the referenced column in driver_vehicle_details
        },
      },
      skt_variety_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'skt_varieties', // Name of the referenced table (skt_variety_details)
          key: 'id', // The name of the referenced column in skt_variety_details
        },
      },
      lot_number: {
        type: Sequelize.TEXT
      },
      qty: {
        type: Sequelize.TEXT
      },
      is_loaded: {
        type: Sequelize.BOOLEAN
      },
      loaded_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users', // Name of the referenced table (users)
          key: 'id', // The name of the referenced column in users
        },
      },
      loaded_time:{
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable('variety_load_status_details');
  }
};
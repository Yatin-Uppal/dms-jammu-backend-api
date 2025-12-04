"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("varieties_lot_details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      driver_vehicle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'driver_vehicle_details',
          key: 'id',
        },
      },
      skt_variety_id: {
        type: Sequelize.INTEGER,
        references:{
            model: 'skt_varieties',
            key: 'variety_id'
        }
      },
      lot_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      lot_quantity: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
      },
      load_status: {
        type: Sequelize.ENUM("Pending", "Partially Loaded", "Loaded"),
        defaultValue: "Pending",
      },
      qr_reference_id: {
        type: Sequelize.STRING(200),
        unique: true,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("varieties_lot_details");
  },
};

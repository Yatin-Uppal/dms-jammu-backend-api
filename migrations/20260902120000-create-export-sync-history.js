"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("export_sync_history", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      parent_depot_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      vehicle_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      driver_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      unit: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      checkout_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      scanned_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lts_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      formation_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      sync_data: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      import_summary: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      synced_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
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
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("export_sync_history");
  },
};


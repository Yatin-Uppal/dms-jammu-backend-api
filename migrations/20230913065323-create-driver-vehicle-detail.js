"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("driver_vehicle_details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      record_id: {
        type: Sequelize.STRING(20),
      },
      vehicle_type_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "vehicle_types",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      vehicle_number_ba_number: {
        type: Sequelize.STRING(20),
      },
      vehicle_capacity: {
        type: Sequelize.DECIMAL(10, 2),
      },
      driver_name: {
        type: Sequelize.STRING(100),
      },
      driver_id_card_number: {
        type: Sequelize.STRING(100),
      },
      escort_number_rank_name: {
        type: Sequelize.STRING(100),
      },
      id_card_number_adhar_number_dc_number: {
        type: Sequelize.STRING(100),
      },
      unit: {
        type: Sequelize.STRING(100),
      },
      fmn_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "formations",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      series: {
        type: Sequelize.STRING(100),
      },
      remark: {
        type: Sequelize.STRING(100),
      },
      begin: {
        allowNull: true,
        type: Sequelize.DATE, // Use DATE type for date values
      },
      end: {
        allowNull: true,
        type: Sequelize.DATE, // Use DATE type for date values
      },
      begin_by: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      end_by: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      updated_by: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      resource: {
        allowNull: true,
        type: Sequelize.TEXT, // Use DATE type for date values
      },
      title: {
        allowNull: true,
        type: Sequelize.TEXT, // Use DATE type for date values
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
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("driver_vehicle_details");
  },
};

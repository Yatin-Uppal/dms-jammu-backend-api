"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("amk_quantities", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sr_no: {
        type: Sequelize.INTEGER,
      },
      sheet_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // references: {
        //   model: 'amk_excel_sheets', // Name of the referenced table
        //   key: 'id', // Primary key in the referenced table
        // },
        // onUpdate: 'CASCADE',
        // onDelete: 'SET NULL',
      },
      amk_number: {
        type: Sequelize.STRING(200),
      },
      nomenclature: {
        type: Sequelize.STRING(200),
      },
      location_33_fad: {
        type: Sequelize.STRING(200),
      },
      total_quantity: {
        type: Sequelize.DECIMAL(10, 2),
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
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
    // Add an index for the amk_number column
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("amk_quantities");
  },
};

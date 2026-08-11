"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("amk_lot_details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      amk_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'amk_quantities', // Name of the referenced table
          key: 'id', // Primary key in the referenced table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      lot_number: {
        type: Sequelize.STRING(200),
      },
      lot_quantity: {
        type: Sequelize.DECIMAL(10, 2),
      },
      condition: {
        type: Sequelize.ENUM('SER', 'UNSE', 'RMJ', 'SEG'),
      },
      pkg_type: {
        type: Sequelize.STRING(200),
      },
      qr_code: {
        type: Sequelize.STRING(200),
      },
      manufacture_date: {
        type: Sequelize.DATE,
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("amk_lot_details");
  },
};

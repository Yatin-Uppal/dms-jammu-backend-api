"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("variety_details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      amk_number: {
        type: Sequelize.STRING(200),
      },
      nomenclature: {
        type: Sequelize.STRING(200),
      },
      ipq: {
        type: Sequelize.INTEGER,
      },
      package_weight: {
        type: Sequelize.DECIMAL(10,2),
      },
      qty: {
        type: Sequelize.INTEGER,
      },
      number_of_package: {
        type: Sequelize.INTEGER,
      },
      location_33_fad: {
        type: Sequelize.STRING(200),
      },

      fad_loading_point_lp_number: {
        type: Sequelize.STRING(200),
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
        allowNull: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("variety_details");
  },
};

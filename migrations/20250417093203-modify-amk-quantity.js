'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('amk_quantities', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      amk_number: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      nomenclature: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      a_u: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      sec: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      remarks: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      sheet_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'amk_excel_sheets', // Name of the referenced table
          key: 'id', // Primary key in the referenced table
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      mmf: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      sr_no: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      inv_of_store_type: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      total_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('amk_quantities');
  },
};
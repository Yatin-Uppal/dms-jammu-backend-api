'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('amk_excel_sheets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      file_id: {
        type: Sequelize.STRING(200)
      },
      excel_file_name: {
        type: Sequelize.STRING(200)
      },
      uploaded_by: {
        type: Sequelize.STRING(200)
      },
      store_type: {
        type: Sequelize.STRING(200)
      },
      total_inventory_uploaded: {
        type: Sequelize.DECIMAL(10, 2)
      },
      depth: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      tonnage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('amk_excel_sheets');
  }
};
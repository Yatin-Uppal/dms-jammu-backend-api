'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
          'amk_excel_sheets',
          'depth',
          {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          { transaction }
      );

      await queryInterface.addColumn(
          'amk_excel_sheets',
          'tonnage',
          {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('amk_excel_sheets', 'depth', { transaction });
      await queryInterface.removeColumn('amk_excel_sheets', 'tonnage', { transaction });
    });
  }
};
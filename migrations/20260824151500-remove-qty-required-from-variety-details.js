'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('variety_details', 'qty_required');
    } catch (error) {
      console.log('Column qty_required was already removed or does not exist on variety_details:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('variety_details', 'qty_required', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};

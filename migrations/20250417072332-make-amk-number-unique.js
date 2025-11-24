'use strict';

/** @type {import('sequelize-cli').Migration} */
// In a migration file
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('amk_quantities', {
      fields: ['amk_number','is_deleted'],
      type: 'unique',
      name: 'unique_amk_number'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('amk_quantities', 'unique_amk_number');
  }
};
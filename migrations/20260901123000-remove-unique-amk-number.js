'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.removeIndex('amk_quantities', 'unique_amk_number');
    } catch (error) {
      try {
        await queryInterface.removeConstraint('amk_quantities', 'unique_amk_number');
      } catch (err) {
        console.log('Index or constraint on amk_quantities was already removed or not found');
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addIndex('amk_quantities', ['amk_number', 'location', 'is_deleted'], {
      unique: true,
      name: 'unique_amk_number',
    });
  }
};


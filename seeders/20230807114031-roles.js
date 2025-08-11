'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('roles', [
      { role: 'gate_check_user', description: 'Gate Check' },
      { role: 'control_center_user', description: 'Control Center' },
      { role: 'loading_point_user', description: 'Loading Point' },
      { role: 'admin_user', description: 'Admin' },
      { role: 'vma_user', description: 'VMA User' },
      { role: 'dcc_admin', description: 'DCC Admin' },
      { role: 'dcc_user', description: 'DCC User' },
      { role: 'location_admin', description: 'Location Admin' },

    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Roles', null, {});
  }
};

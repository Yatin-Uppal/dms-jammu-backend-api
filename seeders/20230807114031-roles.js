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
      { role: 'gate_check_user', description: 'Gate Check', created_at: new Date(), updated_at: new Date() },
      { role: 'control_center_user', description: 'Control Center', created_at: new Date(), updated_at: new Date() },
      { role: 'loading_point_user', description: 'Loading Point', created_at: new Date(), updated_at: new Date() },
      { role: 'admin_user', description: 'Admin', created_at: new Date(), updated_at: new Date() },
      { role: 'vma_user', description: 'VMA User', created_at: new Date(), updated_at: new Date() },
      { role: 'dcc_admin', description: 'DCC Admin', created_at: new Date(), updated_at: new Date() },
      { role: 'dcc_user', description: 'DCC User', created_at: new Date(), updated_at: new Date() },
      { role: 'location_admin', description: 'Location Admin', created_at: new Date(), updated_at: new Date() },

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

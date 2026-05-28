"use strict";

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
    await queryInterface.bulkInsert(
      "vehicle_types",
      [
        {
          vehicle_type: "DD Vehicle",
          description: "DD Vehicle ",
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          vehicle_type: "CHT",
          description: "CHT",
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          vehicle_type: "TATRA",
          description: "TATRA",
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          vehicle_type: "FLAT BED",
          description: "FLAT BED",
          created_at: new Date(),
          updated_at: new Date()
        },
        // Add more dummy data as needed
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("vehicle_types", null, {});
  },
};

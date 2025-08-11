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
        },
        {
          vehicle_type: "CHT",
          description: "CHT",
        },
        {
          vehicle_type: "TATRA",
          description: "TATRA",
        },
        {
          vehicle_type: "FLAT BED",
          description: "FLAT BED",
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

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
    // Generate salt and hash the password
 

    await queryInterface.bulkInsert(
      "users",
      [
        {
          first_name: "Gate",
          last_name: "User",
          username: "gateUser",
          password: process.env.SECURITY_KEY,
          role_id: 1,
        },
        {
          first_name: "Control",
          last_name: "User",
          username: "controlUser",
          password: process.env.SECURITY_KEY,
          role_id: 2,
        },
        {
          first_name: "Loading",
          last_name: "User",
          username: "loadingUser",
          password: process.env.SECURITY_KEY,
          role_id: 3,
        },
        {
          first_name: "Admin",
          last_name: "User",
          username: "admin",
          password: process.env.SECURITY_KEY,
          role_id: 4,
        },
        {
          first_name: "VMA",
          last_name: "User",
          username: "vmaUser",
          password: process.env.SECURITY_KEY,
          role_id: 5,
        },
        {
          first_name: "DCC Admin",
          last_name: "User",
          username: "dccAdmin",
          password: process.env.SECURITY_KEY,
          role_id: 6,
        },
        {
          first_name: "DCC",
          last_name: "User",
          username: "dccUser",
          password: process.env.SECURITY_KEY,
          role_id: 7,
        },
        {
          first_name: "Location Admin",
          last_name: "User",
          username: "locationAdmin",
          password: process.env.SECURITY_KEY,
          role_id: 8,
        },
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
    await queryInterface.bulkDelete("users", null, {});
  },
};

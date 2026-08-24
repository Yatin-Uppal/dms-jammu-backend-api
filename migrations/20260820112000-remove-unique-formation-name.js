'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.removeIndex('formations', 'formation_name');
    } catch (error) {
      try {
        await queryInterface.removeConstraint('formations', 'formation_name');
      } catch (err) {
        console.log('Index or constraint on formation_name was already removed or not found');
      }
    }

    await queryInterface.changeColumn('formations', 'formation_name', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('formations', 'formation_name', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
    });
  }
};

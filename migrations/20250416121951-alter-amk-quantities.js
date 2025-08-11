'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the sheet_id foreign key if it doesn't exist
    await queryInterface.addColumn(
        'amk_quantities',
        'sheet_id',
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'amk_excel_sheets',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }
    ).catch(error => {
      // Column might already exist, handle the error
      console.log('sheet_id column might already exist:', error.message);
    });

    // Modify data types of existing columns
    await queryInterface.changeColumn(
        'amk_quantities',
        'amk_number',
        {
          type: Sequelize.STRING(200)
        }
    ).catch(error => {
      console.log('Error changing amk_number:', error.message);
    });

    await queryInterface.changeColumn(
        'amk_quantities',
        'nomenclature',
        {
          type: Sequelize.STRING(200)
        }
    ).catch(error => {
      console.log('Error changing nomenclature:', error.message);
    });

    await queryInterface.changeColumn(
        'amk_quantities',
        'a_u',
        {
          type: Sequelize.STRING(200)
        }
    ).catch(error => {
      console.log('Error changing a_u:', error.message);
    });

    await queryInterface.changeColumn(
        'amk_quantities',
        'sec',
        {
          type: Sequelize.STRING(200)
        }
    ).catch(error => {
      console.log('Error changing sec:', error.message);
    });

    await queryInterface.changeColumn(
        'amk_quantities',
        'remarks',
        {
          type: Sequelize.STRING(200)
        }
    ).catch(error => {
      console.log('Error changing remarks:', error.message);
    });

    await queryInterface.changeColumn(
        'amk_quantities',
        'inv_of_store_type',
        {
          type: Sequelize.STRING(200)
        }
    ).catch(error => {
      console.log('Error changing inv_of_store_type:', error.message);
    });

    await queryInterface.changeColumn(
        'amk_quantities',
        'total_quantity',
        {
          type: Sequelize.DECIMAL(10, 2)
        }
    ).catch(error => {
      console.log('Error changing total_quantity:', error.message);
    });

    // Add soft delete support if needed
    await queryInterface.addColumn(
        'amk_quantities',
        'deleted_at',
        {
          type: Sequelize.DATE,
          allowNull: true
        }
    ).catch(error => {
      console.log('deleted_at column might already exist:', error.message);
    });

    await queryInterface.addColumn(
        'amk_quantities',
        'is_deleted',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }
    ).catch(error => {
      console.log('is_deleted column might already exist:', error.message);
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes if needed
    await queryInterface.removeColumn('amk_quantities', 'deleted_at').catch(error => {
      console.log('Error removing deleted_at:', error.message);
    });

    await queryInterface.removeColumn('amk_quantities', 'is_deleted').catch(error => {
      console.log('Error removing is_deleted:', error.message);
    });

    // If you want to remove the foreign key constraint
    await queryInterface.removeConstraint(
        'amk_quantities',
        'amk_quantities_sheet_id_foreign_idx' // This constraint name might be different in your DB
    ).catch(error => {
      console.log('Error removing constraint:', error.message);
    });
  }
};

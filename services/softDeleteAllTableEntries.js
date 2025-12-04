const db = require("../models");


async function softDeleteTables() {
    const tables = [
        'AssignedLtsDetail',
        'DriverVehicleDetail',
        'Log',
        'LtsDetail',
        'ManageAmkQuantity',
        'SktDetails',
        'SktVarieties',
        'VarietyDetail',
    ];
  
    try {
      await Promise.all(tables.map(table => {
        return db[table].destroy({ where: {} }); // Soft delete
      }));
      await db.formations.update(
        { is_deleted : 1 }, // Set deleted_is to 1
        { where: {} }
      );  
      console.log('All entries soft deleted successfully.');
    } catch (error) {
      console.error('Error soft deleting entries:', error);
    }
  }

  module.exports = {softDeleteTables}
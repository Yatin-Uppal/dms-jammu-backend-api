const db = require("../models");


async function softDeleteTables() {
    const tables = [
        'AssignedLtsDetail',
        'VarietyLoadDetails',
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
      console.log('All entries soft deleted successfully.');
    } catch (error) {
      console.error('Error soft deleting entries:', error);
    }
  }

  module.exports = {softDeleteTables}
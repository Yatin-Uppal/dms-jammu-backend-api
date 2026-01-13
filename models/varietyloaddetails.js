'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VarietyLoadDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      VarietyLoadDetails.belongsTo(models.DriverVehicleDetail, {
        foreignKey: "driver_vehicle_id",
        as: "lotLoadedVehicleData",
      });

      VarietyLoadDetails.hasMany(models.SktVarieties, {
        foreignKey: "id",
        as: "sktvarietyData",
      });

      VarietyLoadDetails.belongsTo(models.User, {
        foreignKey: "loaded_by",
        as: "LoadedUserData",
      }); 

    }
  }
  VarietyLoadDetails.init({
    driver_vehicle_id: DataTypes.INTEGER,
    skt_variety_id: DataTypes.INTEGER,
    lot_number: DataTypes.TEXT,
    lot_quantity: DataTypes.DECIMAL(10, 2),
    load_status: DataTypes.ENUM('Pending', 'Partially Loaded', 'Loaded'),
    loaded_by: DataTypes.INTEGER,
    loaded_time: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'VarietyLoadDetails',
    tableName: 'variety_load_details', // Specify the actual table name here
    createdAt: 'created_at', // Specify the createdAt field name
    updatedAt: 'updated_at', // Specify the updatedAt field name
    paranoid: true, // Enable soft deletes
    deletedAt: "deleted_at", // Specify the deletedAt field name
  });
  return VarietyLoadDetails;
};
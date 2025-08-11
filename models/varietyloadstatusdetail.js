'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VarietyLoadStatusDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // VarietyLoadStatusDetail.belongsTo(models.DriverVehicleDetail, {
      //   foreignKey: "driver_vehicle_id",
      //   as: "driverVehicleDetail",
      // });

      VarietyLoadStatusDetail.hasMany(models.SktVarieties, {
        foreignKey: "id",
        as: "sktvarietyData",
      });

      VarietyLoadStatusDetail.belongsTo(models.User, {
        foreignKey: "loaded_by",
        as: "LoadedUserData",
      }); 

    }
  }
  VarietyLoadStatusDetail.init({
    driver_vehicle_id: DataTypes.INTEGER,
    skt_variety_id: DataTypes.INTEGER,
    lot_number: DataTypes.TEXT,
    qty: DataTypes.TEXT,
    is_loaded: DataTypes.BOOLEAN,
    loaded_by: DataTypes.INTEGER,
    loaded_time: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'VarietyLoadStatusDetail',
    tableName: 'variety_load_status_details', // Specify the actual table name here
    createdAt: 'created_at', // Specify the createdAt field name
    updatedAt: 'updated_at', // Specify the updatedAt field name
    paranoid: true, // Enable soft deletes
    deletedAt: "deleted_at", // Specify the deletedAt field name
  });
  return VarietyLoadStatusDetail;
};
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DriverVehicleDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      DriverVehicleDetail.belongsTo(models.VehicleType, {
        foreignKey: "vehicle_type_id",
        as: "vehicleType",
      });

      DriverVehicleDetail.belongsTo(models.formations, {
        foreignKey: "fmn_id",
        as: "formation_details",
      });

      DriverVehicleDetail.belongsTo(models.User, {
        foreignKey: "begin_by",
        as: "beginBy",
      });

      DriverVehicleDetail.belongsTo(models.User, {
        foreignKey: "end_by",
        as: "endBy",
      });
      DriverVehicleDetail.belongsTo(models.User, {
        foreignKey: "updated_by",
        as: "updatedBy",
      });
      DriverVehicleDetail.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "createdBy",
      });
      // Add the association to LtsDetail
      DriverVehicleDetail.belongsTo(models.LtsDetail, {
        foreignKey: "fmn_id",
        as: "ltsData",
      });

      DriverVehicleDetail.hasMany(models.AssignedLtsDetail, {
        foreignKey: "driver_vehicle_detail_id",
        as: "assignedLtsData",
      });

      // DriverVehicleDetail.belongsTo(models.VarietyLoadStatusDetail, {
      //   foreignKey: "driver_vehicle_id",
      //   as: "driverVehicleDetail",
      // });
    }
  }
  DriverVehicleDetail.init(
    {
      record_id: DataTypes.STRING(20),
      vehicle_type_id: DataTypes.INTEGER,
      vehicle_number_ba_number: DataTypes.STRING(20),
      vehicle_capacity: DataTypes.DECIMAL(10, 2),
      driver_name: DataTypes.STRING(100),
      driver_id_card_number: DataTypes.STRING(100),
      escort_number_rank_name: DataTypes.STRING(100),
      id_card_number_adhar_number_dc_number: DataTypes.STRING(100),
      unit: DataTypes.STRING(100),
      fmn_id: DataTypes.INTEGER,
      series: DataTypes.STRING(100),
      remark: DataTypes.STRING(100),
      begin: DataTypes.DATE,
      end: DataTypes.DATE,
      begin_by: DataTypes.INTEGER,
      end_by: DataTypes.INTEGER,
      resource: DataTypes.TEXT,
      title: DataTypes.TEXT,
      updated_by: DataTypes.INTEGER,
      created_by: DataTypes.INTEGER,

    },
    {
      sequelize,
      modelName: "DriverVehicleDetail",
      tableName: "driver_vehicle_details", // Specify the actual table name here
      createdAt: "created_at", // Specify the createdAt field name
      updatedAt: "updated_at", // Specify the updatedAt field name
      paranoid: true, // Enable soft deletes
      deletedAt: "deleted_at", // Specify the deletedAt field name
    }
  );
  return DriverVehicleDetail;
};

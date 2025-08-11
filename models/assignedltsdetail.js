"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AssignedLtsDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AssignedLtsDetail.belongsTo(models.DriverVehicleDetail, {
        foreignKey: "driver_vehicle_detail_id",
        as: "driverVehicleDetail",
      });

      AssignedLtsDetail.belongsTo(models.LtsDetail, {
        foreignKey: "lts_issue_voucher_detail_id",
        as: "ltsDetail",
      });

      AssignedLtsDetail.belongsTo(models.User, {
        foreignKey: "assigned_by",
        as: "assignedByUser",
      });
    }
  }
  AssignedLtsDetail.init(
    {
      driver_vehicle_detail_id: DataTypes.INTEGER,
      lts_issue_voucher_detail_id: DataTypes.INTEGER,
      assigned_by: DataTypes.INTEGER,
      is_loaded: DataTypes.BOOLEAN,
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "AssignedLtsDetail",
      tableName: "assigned_lts_issue_voucher_details", // Specify the actual table name here
      createdAt: "created_at", // Specify the createdAt field name
      updatedAt: "updated_at", // Specify the updatedAt field name
      paranoid: true, // Enable soft deletes
      deletedAt: "deleted_at", // Specify the deletedAt field name
    }
  );
  return AssignedLtsDetail;
};

"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ExportSyncHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ExportSyncHistory.belongsTo(models.User, {
        foreignKey: "synced_by",
        as: "syncedByUser",
      });
    }
  }

  ExportSyncHistory.init(
    {
      parent_depot_name: DataTypes.STRING(200),
      vehicle_number: DataTypes.STRING(100),
      driver_name: DataTypes.STRING(200),
      unit: DataTypes.STRING(200),
      checkout_time: DataTypes.DATE,
      scanned_at: DataTypes.DATE,
      lts_name: DataTypes.STRING(200),
      formation_name: DataTypes.STRING(200),
      sync_data: DataTypes.JSON,
      import_summary: DataTypes.JSON,
      synced_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ExportSyncHistory",
      tableName: "export_sync_history",
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  return ExportSyncHistory;
};


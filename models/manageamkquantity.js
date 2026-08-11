"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ManageAmkQuantity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ManageAmkQuantity.belongsTo(models.AmkExcelSheets, {
        foreignKey: "sheet_id",
        as: "excelSheet"
      });
      ManageAmkQuantity.hasMany(models.AmkLotDetails, {
        foreignKey: "amk_id",
        as: "amkLotDetails",
      });
    }
  }
  ManageAmkQuantity.init(
    {
      amk_number: DataTypes.STRING(200),
      amn_shelf_life: DataTypes.STRING(200),
      nomenclature: DataTypes.STRING(200),
      location: DataTypes.STRING(200),
      sheet_id: DataTypes.INTEGER,
      total_quantity: DataTypes.DECIMAL(10, 2),
      is_deleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "ManageAmkQuantity",
      tableName: "amk_quantities", // Specify the actual table name here
      indexes: [
        {
          unique: true,
          fields: ["amk_number", "location", "is_deleted"],
          name: "unique_amk_number",
        },
      ],
      createdAt: "created_at", // Specify the createdAt field name
      updatedAt: "updated_at", // Specify the updatedAt field name
      paranoid: true, // Enable soft deletes
      deletedAt: "deleted_at", // Specify the deletedAt field name
    }
  );
  return ManageAmkQuantity;
};

"use strict"
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AmkExcelSheets extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            AmkExcelSheets.hasMany(models.ManageAmkQuantity, {
                foreignKey: "sheet_id",
                as: "amkQuantities",
            });
        }
    }
    AmkExcelSheets.init(
        {
            file_id: DataTypes.STRING, // Changed from INT to INTEGER
            excel_file_name: DataTypes.STRING(200),
            uploaded_by: DataTypes.STRING(200),
            store_type: DataTypes.STRING(200),
            depth: DataTypes.DECIMAL(10, 2),
            tonnage: DataTypes.DECIMAL(10, 2),
            total_inventory_uploaded: DataTypes.DECIMAL(10, 2),
            is_deleted: DataTypes.BOOLEAN,
        },
        {
            sequelize,
            modelName: "AmkExcelSheets",
            tableName: "amk_excel_sheets", // Specify the actual table name here
            createdAt: "created_at", // Specify the createdAt field name
            updatedAt: "updated_at", // Specify the updatedAt field name
            paranoid: true, // Enable soft deletes
            deletedAt: "deleted_at", // Specify the deletedAt field name
        }
    );
    return AmkExcelSheets; // Return the model
};  // Added semicolon here
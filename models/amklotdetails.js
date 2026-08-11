"use strict"
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AmkLotDetails extends Model {
        static associate(models) {
            // define association here
            AmkLotDetails.belongsTo(models.ManageAmkQuantity, {
                foreignKey: "amk_id",
                as: "amkLots",
            });
        }
    }
    AmkLotDetails.init(
        {
            lot_number: DataTypes.STRING(200),
            lot_quantity: DataTypes.DECIMAL(10, 2),
            qr_code: DataTypes.STRING(200),
            condition: DataTypes.ENUM('SER', 'UNSE', 'RMJ', 'SEG'),
            pkg_type: DataTypes.STRING(200),
            manufacture_date: DataTypes.DATE,
            is_deleted: DataTypes.BOOLEAN,
        },
        {
            sequelize,
            modelName: "AmkLotDetails",
            tableName: "amk_lot_details", // Specify the actual table name here
            createdAt: "created_at", // Specify the createdAt field name
            updatedAt: "updated_at", // Specify the updatedAt field name
            paranoid: true, // Enable soft deletes
            deletedAt: "deleted_at", // Specify the deletedAt field name
        }
    );
    return AmkLotDetails; // Return the model
};  // Added semicolon here
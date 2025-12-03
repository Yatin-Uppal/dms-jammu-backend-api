'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VarietiesLotDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      VarietiesLotDetails.belongsTo(models.SktVarieties, {
        foreignKey: "skt_variety_id",
        as: "varityLotData",
      });
    }
  }
  VarietiesLotDetails.init({
    skt_variety_id: DataTypes.INTEGER,
    lot_number: DataTypes.STRING(100),
    lot_quantity: DataTypes.DECIMAL(10, 3),
    load_status: {
        type: DataTypes.ENUM("Pending", "Partially Loaded", "Loaded"),
        defaultValue: "Pending",
    },
    qr_reference_id: DataTypes.STRING(200),
    is_deleted: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'VarietiesLotDetails',
    tableName: 'varieties_lot_details', // Specify the actual table name here
    createdAt: 'created_at', // Specify the createdAt field name
    updatedAt: 'updated_at', // Specify the updatedAt field name
    paranoid: true, // Enable soft deletes
    deletedAt: "deleted_at", // Specify the deletedAt field name

  });
  return VarietiesLotDetails;
};
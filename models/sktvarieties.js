'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SktVarieties extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SktVarieties.belongsTo(models.SktDetails, {
        foreignKey: "skt_id",
        as: "sktData",
      });

      SktVarieties.hasMany(models.VarietyDetail, {
        foreignKey: "id",
        as: "varityData",
      });

      SktVarieties.hasMany(models.VarietiesLotDetails, {
        foreignKey: "skt_variety_id",
        as: "sktVarietyLotData",
      });

    }
  }
  SktVarieties.init({
    skt_id: DataTypes.INTEGER,
    variety_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SktVarieties',
    tableName: 'skt_varieties', // Specify the actual table name here
    createdAt: 'created_at', // Specify the createdAt field name
    updatedAt: 'updated_at', // Specify the updatedAt field name
    paranoid: true, // Enable soft deletes
    deletedAt: "deleted_at", // Specify the deletedAt field name
  });
  return SktVarieties;
};
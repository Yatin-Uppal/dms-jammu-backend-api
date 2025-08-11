'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VarietyDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // VarietyDetail.hasMany(models.SktVarieties, {
      //   foreignKey: "variety_id",
      //   as: "varityData",
      // });
    }
  }
  VarietyDetail.init({
    amk_number: DataTypes.STRING(200),
    nomenclature: DataTypes.STRING(200),
    ipq: DataTypes.INTEGER,
    package_weight: DataTypes.DECIMAL(10,2),
    qty: DataTypes.INTEGER,
    number_of_package: DataTypes.INTEGER,
    location_33_fad: DataTypes.STRING(200),
    fad_loading_point_lp_number: DataTypes.STRING(200),
    is_deleted : DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'VarietyDetail',
    tableName: 'variety_details', // Specify the actual table name here
    createdAt: 'created_at', // Specify the createdAt field name
    updatedAt: 'updated_at', // Specify the updatedAt field name
    paranoid: true, // Enable soft deletes
    deletedAt: "deleted_at", // Specify the deletedAt field name

  });
  return VarietyDetail;
};
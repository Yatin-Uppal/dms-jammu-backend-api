'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SktDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SktDetails.belongsTo(models.LtsDetail, {
        foreignKey: "lts_issue_voucher_detail_id",
        as: "ltsDetail",
      });

      SktDetails.hasMany(models.SktVarieties, {
        foreignKey: "skt_id",
        as: "sktvarityData",
      });

    }
  }
  SktDetails.init({
    name: DataTypes.STRING(100),
    lts_issue_voucher_detail_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SktDetails',
    tableName: 'skt_details', // Specify the actual table name here
    createdAt: 'created_at', // Specify the createdAt field name
    updatedAt: 'updated_at', // Specify the updatedAt field name
    paranoid: true, // Enable soft deletes
    deletedAt: "deleted_at", // Specify the deletedAt field name

  });
  return SktDetails;
};
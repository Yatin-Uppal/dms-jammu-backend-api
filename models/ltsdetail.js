"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LtsDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LtsDetail.belongsTo(models.formations, {
        foreignKey: "fmn_id",
        as: "formationData",
      });

      LtsDetail.hasMany(models.SktDetails, {
        foreignKey: "lts_issue_voucher_detail_id",
        as: "sktData",
      });

      LtsDetail.belongsTo(models.User, {
        foreignKey: "updated_by",
        as: "updatedBy",
      });
      LtsDetail.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "createdBy",
      });
    }
  }
  LtsDetail.init(
    {
      name: DataTypes.STRING(200),
      lts_date_and_time: DataTypes.DATE,
      type: {
        type: DataTypes.ENUM("load_tally_sheet_lts_number", "issue_voucher"),
        defaultValue: "load_tally_sheet_lts_number",
      },
      fmn_id: DataTypes.INTEGER,
      is_deleted: DataTypes.BOOLEAN,
      updated_by: DataTypes.INTEGER,
      created_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "LtsDetail",
      tableName: "lts_issue_voucher_details", // Specify the actual table name here
      createdAt: "created_at", // Specify the createdAt field name
      updatedAt: "updated_at", // Specify the updatedAt field name
      paranoid: true, // Enable soft deletes
      deletedAt: "deleted_at", // Specify the deletedAt field name
    }
  );
  return LtsDetail;
};

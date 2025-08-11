"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Log.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "userId",
      });
    }
  }
  Log.init(
    {
      url: DataTypes.TEXT,
      httpMethod: DataTypes.STRING,
      status: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      module_name: DataTypes.STRING,
      parameters: DataTypes.JSON,
      action_description: DataTypes.STRING,
      operation_result: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Log",
      tableName: "logs", // Specify the actual table name here
      createdAt: "created_at", // Specify the createdAt field name
      updatedAt: "updated_at", // Specify the updatedAt field name
      paranoid: true, // Enable soft deletes
      deletedAt: "deleted_at", // Specify the deletedAt field name
    }
  );
  return Log;
};

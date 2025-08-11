'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BackupDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BackupDetails.init({
    name: DataTypes.STRING,
    backup_date: DataTypes.DATE
  }, {
    sequelize,
    tableName: "backup_details",
    modelName: 'BackupDetails',
    createdAt: "created_at", // Specify the createdAt field name
    updatedAt: "updated_at", // Specify the updatedAt field name
  });
  return BackupDetails;
};
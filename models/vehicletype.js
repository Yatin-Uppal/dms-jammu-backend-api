'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VehicleType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  VehicleType.init({
    vehicle_type: DataTypes.STRING(50),
    description: DataTypes.STRING(100)
  }, {
    sequelize,
    modelName: 'VehicleType',
    tableName: 'vehicle_types', // Specify the actual table name here
    createdAt: 'created_at', // Specify the createdAt field name
    updatedAt: 'updated_at', // Specify the updatedAt field name

  });
  return VehicleType;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class formations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // formations.belongsTo(models.LtsDetail, {
      //   foreignKey: "fmn_id",
      //   as: "formationData",
      // });
      // formations.belongsTo(models.DriverVehicleDetail, {
      //   foreignKey: "fmn_id",
      //   as: "formation_details",
      // });
    }
  }
  formations.init({
    formation_name:  DataTypes.STRING(100),
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Set the default value to false
    },
  }, {
    sequelize,
    modelName: 'formations',
    createdAt: "created_at", // Specify the createdAt field name
    updatedAt: "updated_at", // Specify the updatedAt field name
  });
  return formations;
};
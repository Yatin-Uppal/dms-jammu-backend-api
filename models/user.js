'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role_data',
      });


    }
  }
  User.init({
    role_id: DataTypes.INTEGER,
    first_name: DataTypes.STRING(100),
    last_name: DataTypes.STRING(100),
    username: DataTypes.STRING(100),
    password: DataTypes.STRING(100),
    refresh_token: DataTypes.STRING(1000),
    is_blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users', // Specify the actual table name here
    createdAt: 'created_at', // Specify the createdAt field name
    updatedAt: 'updated_at', // Specify the updatedAt field name
    paranoid: true, // Enable soft deletes
    deletedAt: "deleted_at", // Specify the deletedAt field name
  });
  return User;
};
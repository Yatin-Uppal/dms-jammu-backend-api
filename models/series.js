'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Series extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'userData',
      });
    }
  }
  Series.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    interval: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 24,
        isInt: true
      },
      comment: "Interval in hours (1-24)."
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1
      },
      comment: "Time in hours, must be a positive integer."
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        notEmpty: true
      },
      comment: "Start date must be a valid date."
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        notEmpty: true,
        isGreaterThanStart(value) {
          if (this.startDate && new Date(value) <= new Date(this.startDate)) {
            throw new Error("End date must be after the start date.");
          }
        }
      },
      comment: "End date must be after the start date."
    }
  }, {  
    sequelize,
    modelName: 'Series',
    tableName: 'series',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return Series;
};



  
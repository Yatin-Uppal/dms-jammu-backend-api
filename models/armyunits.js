'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ArmyUnit extends Model {
    static associate(models) {
      ArmyUnit.belongsTo(models.formations, {
        foreignKey: 'fmn_id',
        as: 'formationData',
      });
    }
  }

  ArmyUnit.init(
    {
      unit_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      fmn_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'formations',
          key: 'id',
        },
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'ArmyUnit',
      tableName: 'army_units',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true,
    }
  );

  return ArmyUnit;
};

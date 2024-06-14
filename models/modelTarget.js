/* eslint-disable no-unused-vars */
const { Model } = require('sequelize');
const config = require('../src/config/vars');

module.exports = (sequelize, DataTypes) => {
  class modelTarget extends Model {}
  modelTarget.init(
    {
      product_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      target: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'modelTarget',
      schema: config.db.schema,
      freezeTableName: true,
      paranoid: true,
    },
  );

  modelTarget.associate = function (models) {};
  return modelTarget;
};

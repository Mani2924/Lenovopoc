/* eslint-disable no-unused-vars */
const { Model } = require('sequelize');
const config = require('../src/config/vars');

module.exports = (sequelize, DataTypes) => {
  class uphtarget extends Model {}
  uphtarget.init(
    {
      machineType: DataTypes.STRING,
      target: DataTypes.INTEGER,
      isActive: DataTypes.BOOLEAN,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'uphtarget',
      schema: config.db.schema,
      freezeTableName: true,
      paranoid: true,
    }
  );

  uphtarget.associate = function (models) {};
  return uphtarget;
};

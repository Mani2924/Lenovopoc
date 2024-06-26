/* eslint-disable no-unused-vars */
const { Model } = require('sequelize');
const config = require('../src/config/vars');

module.exports = (sequelize, DataTypes) => {
  class downtime extends Model {}
  downtime.init(
    {
      downTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      interval: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shift:{
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
      modelName: 'downtime',
      schema: config.db.schema,
      freezeTableName: true,
      paranoid: true,
    },
  );

  downtime.associate = function (models) {};
  return downtime;
};

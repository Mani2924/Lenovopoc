/* eslint-disable no-unused-vars */
const { Model } = require('sequelize');
const config = require('../src/config/vars');

module.exports = (sequelize, DataTypes) => {
  class weeklyData extends Model {}
  weeklyData.init(
    {
      date: DataTypes.DATE,
      time: DataTypes.TIME,
      mt: DataTypes.STRING,
      target: DataTypes.INTEGER,
      totalcount: DataTypes.INTEGER,
      line: DataTypes.STRING,
      comments: DataTypes.STRING,
      isActive: DataTypes.BOOLEAN,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'weeklyData',
      schema: config.db.schema,
      freezeTableName: true,
      paranoid: true,
    },
  );

  weeklyData.associate = function (models) {};
  return weeklyData;
};

/* eslint-disable no-unused-vars */
const { Model } = require('sequelize');
const config = require('../src/config/vars');

module.exports = (sequelize, DataTypes) => {
  class weeklyData1 extends Model {}
  weeklyData1.init(
    {
      product_id: DataTypes.STRING,
      line: DataTypes.STRING,
      op_date: DataTypes.DATE,
      start_time: DataTypes.TIME,
      end_time: DataTypes.TIME,

      target: DataTypes.INTEGER,
      totalcount: DataTypes.INTEGER,
      comments: DataTypes.STRING,
      isActive: DataTypes.BOOLEAN,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'weeklyData1',
      schema: config.db.schema,
      freezeTableName: true,
      paranoid: true,
    },
  );

  weeklyData1.associate = function (models) {};
  return weeklyData1;
};

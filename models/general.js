/* eslint-disable no-unused-vars */
const { Model } = require('sequelize');
const config = require('../src/config/vars');

module.exports = (sequelize, DataTypes) => {
  class general extends Model {}
  general.init(
    {
      mes: DataTypes.STRING,
      mm: DataTypes.STRING,
      mt: DataTypes.STRING,
      mo: DataTypes.STRING,
      sn: DataTypes.STRING,
      ins: DataTypes.STRING,
      ids: DataTypes.STRING,
      cn: DataTypes.STRING,
      op: DataTypes.STRING,
      ro: DataTypes.STRING,
      pop: DataTypes.STRING,
      ln: DataTypes.STRING,
      ai: DataTypes.STRING,
      cl: DataTypes.STRING,
      co: DataTypes.STRING,
      pi: DataTypes.STRING,
      so: DataTypes.STRING,
      sd: DataTypes.STRING,
      dd: DataTypes.STRING,
      d: DataTypes.DATE,
      k: DataTypes.DATE,
      qo: DataTypes.STRING,
      st: DataTypes.DATE,
      ds: DataTypes.STRING,
      line: DataTypes.STRING,
      stage: DataTypes.STRING,
      isActive: DataTypes.BOOLEAN,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'general',
      schema: config.db.schema,
      freezeTableName: true,
      paranoid: true,
    }
  );

  general.associate = function (models) {};
  return general;
};

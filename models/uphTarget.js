/* eslint-disable no-unused-vars */
const { Model } = require("sequelize");
const config = require("../src/config/vars");

module.exports = (sequelize, DataTypes) => {
  class uphtarget extends Model {}
  uphtarget.init(
    {
      machineType: DataTypes.STRING,
      assignedTarget: DataTypes.INTEGER,
      systemTarget: DataTypes.INTEGER,
      isActive: DataTypes.BOOLEAN,
      deletedAt: DataTypes.DATE,
      productOwnerEmail: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "uphtarget",
      schema: config.db.schema,
      freezeTableName: true,
      paranoid: true,
    }
  );

  uphtarget.associate = function (models) {};
  return uphtarget;
};

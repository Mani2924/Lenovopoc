/* eslint-disable no-unused-vars */
const { Model } = require('sequelize');
const config = require('../src/config/vars');

module.exports = (sequelize, DataTypes) => {
  class oldData extends Model {}
  oldData.init(
    {
      Op_Finish_Time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dest_Operation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Associate_Id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Mfg_Order_Id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Serial_Num: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      line: {
        type: DataTypes.STRING,
      },
      Operation_Id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Work_Position_Id: {
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
      modelName: 'oldData',
      schema: config.db.schema,
      freezeTableName: true,
      paranoid: true,
    },
  );

  oldData.associate = function (models) {};
  return oldData;
};

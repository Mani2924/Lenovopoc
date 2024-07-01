const { Model, DataTypes } = require('sequelize');
const config = require('../src/config/vars');

module.exports = (sequelize) => {
  class uphtarget extends Model {}
  uphtarget.init(
    {
      model: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      assignedTarget: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      systemTarget: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shift: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isToday: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'uphtarget',
      tableName: 'uphtarget',
      schema: config.db.schema,
      paranoid: true,
      timestamps: true,
    },
  );

  uphtarget.associate = function (models) {
    // Define associations here if needed
  };

  return uphtarget;
};

const { Model } = require('sequelize');
const config = require('../src/config/vars');
const { v4: uuidv4 } = require('uuid');

// Function to generate custom IDs
let nextId = 100;
function generateCustomId() {
  return nextId++;
}

module.exports = (sequelize, DataTypes) => {
  class weeklyData1 extends Model {}
  weeklyData1.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true,
        defaultValue: () => generateCustomId(), // Use custom ID generation function
      },
      product_id: DataTypes.STRING,
      line: DataTypes.STRING,
      op_date: DataTypes.DATEONLY,
      start_time: DataTypes.TIME,
      end_time: DataTypes.TIME,
      target: DataTypes.INTEGER,
      totalcount: DataTypes.INTEGER,
      comments: DataTypes.STRING,
      ordercount: DataTypes.INTEGER,
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

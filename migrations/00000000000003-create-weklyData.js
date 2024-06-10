const config = require('../src/config/vars');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'weeklyData',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        start_time: {
          type: Sequelize.TIME,
          allowNull: true,
        },
        end_time: {
          type: Sequelize.TIME,
          allowNull: true,
        },
        mt: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        target: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        totalcount: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        comments: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        line: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: new Date(),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: new Date(),
        },
        deletedAt: {
          allowNull: true,
          type: Sequelize.DATE,
        },
      },
      {
        schema: config.db.schema,
        freezeTableName: true,
      },
    );
  },
  async down(queryInterface) {
    await queryInterface.dropTable('weeklyData');
  },
};

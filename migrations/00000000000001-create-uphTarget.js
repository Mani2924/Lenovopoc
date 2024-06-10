const config = require('../src/config/vars');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'uphtarget',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        machineType: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        target: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        productOwnerEmail: {
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
    await queryInterface.dropTable('uphtarget');
  },
};

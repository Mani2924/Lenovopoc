const config = require('../src/config/vars');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'generalData',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        Op_Finish_Time: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        dest_Operation: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        Associate_Id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        Mfg_Order_Id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        product_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        Serial_Num: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        Operation_Id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        Work_Position_Id: {
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
    await queryInterface.dropTable('generalData');
  },
};

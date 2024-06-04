const config = require('../src/config/vars');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'general',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        mes: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        mm: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        mt: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        mo: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        sn: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        ins: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        ids: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        cn: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        op: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        ro: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        pop: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        ln: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        ai: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        cl: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        co: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        pi: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        so: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        sd: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        dd: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        d: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        k: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        qo: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        st: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        ds: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        line: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        stage: {
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
    await queryInterface.dropTable('general');
  },
};

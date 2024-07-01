module.exports = {
  up: async (queryInterface, Sequelize) => {
    const data = [
      {
        assignedTarget: 105,
        systemTarget: 85,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return queryInterface.bulkInsert('uphtarget', data, {});
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('uphtarget', null, {});
  },
};

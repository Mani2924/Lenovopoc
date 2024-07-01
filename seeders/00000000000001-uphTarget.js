module.exports = {
  up: async (queryInterface, Sequelize) => {
    const data = [
      {
        model:'M80S',
        assignedTarget: 105,
        systemTarget: 85,
        time :'09 - 01',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        model:'M70t',
        assignedTarget: 110,
        systemTarget: 95,
        time :'01 - 06',
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

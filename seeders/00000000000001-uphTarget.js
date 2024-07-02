module.exports = {
  up: async (queryInterface, Sequelize) => {
    const data = [
      {
        model: 'M80S',
        assignedTarget: 130,
        systemTarget: 118,
        time: '09 - 12',
        shift: '1st',
        isToday: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        model: 'M70t',
        assignedTarget: 126,
        systemTarget: 110,
        time: '13 - 21',
        shift: '1st',
        isToday: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        model: 'M60S',
        assignedTarget: 120,
        systemTarget: 112,
        time: '09 - 12',
        shift: '1st',
        isToday: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        model: 'M65t',
        assignedTarget: 125,
        systemTarget: 105,
        time: '13 - 21',
        shift: '1st',
        isToday: false,
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

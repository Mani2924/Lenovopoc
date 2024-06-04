// const config = require('../src/config/vars');
// const key = require('../src/utility/key_conversion');

function getRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

module.exports = {
  up: async (queryInterface) => {
    const data = [
      {
        machineType: getRandomString(4),
        target: 80,
      },
      {
        machineType: getRandomString(4),
        target: 60,
      },
      {
        machineType: getRandomString(4),
        target: 100,
      },
      {
        machineType: getRandomString(4),
        target: 120,
      },
      {
        machineType: getRandomString(4),
        target: 75,
      },
    ];

    const dataInserts = data.map((item) => ({
      machineType: item.machineType,
      target: item.target,
    }));

    return queryInterface.bulkInsert('uphtarget', dataInserts, {});
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('uphtarget', null, {});
  },
};

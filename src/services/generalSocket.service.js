const { general } = require('../../models');
const { Op, fn, col, literal } = require('sequelize');

async function getFilteredData() {

  try {
    const nowIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const now = new Date(nowIST);

    const currentHour = now.getHours();
    const startHour = currentHour;
    const endHour = currentHour + 1;

    const data = await general.findAll({
      attributes: [
        [fn('EXTRACT', literal("HOUR FROM (d + INTERVAL '5 hours 30 minutes')")), 'hour'],
        'line',
        [fn('COUNT', col('*')), 'total_count']
      ],
      where: {
        stage: 'FVT',
        d: {
          [Op.gte]: new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, 0, 0),
          [Op.lt]: new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, 0, 0),
        },
      },
      group: ['hour', 'line'],
      order: [[literal('hour'), 'ASC']],
    });

    const result = data.reduce((acc, row) => {
      const hour = parseInt(row.getDataValue('hour'), 10);
      const line = row.getDataValue('line');
      const count = row.getDataValue('total_count');

      const hourRange = `${startHour}-${endHour}`;
      if (!acc[hourRange]) {
        acc[hourRange] = [];
      }
      acc[hourRange].push({ line, total_count: count });

      return acc;
    }, {});
    return result;
  } catch (error) {
    throw error;
  }
}



module.exports = {
  getFilteredData,
};

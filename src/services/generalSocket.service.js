const { sampleData } = require('../../models/index');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

async function getFilteredData() {
  try {
    // Get current time in IST
    const nowIST = moment.tz('Asia/Kolkata');
    
    // Calculate start and end hour for the current hour in IST
    const startHourIST = nowIST.clone().startOf('hour');
    const endHourIST = startHourIST.clone().add(1, 'hour');   
    const startHourUTC = startHourIST.clone().utc().format();
    const endHourUTC = endHourIST.clone().utc().format();

    const totalCount = await sampleData.count({
      where: {
        Op_Finish_Time: {
          [Op.gte]: startHourUTC,
          [Op.lt]: endHourUTC
        },
      },
    });

    // Extract the hour component in 'HH' format (24-hour clock)
    const startHour = startHourIST.format('HH');
    const endHour = endHourIST.format('HH');

    return {
      totalCount,
      startHour,
      endHour
    };
  } catch (error) {
    console.error("Error fetching total count data:", error);
    throw error;
  }
}

module.exports = {
  getFilteredData,
};

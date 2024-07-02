const { sampleData } = require("../../models/index");
const { Op } = require("sequelize");
const moment = require("moment-timezone");
const logger = require("../config/logger");
const { log } = require("../config/vars");


async function getFilteredData() {
  try {
    // Get current time in IST
    const nowIST = moment.tz("Asia/Kolkata");

    // Calculate start and end hour for the current hour in IST
    const startHourIST = nowIST.clone().startOf("hour");
    const endHourIST = startHourIST.clone().add(1, "hour");
    const startHourUTC = startHourIST.clone().utc().format();
    const endHourUTC = endHourIST.clone().utc().format();

    const totalCount = await sampleData.count({
      where: {
        line:'L1',
        Op_Finish_Time: {
          [Op.gte]: startHourUTC,
          [Op.lt]: endHourUTC,
        },
      },
    });

    // Extract the hour component in 'HH' format (24-hour clock)
    let startHour = startHourIST.format("HH");
    let endHour = endHourIST.format("HH");

    // Convert to 12-hour format
    startHour = moment(startHour, "HH").format("hh");
    endHour = moment(endHour, "HH").format("hh");

    const startHourFormatted = startHour.padStart(2, '0');
    const endHourFormatted = endHour.padStart(2, '0');

    return {
      totalCount,
      startHour: startHourFormatted,
      endHour: endHourFormatted,
    };
  } catch (error) {
    console.error('Error fetching total count data:', error);
    throw error;
  }
}

module.exports = {
  getFilteredData,
};

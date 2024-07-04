const { sampleData, weeklyData1 } = require('../../models/index');
const { Op, Sequelize } = require('sequelize');
const moment = require('moment-timezone');
const logger = require('../config/logger');
const { log } = require('../config/vars');

const db = require('../../models/index');

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
        line: 'L1',
        Op_Finish_Time: {
          [Op.gte]: startHourUTC,
          [Op.lt]: endHourUTC,
        },
      },
    });

    // Extract the hour component in 'HH' format (24-hour clock)
    let startHour = startHourIST.format('HH');
    let endHour = endHourIST.format('HH');

    // Convert to 12-hour format
    startHour = moment(startHour, 'HH').format('hh');
    endHour = moment(endHour, 'HH').format('hh');

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

async function rollingChart() {
  try {
    sampleData;
  } catch (error) {
    console.error('Error fetching total count data:', error);
    throw error;
  }
}

function getTarget(overTime = 0) {
  try {
    const systemTarget = {
      shiftATarget: Math.round(110 * 7.5 + 110 * overTime),
      shiftBTarget: Math.round(110 * 7.5 + 110 * overTime),
    };
    const manualTarget = {
      shiftATarget: Math.round(121 * 7.5 + 121 * overTime),
      shiftBTarget: Math.round(121 * 7.5 + 121 * overTime),
    };

    const overAllTarget = {
      systemTarget: systemTarget?.shiftATarget + systemTarget?.shiftBTarget,
      manualTarget: manualTarget?.shiftATarget + manualTarget?.shiftBTarget,
    };

    return {
      systemTarget,
      manualTarget,
      overAllTarget,
    };
  } catch (error) {
    console.error('Error fetching total count data:', error);
    throw error;
  }
}

async function getActualData() {
  try {
    // const result = await weeklyData1.findAll({
    //   attributes: ["totalcount"],
    //   where: {
    //     op_date: "2024-07-02",
    //     start_time: {
    //       [Op.gte]: "09:00:00",
    //     },
    //     end_time: { [Op.lt]: "21:00:00" },
    //   },
    // });

    const currentDate = moment();

    let line = 'L1';
    let startTime = '21:00:00';
    let endTime = '09:00:00';
    let startDate = currentDate.format('YYYY-MM-DD');
    let condition = 'OR';
    let currentHour = currentDate.format('HH:MM:SS');
    let yesterday = moment();
    yesterday.add(1, 'days');
    let endDate = yesterday.format('YYYY-MM-DD');
    if (currentHour >= '09:00:00' && currentHour < '21:00:00') {
      startTime = '09:00:00';
      endTime = '21:00:00';
      endDate = currentDate.format('YYYY-MM-DD');
      startDate = currentDate.format('YYYY-MM-DD');
      condition = 'AND';
    }

    // Raw SQL query string with dynamic conditions
    const sqlQuery = `
     SELECT totalcount, op_date, start_time, end_time
     FROM "weeklyData1"
     WHERE line = :line
     AND (
       (start_time >= :startTime AND DATE(op_date) = :startDate)
       ${condition}
       (end_time <= :endTime AND DATE(op_date) = :endDate)
       AND start_time < end_time
     );
   `;

    const results = await db.sequelize.query(sqlQuery, {
      replacements: {
        line: line,
        startTime: startTime,
        startDate: startDate,
        endTime: endTime,
        endDate: endDate,
      },
      type: Sequelize.QueryTypes.SELECT,
    });

    let actualData = 0;
    let actualCountArray = [];

    if (results?.length) {
      actualCountArray = results.map((item) => item.totalcount);
      actualData = actualCountArray.reduce((a, b) => a + b, 0);
    }

    const uph = uphData(actualCountArray);

    return {
      actualData,
      uph,
    };
  } catch (error) {
    console.error('Error fetching total count data:', error);
    throw error;
  }
}

function changeTime() {
  let timeString = '00:00:00';
  const [hour, minute, second] = timeString.split(':');
  let time = moment();
  time.set('hour', +hour);
  time.set('minute', +minute);
  time.set('second', +second);

  return time;

  // return (startTime = moment().set({
  //   hour: parseInt(timeString.slice(0, 2)), // Extract hours and convert to integer
  //   minute: parseInt(timeString.slice(3, 5)), // Extract minutes and convert to integer
  //   second: parseInt(timeString.slice(6, 8)), // Extract seconds and convert to integer
  // }));
}

function getOverTime() {
  const currentTimeIST = moment().format('HH:MM:SS');
  let overTime = 0;
  // let currentTimeIST = '18:50:00';
  let startTime = changeTime('00:00:00');
  let endTime = changeTime('00:00:00');
  // let startTime = moment().startOf('day');
  // let endTime = moment().startOf('day');

  // console.log('starttime', startTime.format('HH:MM:SS'));
  // console.log('endTime', endTime.format('HH:MM:SS'));

  // let overTimeRange = `${startTime} - ${endTime}`;

  // console.log("moment time", moment().format("HH:MM A"));

  if (currentTimeIST >= '17:45:00' && currentTimeIST < '18:30:00') {
    overTime = 1;
    startTime = changeTime('17:30:00');
    endTime = changeTime('13:30:00');
  } else if (currentTimeIST > '18:30:00' && currentTimeIST < '19:30:00') {
    overTime = 2;
    startTime = changeTime('18:30:00');
    endTime = changeTime('19:30:00');
  } else if (currentTimeIST > '19:30:00' && currentTimeIST <= '21:00:00') {
    overTime = 3.5;
    startTime = changeTime('19:30:00');
    endTime = changeTime('21:00:00');
  } else if (currentTimeIST >= '05:45:00' && currentTimeIST < '06:30:00') {
    overTime = 1;
    startTime = changeTime('05:45:00');
    endTime = changeTime('06:30:00');
  } else if (currentTimeIST > '06:30:00' && currentTimeIST < '07:30:00') {
    overTime = 2;
    startTime = changeTime('06:30:00');
    endTime = changeTime('07:30:00');
  } else if (currentTimeIST >= '07:30:00' && currentTimeIST < '09:00:00') {
    overTime = 1;
    startTime = changeTime('07:30:00');
    endTime = changeTime('09:00:00');
  }
  // overTimeRange =

  // overTime =
  //   currentTimeIST >= "17:45:00" && currentTimeIST < "18:30:00" ? 1 : overTime;
  // overTime =
  //   currentTimeIST > "18:30:00" && currentTimeIST < "19:30:00" ? 2 : overTime;
  // overTime =
  //   currentTimeIST > "19:30:00" && currentTimeIST <= "21:00:00"
  //     ? 3.5
  //     : overTime;

  // overTime =
  //   currentTimeIST >= "05:45:00" && currentTimeIST < "06:30:00" ? 1 : overTime;
  // overTime =
  //   currentTimeIST > "06:30:00" && currentTimeIST < "07:30:00" ? 2 : overTime;
  // overTime =
  //   currentTimeIST >= "07:30:00" && currentTimeIST < "09:00:00"
  //     ? 3.5
  //     : overTime;

  // overTimeRange = `${startTime.format("HH:MM A")} - ${endTime.format(
  //     "HH:MM A",
  //   )}`,

  let overTimeRange = `${startTime.format('HH:MM:SS')} - ${endTime.format(
    'HH:MM:SS',
  )}`;

  return {
    overTime,
    overTimeRange,
  };
}

function uphData(general) {
  let count = 0;
  let frequencyMap = {};
  let mode = null;
  let maxFrequency = 0;
  general.forEach((data) => {
    count += data;
    const yValue = data;
    frequencyMap[yValue] = (frequencyMap[yValue] || 0) + 1;
    if (frequencyMap[yValue] > maxFrequency) {
      maxFrequency = frequencyMap[yValue];
      mode = yValue;
    }
  });

  return mode;
}

async function getShiftData() {
  const shiftactual = await getActualData();
  const overTime = getOverTime();
  const target = getTarget(overTime?.overTime > 0 ? overTime?.overTime : 0);

  // console.log("target", target);
  // console.log('overTime', overTime);
  // console.log('shiftactual', shiftactual);

  return {
    shiftactual,
    overTime,
    target,
  };
}

module.exports = {
  getFilteredData,
  rollingChart,
  getTarget,
  getActualData,
  getShiftData,
};

const { Op, fn, col, Sequelize } = require('sequelize');

const moment = require('moment-timezone');

const { general, weeklyData, uphtarget } = require('../../models/index');
const db = require('../../models/index');

const generalService = {};

function addTime(initialTime, hoursToAdd, minutesToAdd) {
  // Split the initial time to remove milliseconds
  let [timeWithoutMilliseconds] = initialTime.split('.');

  // Split the initial time into hours, minutes, and seconds
  let [hours, minutes, seconds] = timeWithoutMilliseconds
    .split(':')
    .map(Number);

  // Add the hours and minutes
  hours += hoursToAdd;
  minutes += minutesToAdd;

  // Handle overflow of minutes into hours
  if (minutes >= 60) {
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
  }

  // Handle overflow of hours into the next day
  if (hours >= 24) {
    hours = hours % 24;
  }

  // Format the result back to 'HH:MM:SS'
  const formattedTime = [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');

  return formattedTime;
}

generalService.create = async (data) => {
  const result = await general.create(data);
  return result;
};

generalService.getById = async (id) => {
  const result = await general.findOne({ where: { id } });
  return result;
};

generalService.getWeeklyDataById = async (id) => {
  const result = await weeklyData.findOne({ where: { id } });
  return result;
};

generalService.update = async (id, comments) => {
  const result = await weeklyData.update(
    {
      comments,
    },
    { where: { id } },
  );
  return result;
};

generalService.getProductOwnerEmail = async (mt) => {
  const result = await uphtarget.findOne({
    where: {
      machineType: mt,
    },
    attributes: ['productOwnerEmail'],
  });
  return result.productOwnerEmail;
};

generalService.bulkCreate = async (data) => {
  const result = await general.bulkCreate(data);
  return result;
};

generalService.hourlyData = async () => {
  try {
    // Calculate the current time
    const now = new Date();

    // Calculate the start of the previous hour
    const previousHourStart = new Date(now);
    previousHourStart.setHours(previousHourStart.getHours() - 1, 0, 0, 0);

    // Calculate the start of the current hour
    const previousHourEnd = new Date(now);
    previousHourEnd.setHours(previousHourEnd.getHours(), 0, 0, 0);

    // Convert to the desired time zone (+05:30)
    const timeZone = 'Asia/Kolkata';
    const formattedPreviousHourStart = moment(previousHourStart)
      .tz(timeZone)
      .format('YYYY-MM-DD HH:mm:ss');
    const formattedPreviousHourEnd = moment(previousHourEnd)
      .tz(timeZone)
      .format('YYYY-MM-DD HH:mm:ss');

    const result = await db.general.findAll({
      attributes: [
        'mt',
        'line',
        [fn('MAX', col('d')), 'max_d'],
        [fn('COUNT', col('*')), 'total_count'],
      ],
      where: {
        stage: 'FVT',
        d: {
          [Op.gte]: formattedPreviousHourStart,
          [Op.lt]: formattedPreviousHourEnd,
        },
      },
      group: ['mt', 'line'],
    });

    const target = [{ M75T: 80 }, { M70T: 60 }, { M80T: 100 }];

    const targetLookup = {};

    target.forEach((item) => {
      const [key, value] = Object.entries(item)[0];
      targetLookup[key] = value;
    });

    if (result?.length > 0) {
      const a = result.map((item) => {
        const { mt, line } = item;

        const totalCount = item?.dataValues?.total_count;

        const timestamp = item?.dataValues?.max_d;

        // Convert to the desired time zone
        let dateInTimeZone = moment.tz(timestamp, timeZone);

        // Round the time to the next hour if the minutes are between 6 and 59
        const minutes = dateInTimeZone.minutes();

        if (minutes >= 1) {
          dateInTimeZone = dateInTimeZone.add(1, 'hour').startOf('hour');
        }

        // Format the date and time separately
        const formattedDate = dateInTimeZone.format('YYYY-MM-DD');
        const formattedTime = dateInTimeZone.format('HH:mm:ss');

        const target = targetLookup[mt];

        return {
          date: timestamp,
          time: formattedTime,
          mt,
          line,
          totalcount: +totalCount,
          target,
          comments: 'Target Completed',
        };
      });

      await weeklyData.bulkCreate(a);
    }

    // return result;
  } catch (err) {
    console.log(err);
  }
};

generalService.getShiftRecord = async (
  line,
  startDate,
  endDate,
  startTime,
  endTime,
  condition,
) => {
  const query = `
  SELECT
  id,  -- Add id to the selected fields
  time AS x,
  totalCount AS y,
  CONCAT(mt, ' ', target) AS z,
  mt,
  target,
  comments,
  date,
  line
FROM
  public."weeklyData"
WHERE
  line = :line
  AND (
    (time >= :startTime AND DATE(date) = :endDate) ${condition}
    (time < :endTime AND DATE(date) = :startDate)
  )
GROUP BY
  id,  -- Add id to the grouped fields
  time, mt, target, comments, date, line,totalCount
ORDER BY
  date ASC, time ASC;
`;

  const result = await db.sequelize.query(query, {
    replacements: {
      line,
      startTime,
      endTime,
      startDate,
      endDate,
      condition,
    },
    type: Sequelize.QueryTypes.SELECT,
  });

  return result;
};

const presentShiftData = async (line) => {
  // const currentDate = new Date();

  // Get the current date
  let currentDate = new Date();

  // Set minutes and seconds to zero to round to the nearest hour
  currentDate.setMinutes(0, 0, 0);

  // Format the date to 'YYYY-MM-DD'
  let currentDateString = currentDate.toISOString().split('T')[0];

  // Options for formatting the time
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  // Format the time to 'HH:MM:SS'
  const currentTime = currentDate.toLocaleTimeString('en-GB', options);

  console.log(currentDateString); // Outputs the current date in 'YYYY-MM-DD' format
  // console.log(currentTime); // Outputs the rounded time in 'HH:00:00' format

  console.log('currentTime', currentTime);

  // let startTime = '09:00:00';
  // let endTime = '21:00:00';

  // let startDate = currentDateString;
  // let endDate = currentDateString;

  // let condition = 'AND';

  // if (currentTime >= '21:00:00' && currentTime < '09:00:00') {
  //   startDate = currentDateString;

  //   currentDate.setDate(currentDate.getDate() + 1);
  //   currentDateString = currentDate.toISOString().split('T')[0];

  //   endDate = currentDateString;

  //   startTime = '21:00:00';
  //   endTime = '09:00:00';

  //   condition = 'OR';
  // }

  // const general = await generalService.getShiftRecord(
  //   line,
  //   startDate,
  //   endDate,
  //   startTime,
  //   endTime,
  //   condition,
  // );
  // const convertTimeToRange = (time) => {
  //   const [hour] = time.split(':');
  //   let currentHour = parseInt(hour);

  //   // Handle the case where the input hour is "24"
  //   if (currentHour === 24) {
  //     currentHour = 0;
  //   }
  //   let nextHour = (currentHour + 1) % 24; // Ensures the hour wraps around at 23
  //   nextHour = nextHour.toString().padStart(2, '0');

  //   return `${currentHour.toString().padStart(2, '0')} - ${nextHour}`;
  // };

  // // Update the 'x' field in each object
  // const updatedData = general.map((item) => {
  //   return {
  //     ...item,
  //     x: convertTimeToRange(item.x),
  //   };
  // });

  // return { data: updatedData, startDate, endDate, line };
  return 'Hello';
};

generalService.currentShiftToRedis = async (data) => {
  try {
    const uniqueLines = await weeklyData.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('line')), 'line']],
      raw: true, // Ensures raw data is returned, not Sequelize models
    });
    // const result = uniqueLines.map((item) => {
    //   return item.line;
    // });

    uniqueLines.map(async (item) => {
      const result = await presentShiftData(item.line);
      // let appData = JSON.stringify(result);

      console.log('result', result);
    });
    console.log('line', uniqueLines);
  } catch (err) {
    console.log('err', err);
    // const temp = {
    //   ...item,
    //   x: convertTimeToRange(item.x),
    // };
    // let appData = JSON.stringify(temp);
    // redisInstance.setValueInRedis(
    //   `${line}-${startDate}-${endDate}`,
    //   appData,
    //   86400,
    //   3,
    // );
  }
};

module.exports = generalService;

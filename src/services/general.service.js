const { Op, fn, col, Sequelize } = require('sequelize');

const moment = require('moment-timezone');

const { general, weeklyData } = require('../../models/index');
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

generalService.bulkCreate = async (data) => {
  const result = await general.bulkCreate(data);
  return result;
};

// generalService.hourlyData = async () => {
//   const result = await general.findAll({
//     where: {
//       stage: 'FVT',
//     },
//   });
//   return result;
// };

// generalService.hourlyData = async () => {
//   try {
//     // Get current date and time
//     const now = new Date(Date.now());
//     console.log('now', now);

//     // Set the time for the start of the previous hour (6 PM in this case)
//     const previousHourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0); // Adjust hours and minutes as needed

//     console.log('.....previousHourStart........', previousHourStart);

//     // Set the time for the end of the previous hour (7 PM in this case)
//     const previousHourEnd = new Date(previousHourStart.getTime() + 60  60  1000); // Add 1 hour in milliseconds

//     // console.log('.............', previousHourEnd);

//     // Filter data based on column d between previous hour start and end timestamps
//     const result = await general.findAll({
//       where: {
//         stage: 'FVT',
//         d: {
//           [Op.gte]: Sequelize.fn('date_trunc', 'hour', previousHourStart), // Truncate to start of hour
//           [Op.lt]: Sequelize.fn('date_trunc', 'hour', previousHourEnd), // Truncate to start of next hour
//         },
//       },
//     });

//     console.log('result', result);

//     return result;
//   } catch (err) {
//     console.log('err', err);
//   }
// };

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

    // console.log('formattedPreviousHourStart', formattedPreviousHourStart);
    // console.log('formattedPreviousHourEnd', formattedPreviousHourEnd);

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

    console.log('result', result?.length);

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

        // console.log('endTime', formattedDate);
        // console.log('endTime', formattedTime);

        // console.log('mt', mt);

        const target = targetLookup[mt];

        return {
          date: formattedDate,
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
    console.log('err', err);
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
    time, mt, target, comments, date, line,totalCount
  ORDER BY 
    date ASC, time ASC;`;

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

module.exports = generalService;

const { Op, fn, col, Sequelize } = require('sequelize');

const moment = require('moment-timezone');

const {
  general,
  weeklyData,
  uphtarget,
  weeklyData1,
  sampleData,
  downtime,
  oldData,
  modelTarget,
} = require('../../models/index');
const db = require('../../models/index');
const downTimeService = require("../services/downTime.service");

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

generalService.getLastThreeHourData = async (todayDate, nowTime, threeHoursAgoTime, line) => {
  const result = await weeklyData1.findAll({
    where: {
      line: line,
      op_date: todayDate,
      start_time: {
        [Op.between]: [threeHoursAgoTime, nowTime],
      },
    },
    limit: 2,
  });
  const downTimeDatas = await downTimeService.getAll();
  let lastThreeHoursdata = result.map((val,index) => {
    const plainObject = val.get({ plain: true }); 
    let min = 24;
    let max = 26;
    let randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
    plainObject.headcount = randomValue;
    plainObject.upph = (plainObject.totalcount / randomValue).toFixed(1);
    const downTimeData =
    index % 2 !== 0
      ? "-"
      : downTimeDatas[index]?.downTime.replace(" mins", "") || "-";
  const downTimeMessage =
    index % 2 !== 0 ? "-" : downTimeDatas[index]?.message || "-";
    plainObject.downTime = downTimeData
    plainObject.message = downTimeMessage
    return plainObject;
  });

  return lastThreeHoursdata;
};

generalService.getLastThreeHourCount = async(todayDate,nowTime,threeHoursAgoTime,line) =>{
  const result = await weeklyData1.findAll({
    where: {
      line:line,
      op_date: todayDate,
      start_time: {
        [Op.between]: [threeHoursAgoTime, nowTime],
      },
    },
    limit: 2,
  });

  const totalcount = result.reduce((acc, record) => acc + record.totalcount, 0);
  const minCount = result.reduce((min, record) => Math.min(min, record.totalcount), Infinity);

  return { totalcount, minCount };
}

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
        // const formattedDate = dateInTimeZone.format('YYYY-MM-DD');
        const formattedTime = dateInTimeZone.format('HH:mm:ss');

        const target = targetLookup[mt];

        return {
          date: timestamp,
          // time: formattedTime,
          start_time: moment(
            formattedPreviousHourStart,
            'YYYY-MM-DD HH:mm:ss',
          ).format('HH:mm:ss'),
          end_time: moment(
            formattedPreviousHourEnd,
            'YYYY-MM-DD HH:mm:ss',
          ).format('HH:mm:ss'),
          mt,
          line,
          totalcount: +totalCount,
          target,
          comments:
            +totalCount >= target ? 'Target Completed' : 'Target Not Completed',
        };
      });

      await weeklyData.bulkCreate(a);
    }
  } catch (err) {
    console.log(err);
  }
};

generalService.getCurrentData = async(startHourUTC,endHourUTC)=>{
  const totalCount = await sampleData.findAll({
    where: {
      Op_Finish_Time: {
        [Op.gte]: startHourUTC,
        [Op.lt]: endHourUTC,
      },
    },
  });
  return totalCount;
}

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
  CONCAT(start_time, ' - ', end_time) AS x,
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
    (start_time >= :startTime AND DATE(date) = :startDate) ${condition}
    (end_time <= :endTime AND DATE(date) = :endDate)
  )
GROUP BY
  id,  -- Add id to the grouped fields
  start_time, end_time, mt, target, comments, date, line,totalCount
ORDER BY
  date ASC, start_time ASC;
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

generalService.sampleDateCountHourlyToWeeklyData = async (data) => {
  try {
    const query = `
    SELECT
    "product_id",
    "line",
        DATE_TRUNC('hour', "Op_Finish_Time")::DATE AS op_date,
        TO_CHAR(DATE_TRUNC('hour', "Op_Finish_Time"), 'HH24:MI:SS') AS start_time,
        TO_CHAR(DATE_TRUNC('hour', "Op_Finish_Time") + INTERVAL '1 hour', 'HH24:MI:SS') AS end_time,
    COUNT(*) AS totalcount
    FROM
    public."sampleData"
    GROUP BY
        "product_id", "line", op_date, start_time, end_time
    ORDER BY
    op_date, start_time, "line";
    `;

    const results = await db.sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
    });

    // const slpss = results.slice(0, 10);

    // console.log('slpss', slpss);

    // console.log('results', results[0]);

    const convertToLocalStorage = (result) => {
      // Iterate over each result object
      return result.map((entry) => {
        // Parse op_date, start_time, and end_time strings and convert to local time
        let opDate = moment.utc(entry.op_date).local().format('YYYY-MM-DD');
        let startTime = moment
          .utc(entry.start_time, 'HH:mm:ss')
          .local()
          // .add(30, 'minutes')
          .format('HH:mm:ss');
        let endTime = moment
          .utc(entry.end_time, 'HH:mm:ss')
          .local()
          // .add(30, 'minutes')
          .format('HH:mm:ss');

        // Return the updated object with local time strings
        return {
          ...entry,
          op_date: opDate,
          start_time: startTime,
          end_time: endTime,
        };
      });
    };

    const ab = convertToLocalStorage(results);
    // console.log('ab', ab);

    console.log('.......result..........', results?.length);

    // const slp = ab.slice(0, 10);

    // console.log('slp', slp);

    if (results?.length > 0) {
      // console.log('.......result..........', result[0]);
      await weeklyData1.bulkCreate(ab);
    }
    // console.log('result', results);
  } catch (err) {
    console.log('err', err);
  }
};

generalService.getShiftRecord2 = async (
  line,
  startDate,
  endDate,
  startTime,
  endTime,
  condition,
  condition2,
) => {
  const query = `
  SELECT
  id,  
  CONCAT(start_time, ' - ', end_time) AS x,
  totalCount AS y,
  CONCAT(product_id, ' ', target) AS z,
  product_id,
  ordercount,
  product_count,
  target,
  comments,
  op_date,
  line
FROM
  public."weeklyData1"
WHERE
  line = :line
  AND (
    (start_time >= :startTime AND DATE(op_date) = :startDate) ${condition}
    (end_time <= :endTime AND DATE(op_date) = :endDate)  ${condition2}
  )
GROUP BY
  id,  -- Add id to the grouped fields
  start_time, end_time, product_id, target, comments, op_date, line,totalCount
ORDER BY
  op_date ASC, start_time ASC;
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

  // console.log('result', result);

  return result;
};

generalService.hourlyData2 = async () => {
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
      // .tz(timeZone)
      .format('YYYY-MM-DD HH:mm:ss');
    const formattedPreviousHourEnd = moment(previousHourEnd)
      // .tz(timeZone)
      .format('YYYY-MM-DD HH:mm:ss');

    const result = await db.sampleData.findAll({
      attributes: [
        'product_id',
        'line',
        [fn('MAX', col('Op_Finish_Time')), 'max_d'],
        [fn('COUNT', col('*')), 'total_count'],
        [fn('COUNT', fn('DISTINCT', col('Mfg_Order_Id'))), 'mfg_order_count'],
        [fn('COUNT', fn('DISTINCT', col('product_id'))), 'product_count'],
      ],
      where: {
        Op_Finish_Time: {
          [Op.gte]: formattedPreviousHourStart,
          [Op.lt]: formattedPreviousHourEnd,
        },
      },
      group: ['product_id', 'line'],
    });

    const target = [
      { '12JDS0AW00': 2 },
      { '12JDS0AX00': 4 },
      { '12LMS15K00': 13 },
      { '11T5S30S00': 30 },
      { '11SYS2D600': 82 },
      { '21JKS14D00': 65 },
      { '12LM002QIH': 1 },
      { '11SYS2JF00': 6 },
      { '11SYS2JT00': 8 },
      { '82TSA0FVIH': 67 },
      { '12JES2CQ00': 1 },
      { '11T5S0H10N': 9 },
      { '11SFS0G800': 1 },
      { '82TTA0AAIN': 83 },
    ];

    const targetLookup = {};

    target.forEach((item) => {
      const [key, value] = Object.entries(item)[0];
      targetLookup[key] = value;
    });

    if (result?.length > 0) {
      const a = result.map((item) => {
        const { product_id, line } = item;

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
        // const formattedDate = dateInTimeZone.format('YYYY-MM-DD');
        const formattedTime = dateInTimeZone.format('HH:mm:ss');

        const target = targetLookup[product_id];

        return {
          op_date: timestamp,
          // time: formattedTime,
          start_time: moment(
            formattedPreviousHourStart,
            'YYYY-MM-DD HH:mm:ss',
          ).format('HH:mm:ss'),
          end_time: moment(
            formattedPreviousHourEnd,
            'YYYY-MM-DD HH:mm:ss',
          ).format('HH:mm:ss'),
          product_id,
          line,
          totalcount: +totalCount,
          target,
          ordercount: item.dataValues.mfg_order_count,
          product_count: item.dataValues.product_count,
          comments:
            +totalCount >= target ? 'Target Completed' : 'Target Not Completed',
        };
      });

      await weeklyData1.bulkCreate(a);
    }
  } catch (err) {
    console.log(err);
  }
};

async function getDailyCountByProductId() {
  try {
    const result = await oldData.findAll({
      attributes: [
        [fn('DATE', col('Op_Finish_Time')), 'date'],
        'product_id',
        [fn('COUNT', col('product_id')), 'count'],
      ],
      where: {
        line: 'L1',
      },
      group: ['date', 'product_id'],
      order: [
        ['date', 'ASC'],
        ['product_id', 'ASC'],
      ],
    });

    return result.map((entry) => ({
      date: entry.get('date'),
      product_id: entry.get('product_id'),
      count: entry.get('count'),
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

function calculateMode(values) {
  const frequencyMap = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  let maxFrequency = 0;
  let mode = null;
  for (const [value, frequency] of Object.entries(frequencyMap)) {
    if (frequency > maxFrequency) {
      maxFrequency = frequency;
      mode = value;
    }
  }
  return mode;
}

generalService.getProductModes = async () => {
  const dailyCounts = await getDailyCountByProductId();

  // Group counts by product_id
  const productCounts = dailyCounts.reduce((acc, { product_id, count }) => {
    if (!acc[product_id]) {
      acc[product_id] = [];
    }
    acc[product_id].push(count);
    return acc;
  }, {});

  const productModes = Object.entries(productCounts).map(
    ([product_id, counts]) => ({
      product_id,
      target: calculateMode(counts),
    }),
  );

  return productModes;
};

generalService.createTargetValue = async (data) => {
  try {
    const value = await modelTarget.bulkCreate(data);
    return value;
  } catch (error) {
    console.error('Error creating target values:', error);
    throw error;
  }
};

generalService.getShiftRecord3 = async (
  line,
  startDate,
  endDate,
  startTime,
  endTime,
  condition,
  condition2,
) => {
  const query = `
  SELECT
  id,  
  CONCAT(start_time, ' - ', end_time) AS x,
  totalCount AS y,
  CONCAT(product_id, ' ', target) AS z,
  product_id,
  target,
  comments,
  op_date,
  line
FROM
  public."weeklyData1"
WHERE
  line = :line
  AND (
    (start_time >= :startTime AND DATE(op_date) = :startDate) ${condition}
    (end_time <= :endTime AND DATE(op_date) = :endDate) ${condition2}
  )
GROUP BY
  id,  -- Add id to the grouped fields
  start_time, end_time, product_id, target, comments, op_date, line,totalCount
ORDER BY
  op_date ASC, start_time ASC;
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

generalService.getPriviousHourCount = async (date, time) => {
  const result = await weeklyData1.findOne({
    where: { op_date: date, start_time: time },
  });

  return result != null ? result.totalcount : 0;
};

generalService.getCount = async (
  line,
  startDate,
  endDate,
  startTime,
  endTime,
) => {
  try {
    const result = await weeklyData1.findOne({
      attributes: [
        [
          Sequelize.fn(
            'COALESCE',
            Sequelize.fn('SUM', Sequelize.col('totalcount')),
            0,
          ),
          'totalcount',
        ],
      ],
      where: {
        line,
        [Op.or]: [
          {
            op_date: startDate,
            start_time: { [Op.gte]: startTime },
          },
          {
            op_date: endDate,
            end_time: { [Op.lte]: endTime },
          },
        ],
      },
    });

    const totalCount = result.dataValues.totalcount || 0;
    return totalCount;
  } catch (error) {
    console.error('Error executing Sequelize query:', error);
    throw error;
  }
};

generalService.getCurrentShiftCount = async (
  line,
  startDate,
  endDate,
  startTime,
  endTime,
) => {
  try {
    const result = await weeklyData1.findOne({
      attributes: [
        [
          Sequelize.fn(
            'COALESCE',
            Sequelize.fn('SUM', Sequelize.col('totalcount')),
            0,
          ),
          'totalcount',
        ],
      ],
      where: {
        line,
        [Op.or]: [
          {
            op_date: startDate,
            start_time: { [Op.gte]: startTime },
            end_time: { [Op.lte]: endTime },
          },
        ],
      },
    });

    const totalCount = result.dataValues.totalcount || 0;
    return totalCount;
  } catch (error) {
    console.error('Error executing Sequelize query:', error);
    throw error;
  }
};

generalService.getTarget = async () => {
  try {
    const data = await uphtarget.findAll();
    return data;
  } catch (error) {
    console.error('Error executing Sequelize query:', error);
    throw error;
  }
};

generalService.getTargetById = async (condition) => {
  const data = await uphtarget.findAll({ where: condition });
  return data;
};

generalService.dayShiftCount = async (date) => {
  try {
    const result = await weeklyData1.findOne({
      attributes: [
        [
          Sequelize.fn(
            'COALESCE',
            Sequelize.fn('SUM', Sequelize.col('totalcount')),
            0,
          ),
          'totalcount',
        ],
      ],
      where: {
        op_date: date,
      },
    });

    const totalCount = result.dataValues.totalcount || 0;
    return totalCount;
  } catch (error) {
    console.error('Error executing Sequelize query:', error);
    throw error;
  }
};

generalService.getDownTime = async (shift) => {
  try {
    const result = await downtime.findAll({
      attributes: ['interval', 'downTime', 'message'],
      where: {
        shift,
      },
    });
    const formattedResult = result.map((item) => ({
      interval: item.interval,
      downTime: item.downTime,
      message: item.message,
    }));

    return formattedResult;
  } catch (error) {
    console.error('Error executing Sequelize query:', error);
    throw error;
  }
};

module.exports = generalService;

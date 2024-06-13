const generalService = require('../services/general.service');

const rescodes = require('../utility/rescodes');

const logger = require('../config/logger');

const RedisDB = require('../config/redis');
const XLSX = require('xlsx');

const emailService = require('../config/emailConfig');
const path = require('path');

const xlsx = require('xlsx');
const { DataTypes } = require('sequelize');
const { sampleData } = require('../../models/index');

const moment = require('moment');

const {
  todayFirstShift,
  todayGenaralShift,
  todaySecondShift,
  yesterdayFirstShift,
  yesterdayGenaralShift,
  yesterdaySecondShift,
  shiftDetails,
} = require('../data/shiftData');

const userController = {};

userController.shiftData = async (req, res, next) => {
  try {
    // duration 6hrs or 8hrs
    // shift 1 (1st 6hrs) or shift 2 (2nd 6hrs)
    const { line, duration, shift } = req.query;

    const redisInstance = new RedisDB();

    const currentDate = new Date();

    let currentDateString = currentDate.toISOString().split('T')[0];

    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const currentTime = currentDate.toLocaleTimeString('en-GB', options);
    // const currentTime = '08:00:00';

    let startTime;
    let endTime;
    let condition = 'AND';
    let startDate = currentDateString;
    let endDate = currentDateString;

    if (
      duration === shiftDetails?.shiftDuration &&
      (shift === shiftDetails?.firstShift ||
        shift === shiftDetails?.secondShift)
    ) {
      startTime =
        shift === shiftDetails?.firstShift
          ? todayFirstShift?.startTime
          : todaySecondShift?.startTime;
      endTime =
        shift === shiftDetails?.firstShift
          ? todayFirstShift?.endTime
          : todaySecondShift?.endTime;
    } else {
      startTime = todayGenaralShift?.startTime;
      endTime = todayGenaralShift?.endTime;
    }

    if (currentTime >= '09:00:00' && currentTime < '21:00:00') {
      currentDate.setDate(currentDate.getDate() - 1);

      if (
        duration === shiftDetails?.shiftDuration &&
        (shift === shiftDetails?.firstShift ||
          shift === shiftDetails?.secondShift)
      ) {
        startTime =
          shift === shiftDetails?.firstShift
            ? yesterdayFirstShift?.startTime
            : yesterdaySecondShift?.startTime;
        endTime =
          shift === shiftDetails?.firstShift
            ? yesterdayFirstShift?.endTime
            : yesterdaySecondShift?.endTime;
        condition =
          shift === shiftDetails?.firstShift
            ? yesterdayFirstShift?.condition
            : yesterdaySecondShift?.condition;
        startDate =
          shift === shiftDetails?.firstShift
            ? currentDate.toISOString().split('T')[0]
            : currentDateString;
      } else {
        startTime = yesterdayGenaralShift?.startTime;
        endTime = yesterdayGenaralShift?.endTime;
        condition = yesterdayGenaralShift?.condition;
        startDate = currentDate.toISOString().split('T')[0];
      }
    }

    let shiftData = await redisInstance.getValueFromRedis(
      `${line}-${startDate}-${endDate}-${startTime}-${endTime}`,
    );
    if (shiftData) {
      shiftData = JSON.parse(shiftData);
      console.log('from redis');
      res.response = {
        code: 200,
        data: { status: 'Ok', message: rescodes?.success, data: shiftData },
      };
      return next();
    }

    const general = await generalService.getShiftRecord(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
    );

    // storing data in redis
    if (general?.length) {
      let appData = JSON.stringify(general);
      redisInstance.setValueInRedis(
        `${line}-${startDate}-${endDate}-${startTime}-${endTime}`,
        appData,
      );
    }

    res.response = {
      code: 200,
      data: { status: 'Ok', message: rescodes?.success, data: general },
    };

    return next();
  } catch (error) {
    logger.error(error);
    res.response = {
      code: 400,
      data: { status: 'Error', message: rescodes?.wentWrong },
    };
    return next();
  }
};

userController.currentShiftData = async (req, res, next) => {
  try {
    const { line } = req.query;

    const currentDate = new Date();

    // const redisInstance = new RedisDB();

    let currentDateString = currentDate.toISOString().split('T')[0];

    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const currentTime = currentDate.toLocaleTimeString('en-GB', options);

    let startTime = '09:00:00';
    let endTime = '21:00:00';

    let startDate = currentDateString;
    let endDate = currentDateString;

    let condition = 'AND';

    if (currentTime >= '21:00:00' && currentTime < '09:00:00') {
      startDate = currentDateString;

      currentDate.setDate(currentDate.getDate() + 1);
      currentDateString = currentDate.toISOString().split('T')[0];

      endDate = currentDateString;

      startTime = '21:00:00';
      endTime = '09:00:00';

      condition = 'OR';
    }

    const general = await generalService.getShiftRecord(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
    );
    const convertTimeToRange = (time) => {
      const [hour] = time.split(':');
      let currentHour = parseInt(hour);

      // Handle the case where the input hour is "24"
      if (currentHour === 24) {
        currentHour = 0;
      }
      let nextHour = (currentHour + 1) % 24; // Ensures the hour wraps around at 23
      nextHour = nextHour.toString().padStart(2, '0');

      return `${currentHour.toString().padStart(2, '0')} - ${nextHour}`;
    };

    // Update the 'x' field in each object
    const updatedData = general.map((item) => {
      return {
        ...item,
        x: convertTimeToRange(item.x),
      };
    });

    res.response = {
      code: 200,
      data: { status: 'Ok', message: rescodes?.success, data: updatedData },
    };

    return next();
  } catch (error) {
    logger.error(error);
    res.response = {
      code: 400,
      data: { status: 'Error', message: rescodes?.wentWrong },
    };
    return next();
  }
};

userController.updateCurrentShiftData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const checkData = await generalService.getWeeklyDataById(id);

    if (!checkData) {
      res.response = {
        code: 404,
        data: { status: 'Error', message: rescodes?.noData },
      };
      return next();
    }

    const email = await generalService.getProductOwnerEmail(checkData.mt);

    const templateData = { code: 123, verifyCode: '' };
    const templateFilePath = path.join(__dirname, '../views/comingsoon.ejs');
    const mail = await emailService.sendEmail(
      email?.trim(),
      'Production Down time Alert',
      templateFilePath,
      templateData,
    );

    await generalService.update(id, comments);

    res.response = {
      code: 200,
      data: {
        status: 'Ok',
        message: rescodes?.success,
        data: 'Updated Successfully',
      },
    };

    return next();
  } catch (error) {
    logger.error(error);

    res.response = {
      code: 400,
      data: { status: 'Error', message: rescodes?.wentWrong },
    };
    return next();
  }
};

userController.fileUpload = async (req, res, next) => {
  try {
    const fileData = req.file.buffer;
    const workbook = XLSX.read(fileData, { type: 'buffer' });

    const sheetNames = ['Line 1', 'Line 2', 'Line 3'];
    const lineDetails = {
      'Line 1': 'L1',
      'Line 2': 'L2',
      'Line 3': 'L3',
    };

    let allData = [];

    //     // Convert the Excel serial number to JavaScript Date object
    // const date = new Date((excelDate - (25567 + 1)) * 86400 * 1000); // Convert from Excel epoch to Unix epoch

    // // Format the date using moment
    // const formattedDate = moment(date).format('MM/DD/YYYY hh:mm:ss A');

    // const a = (itm) => {
    //   let parsedDate = moment(itm, 'MM/DD/YY hh:mm A').utcOffset(0);
    //   parsedDate.date(11).month(5);
    //   return parsedDate.format('MM/DD/YY hh:mm A');
    // };

    const a = (itm) => {
      let parsedDate = moment(itm, 'MM/DD/YY hh:mm A');
      parsedDate.date(12).month(5); // Setting date to 11th and month to June (index 5 represents June)
      return parsedDate.format('MM/DD/YY hh:mm A');
    };
    sheetNames.forEach((sheetName) => {
      if (workbook.SheetNames.includes(sheetName)) {
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);
        const data = rawData.map((row) => ({
          // Op_Finish_Time: row['Op Finish Time'],
          Op_Finish_Time: a(row['Op Finish Time']),

          // Op_Finish_Time: moment(
          //   new Date((row['Op Finish Time'] - (25567 + 2)) * 86400 * 1000),
          // )
          //   .utc()
          //   .format('YYYY-MM-DD HH:mm:ssZ'),
          dest_Operation: row['Dest Operation'],
          Associate_Id: row['Associate Id'],
          Mfg_Order_Id: row['Mfg Order Id'],
          product_id: row['Product Id'],
          Serial_Num: row['Serial Num'],
          Operation_Id: row['Operation Id'],
          Work_Position_Id: row['Work Position Id'],
          line: lineDetails[sheetName],
          isActive: true,
          deletedAt: null,
        }));
        allData = allData.concat(data);
      }
    });

    // console.log('allData', allData[0]);

    if (allData.length > 0) {
      await sampleData.bulkCreate(allData, {
        ignoreDuplicates: true,
      });
    }

    res.send('Data inserted successfully');
  } catch (error) {
    logger.error(error);
    res.status(400).json({
      status: 'Error',
      message: 'Something went wrong',
    });
    return next();
  }
};

userController.previousShiftDate2 = async (req, res, next) => {
  try {
    // duration 6hrs or 8hrs
    // shift 1 (1st 6hrs) or shift 2 (2nd 6hrs)
    const { line, duration, shift } = req.query;

    // const redisInstance = new RedisDB();

    const currentDate = new Date();

    let currentDateString = currentDate.toISOString().split('T')[0];

    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const currentTime = currentDate.toLocaleTimeString('en-GB', options);
    // const currentTime = '08:00:00';

    let startTime;
    let endTime;
    let condition = 'AND';
    let startDate = currentDateString;
    let endDate = currentDateString;

    if (
      duration === shiftDetails?.shiftDuration &&
      (shift === shiftDetails?.firstShift ||
        shift === shiftDetails?.secondShift)
    ) {
      startTime =
        shift === shiftDetails?.firstShift
          ? todayFirstShift?.startTime
          : todaySecondShift?.startTime;
      endTime =
        shift === shiftDetails?.firstShift
          ? todayFirstShift?.endTime
          : todaySecondShift?.endTime;
    } else {
      startTime = todayGenaralShift?.startTime;
      endTime = todayGenaralShift?.endTime;
    }

    if (currentTime >= '09:00:00' && currentTime < '21:00:00') {
      currentDate.setDate(currentDate.getDate() - 1);

      if (
        duration === shiftDetails?.shiftDuration &&
        (shift === shiftDetails?.firstShift ||
          shift === shiftDetails?.secondShift)
      ) {
        startTime =
          shift === shiftDetails?.firstShift
            ? yesterdayFirstShift?.startTime
            : yesterdaySecondShift?.startTime;
        endTime =
          shift === shiftDetails?.firstShift
            ? yesterdayFirstShift?.endTime
            : yesterdaySecondShift?.endTime;
        condition =
          shift === shiftDetails?.firstShift
            ? yesterdayFirstShift?.condition
            : yesterdaySecondShift?.condition;
        startDate =
          shift === shiftDetails?.firstShift
            ? currentDate.toISOString().split('T')[0]
            : currentDateString;
      } else {
        startTime = yesterdayGenaralShift?.startTime;
        endTime = yesterdayGenaralShift?.endTime;
        condition = yesterdayGenaralShift?.condition;
        startDate = currentDate.toISOString().split('T')[0];
      }
    }

    // let shiftData = await redisInstance.getValueFromRedis(
    //   `${line}-${startDate}-${endDate}-${startTime}-${endTime}`,
    // );
    // if (shiftData) {
    //   shiftData = JSON.parse(shiftData);
    //   console.log('from redis');
    //   res.response = {
    //     code: 200,
    //     data: { status: 'Ok', message: rescodes?.success, data: shiftData },
    //   };
    //   return next();
    // }

    let general = await generalService.getShiftRecord2(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
    );

    // storing data in redis
    // if (general?.length) {
    //   let appData = JSON.stringify(general);
    //   redisInstance.setValueInRedis(
    //     `${line}-${startDate}-${endDate}-${startTime}-${endTime}`,
    //     appData,
    //   );
    // }

    general = general.data.map((itm) => {
      let { x } = itm;
      const aa = x.split(':');
      const ab = aa[2].split(' - ')[1];
      // x = `${aa[0] < 12 ? aa[0] : aa[0] - 12} - ${ab < 12 ? ab : ab - 12} `;
      x = `${aa[0]} - ${ab} `;

      return {
        ...itm,
        x,
      };
    });

    res.response = {
      code: 200,
      data: { status: 'Ok', message: rescodes?.success, data: general },
    };

    return next();
  } catch (error) {
    logger.error(error);
    res.response = {
      code: 400,
      data: { status: 'Error', message: rescodes?.wentWrong },
    };
    return next();
  }
};

userController.currentShiftData2 = async (req, res, next) => {
  try {
    const { line, duration, shift } = req.query;

    const currentDate = new Date();

    // const redisInstance = new RedisDB();

    let currentDateString = currentDate.toISOString().split('T')[0];

    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const currentTime = currentDate.toLocaleTimeString('en-GB', options);

    let startTime = '09:00:00';
    let endTime = '21:00:00';

    let startDate = currentDateString;
    let endDate = currentDateString;

    let condition = 'AND';

    if (currentTime >= '21:00:00' && currentTime < '09:00:00') {
      startDate = currentDateString;

      currentDate.setDate(currentDate.getDate() + 1);
      currentDateString = currentDate.toISOString().split('T')[0];

      endDate = currentDateString;

      startTime = '21:00:00';
      endTime = '09:00:00';

      condition = 'OR';
    }

    const general = await generalService.getShiftRecord2(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
    );

    const convertTimeToRange = (time) => {
      const [hour] = time.split(':');
      let currentHour = parseInt(hour);

      // Handle the case where the input hour is "24"
      if (currentHour === 24) {
        currentHour = 0;
      }
      let nextHour = (currentHour + 1) % 24; // Ensures the hour wraps around at 23
      nextHour = nextHour.toString().padStart(2, '0');

      return `${currentHour.toString().padStart(2, '0')} - ${nextHour}`;
    };

    // Update the 'x' field in each object
    let updatedData = general.data.map((item) => {
      return {
        ...item,
        x: convertTimeToRange(item.x),
      };
    });

    if (duration === '6hrs' && shift === '1st') {
      updatedData = updatedData.slice(0, 6);
    } else if (duration === '6hrs' && shift === '2nd') {
      updatedData = updatedData.slice(6, 12);
    } else {
      updatedData = updatedData.slice(0, 9);
    }

    res.response = {
      code: 200,
      data: { status: 'Ok', message: rescodes?.success, data: updatedData },
    };

    return next();
  } catch (error) {
    logger.error(error);
    res.response = {
      code: 400,
      data: { status: 'Error', message: rescodes?.wentWrong },
    };
    return next();
  }
};

module.exports = userController;

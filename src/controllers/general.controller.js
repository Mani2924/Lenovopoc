const moment = require('moment');
const path = require('path');
const xlsx = require('xlsx');

const rescodes = require('../utility/rescodes');
const logger = require('../config/logger');
const RedisDB = require('../config/redis');
const {
  convertTimeToRange,
  convertTimeTo12HourFormat,
} = require('../utility/shiftUtility');

const { sampleData, oldData } = require('../../models/index');

const generalService = require('../services/general.service');
const downTimeService = require('../services/downTime.service');
const {
  getFilteredData,
  rollingChart,
  getOverTime,
} = require('../services/generalSocket.service');

const {
  todayFirstShift,
  todayGenaralShift,
  todaySecondShift,
  yesterdayFirstShift,
  yesterdayGenaralShift,
  yesterdayTwileShift,
  yesterdaySecondShift,
  shiftDetails,
  firstShift,
  secondShift,
  getCount,
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

// Function to format time to "h:mm A"
function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  let strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function formatTimeAMPM(date) {
  let [hours, minutes] = date.split(':');
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  let strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

userController.previousShiftDate2 = async (req, res, next) => {
  try {
    // duration 6hrs or 8hrs
    // shift 1 (1st 6hrs) or shift 2 (2nd 6hrs)
    const { line, duration, shift, target } = req.query;

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
    let condition2 = 'AND start_time < end_time';

    let targetModel = parseInt(target) * extractNumber(duration);

    let actualModel = 0;
    let downTime = 52;
    let overallUph = 0;

    const formatTime = (time) => {
      const [hours, minutes, seconds] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(
        2,
        '0',
      )}:${seconds.padStart(2, '0')}`;
    };

    if (
      duration === shiftDetails?.shiftDuration &&
      (shift === shiftDetails?.firstShift ||
        shift === shiftDetails?.secondShift)
    ) {
      startTime =
        shift === shiftDetails?.firstShift
          ? formatTime(todayFirstShift?.startTime)
          : formatTime(todaySecondShift?.startTime);
      endTime =
        shift === shiftDetails?.firstShift
          ? formatTime(todayFirstShift?.endTime)
          : formatTime(todaySecondShift?.endTime);
    } else {
      startTime = formatTime(todayGenaralShift?.startTime);
      endTime = formatTime(todayGenaralShift?.endTime);
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
            ? formatTime(yesterdayFirstShift?.startTime)
            : formatTime(yesterdaySecondShift?.startTime);
        endTime =
          shift === shiftDetails?.firstShift
            ? formatTime(yesterdayFirstShift?.endTime)
            : formatTime(yesterdaySecondShift?.endTime);
        condition =
          shift === shiftDetails?.firstShift
            ? yesterdayFirstShift?.condition
            : yesterdaySecondShift?.condition;
        startDate =
          shift === shiftDetails?.firstShift
            ? currentDate.toISOString().split('T')[0]
            : currentDateString;
      } else {
        if (duration === '9hrs') {
          startTime = formatTime(yesterdayGenaralShift?.startTime);
          endTime = formatTime(yesterdayGenaralShift?.endTime);
          condition = yesterdayGenaralShift?.condition;
          startDate = currentDate.toISOString().split('T')[0];
        } else {
          startTime = formatTime(yesterdayTwileShift?.startTime);
          endTime = formatTime(yesterdayTwileShift?.endTime);
          condition = yesterdayTwileShift?.condition;
          startDate = currentDate.toISOString().split('T')[0];
        }
      }
    }

    let shiftData = await redisInstance.getValueFromRedis(
      !shift
        ? `${line}-${startDate}-${endDate}-${startTime}-${endTime}${duration}`
        : `${line}-${startDate}-${endDate}-${startTime}-${endTime}${duration}${shift}`,
    );

    if (shiftData) {
      shiftData = JSON.parse(shiftData);
      shiftData.shiftTime = `${formatTimeAMPM(startTime)} - ${formatTimeAMPM(
        endTime,
      )}`;
      console.log('from redis');
      res.response = {
        code: 200,
        data: { status: 'Ok', message: rescodes?.success, data: shiftData },
      };
      return next();
    }

    let general = await generalService.getShiftRecord2(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
      condition2,
    );

    general = general.map((itm) => {
      let { x } = itm;
      actualModel += itm.y;
      // targetModel += itm.target;
      const aa = x.split(':');
      const ab = aa[2].split(' - ')[1];
      // x = `${aa[0] < 12 ? aa[0] : aa[0] - 12} - ${ab < 12 ? ab : ab - 12} `;
      const startHour = aa[0].padStart(2, '0');
      const startFormatted =
        startHour <= 12
          ? startHour === '00'
            ? '12'
            : startHour
          : (startHour - 12).toString().padStart(2, '0');

      const endHour = ab.padStart(2, '0');
      const endFormatted =
        endHour <= 12
          ? endHour === '00'
            ? '12'
            : endHour
          : (endHour - 12).toString().padStart(2, '0');

      x = `${startFormatted} - ${endFormatted}`;

      // x = `${aa[0]} - ${ab} `;

      return {
        ...itm,
        x,
        actualModel,
      };
    });

    overallUph = Math.round(actualModel / general.length);

    // storing data in redis
    if (general?.length) {
      let appData = JSON.stringify({
        data: general,
        shiftUPH: overallUph,
        shiftdownTime: downTime,
        shiftActual: actualModel,
        shiftTarget: targetModel,
        totalCount: general?.length,
      });
      redisInstance.setValueInRedis(
        !shift
          ? `${line}-${startDate}-${endDate}-${startTime}-${endTime}${duration}`
          : `${line}-${startDate}-${endDate}-${startTime}-${endTime}${duration}${shift}`,
        appData,
      );
    }

    res.response = {
      code: 200,
      data: {
        status: 'Ok',
        message: rescodes?.success,
        data: {
          data: general,
          shiftTarget: targetModel,
          shiftActual: actualModel,
          shiftUPH: overallUph,
          shiftdownTime: downTime,
          totalCount: general?.length || 0,
          shiftTiming: `${formatTimeAMPM(startTime)} - ${formatTimeAMPM(
            endTime,
          )}`,
        },
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

userController.currentShiftData2 = async (req, res, next) => {
  try {
    const { line, duration, shift, target } = req.query;

    const currentDate = new Date();

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
    let condition2 = 'AND start_time < end_time';

    let shiftStartTime = new Date();
    let shiftEndTime = new Date();

    shiftStartTime.setHours(9, 0, 0, 0);
    shiftEndTime.setHours(21, 0, 0, 0);

    // let shiftStartTime = moment().startOf("day");
    // let shiftEndTime = moment().startOf("day");

    // shiftStartTime.set("hour", "09");
    // shiftEndTime.set("hour", "21");

    if (currentTime >= '21:00:00' || currentTime < '09:00:00') {
      startDate = currentDateString;

      currentDate.setDate(currentDate.getDate() + 1);
      currentDateString = currentDate.toISOString().split('T')[0];

      endDate = currentDateString;

      startTime = '21:00:00';
      endTime = '09:00:00';

      condition = 'OR';
      // shiftStartTime.set("hour", "21");
      // shiftEndTime.set("hour", "09");
      shiftStartTime.setHours(21, 0, 0, 0);
      shiftEndTime.setHours(9, 0, 0, 0);
    }

    const general = await generalService.getShiftRecord2(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
      condition2,
    );

    const convertTimeToRange = (time) => {
      const [hour] = time.split(':');
      let currentHour = parseInt(hour);

      // Handle the case where the input hour is "24"
      if (currentHour === 24) {
        currentHour = 0;
      }
      let nextHour = (currentHour + 1) % 24; // Ensures the hour wraps around at 23

      // Format the hours for 12-hour clock with leading zeros
      const currentHour12 = currentHour % 12 === 0 ? 12 : currentHour % 12;
      const nextHour12 = nextHour % 12 === 0 ? 12 : nextHour % 12;

      const currentHourString = currentHour12.toString().padStart(2, '0');
      const nextHourString = nextHour12.toString().padStart(2, '0');

      return `${currentHourString} - ${nextHourString}`;
    };

    // Update the 'x' field in each object
    let updatedData = general.map((item) => {
      return {
        ...item,
        x: convertTimeToRange(item.x),
      };
    });

    let repeatedXValues = [];
    let nonRepeatedXValues = [];

    updatedData.forEach((item, index) => {
      const firstIndex = updatedData.findIndex((el) => el.x === item.x);
      if (
        firstIndex !== index &&
        !repeatedXValues.some((el) => el.x === item.x)
      ) {
        const repeatedItems = updatedData.filter((el) => el.x === item.x);
        const combinedY = repeatedItems.reduce((sum, el) => sum + el.y, 0);
        const combinedProductIds = repeatedItems
          .map((el) => el.product_id)
          .join(',');
        // const combinedTarget = repeatedItems.reduce(
        //   (sum, el) => sum + el.target,
        //   0,
        // );
        const combinedTarget = Math.min(
          ...repeatedItems.map((val) => val.target),
        );
        const newItem = {
          ...item,
          y: combinedY,
          product_id: combinedProductIds,
          target: combinedTarget,
        };
        repeatedXValues.push(newItem);

        // Remove all occurrences of items with the same x value from both arrays
        // repeatedXValues = repeatedXValues.filter((el) => el.x !== item.x);
        nonRepeatedXValues = nonRepeatedXValues.filter((el) => el.x !== item.x);
      } else if (
        !repeatedXValues.some((el) => el.x === item.x) &&
        !nonRepeatedXValues.some((el) => el.x === item.x)
      ) {
        nonRepeatedXValues.push(item);
      }
    });

    // updatedData = repeatedXValues.concat(nonRepeatedXValues);
    updatedData = nonRepeatedXValues.concat(repeatedXValues);

    if (duration === '6hrs' && shift === '1st') {
      updatedData = updatedData.slice(0, 6);
      // shiftEndTime.subtract("6", "hours");
      shiftEndTime.setHours(shiftEndTime.getHours() - 6);
    } else if (duration === '6hrs' && shift === '2nd') {
      updatedData = updatedData.slice(6, 12);
      // shiftStartTime.subtract("6", "hours");
      shiftStartTime.setHours(shiftStartTime.getHours() - 6);
    } else {
      if (duration === '9hrs') {
        updatedData = updatedData.slice(0, 9);
        // shiftEndTime.subtract("3", "hours");
        shiftEndTime.setHours(shiftEndTime.getHours() - 3);
      } else {
        updatedData = updatedData.slice(0, 12);
        // shiftEndTime.subtract("3", "hours");
        shiftEndTime.setHours(shiftEndTime.getHours());
      }
    }
    const shiftActual = updatedData.reduce((sum, item) => sum + item.y, 0);

    res.response = {
      code: 200,
      data: {
        status: 'Ok',
        message: rescodes?.success,
        data: {
          updatedData,
          shiftTarget: parseInt(target, 10) * extractNumber(duration),
          shiftActual,
          shiftUPH: Math.round(shiftActual / updatedData?.length),
          shiftdownTime: 52,
          totalCount: updatedData?.length,
          shiftTiming: `${formatAMPM(shiftStartTime)} - ${formatAMPM(
            shiftEndTime,
          )}`,
          // shiftTiming: `${shiftStartTime.format("h:mm A")} - ${shiftEndTime.format("h:mm A")}`,
        },
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

userController.targetCalculation = async (req, res, next) => {
  try {
    const eachDayTargetByModel = await generalService.getProductModes();

    if (eachDayTargetByModel == null) {
      res.response = {
        code: 400,
        data: { status: 'Error', message: rescodes?.wentWrong },
      };
      return next();
    }

    const storeTargetValue = await generalService.createTargetValue(
      eachDayTargetByModel,
    );

    res.response = {
      code: 200,
      data: {
        status: 'Ok',
        message: rescodes?.success,
        data: storeTargetValue,
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

userController.shiftDataBasedOnDate = async (req, res, next) => {
  try {
    // duration 6hrs or 8hrs
    // shift 1 (1st 6hrs) or shift 2 (2nd 6hrs)
    const { line, duration, shift, date } = req.query;

    const currentDate = new DateFormat(date);
    currentDate.setStartOfDay();
    // console.log('setStartOfDay', currentDate);

    // currentDate.addHours(5);
    currentDate.setHours(2);

    // console.log('currentDate', currentDate);
    // console.log('currentDate', currentDate.getHours());

    res.response = {
      code: 200,
      data: {
        status: 'Ok',
        message: rescodes?.success,
        data: 'success',
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

userController.displayPreviousTwoShiftsData = async (req, res, next) => {
  try {
    const { line, duration, date, shift, target } = req.query;

    const currentDate = new Date();
    // const currentDate = new Date(date);

    currentDate.setDate(currentDate.getDate() - 1);

    let currentDateString = currentDate.toISOString().split('T')[0];

    let startTime;
    let endTime;
    let condition = 'AND';
    let startDate = currentDateString;
    let endDate = currentDateString;
    let condition2 = 'AND start_time < end_time';

    let shiftAStartTime = new Date();
    let shiftAEndTime = new Date();

    let shiftBStartTime = new Date();
    let shiftBEndTime = new Date();

    shiftAStartTime.setHours(9, 0, 0, 0);
    shiftAEndTime.setHours(21, 0, 0, 0);

    shiftBStartTime.setHours(21, 0, 0, 0);
    shiftBEndTime.setHours(9, 0, 0, 0);

    if (duration === '6hrs') {
      startTime = firstShift?.startTime;
      endTime = firstShift?.endTime;
    } else if (duration === '9hrs') {
      startTime = todayGenaralShift?.startTime;
      endTime = todayGenaralShift?.endTime;
    } else {
      startTime = firstShift?.startTime;
      endTime = firstShift?.endTime;
    }

    let general = await generalService.getShiftRecord3(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
      condition2,
    );

    currentDate.setDate(currentDate.getDate() + 1);
    endDate = currentDate.toISOString().split('T')[0];
    condition2 = 'AND end_time > start_time';

    if (duration === '6hrs') {
      startTime = secondShift?.startTime;
      endTime = secondShift?.endTime;
      condition = secondShift?.condition;
    } else if (duration === '9hrs') {
      startTime = yesterdayGenaralShift?.startTime;
      endTime = yesterdayGenaralShift?.endTime;
      condition = yesterdayGenaralShift?.condition;
    } else {
      startTime = secondShift?.startTime;
      endTime = secondShift?.endTime;
      condition = secondShift?.condition;
    }

    let general2 = await generalService.getShiftRecord3(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
      condition2,
    );
    const shiftAdowntimeDetails = await generalService.getDownTime('1');
    const shiftBdowntimeDetails = await generalService.getDownTime('2');

    const convert = (general, shifts) => {
      let shiftStart, shiftEnd, downtimeDetails;
      if (shifts === 'shiftA') {
        shiftStart = shiftAStartTime;
        shiftEnd = shiftAEndTime;
        downtimeDetails = shiftAdowntimeDetails;
      } else {
        shiftStart = shiftBStartTime;
        shiftEnd = shiftBEndTime;
        downtimeDetails = shiftBdowntimeDetails;
      }

      let updatedData;
      const data = general.map((itm) => {
        let { x } = itm;
        const aa = x.split(':');
        const ab = aa[2].split(' - ')[1];

        const startHour = aa[0].padStart(2, '0');
        const startFormatted =
          startHour <= 12
            ? startHour === '00'
              ? '12'
              : startHour
            : (startHour - 12).toString().padStart(2, '0');

        const endHour = ab.padStart(2, '0');
        const endFormatted =
          endHour <= 12
            ? endHour === '00'
              ? '12'
              : endHour
            : (endHour - 12).toString().padStart(2, '0');

        x = `${startFormatted} - ${endFormatted}`;

        let downtime = downtimeDetails.find((detail) => detail.interval === x);

        return {
          ...itm,
          x,
          downtime: downtime ? downtime.downTime : '-',
          message: downtime ? downtime.message : '',
        };
      });

      if (duration === '6hrs' && shift === '1st') {
        updatedData = data.slice(0, 6);
        shiftEnd.setHours(shiftEnd.getHours() - 6);
      } else if (duration === '6hrs' && shift === '2nd') {
        updatedData = data.slice(6, 12);
        shiftStart.setHours(shiftStart.getHours() - 6);
      } else if (duration === '9hrs') {
        updatedData = data.slice(0, 9);
        shiftEnd.setHours(shiftEnd.getHours() - 3);
      } else {
        updatedData = data.slice(0, 12);
      }

      shifts === 'shiftA'
        ? (shiftAStartTime = shiftStart)
        : (shiftBStartTime = shiftStart);
      shifts === 'shiftA'
        ? (shiftAEndTime = shiftEnd)
        : (shiftBEndTime = shiftEnd);

      return updatedData;
    };

    const shiftA = convert(general, 'shiftA');
    const shiftB = convert(general2, 'shiftB');
    const shiftActualA = shiftA.reduce((total, item) => total + item.y, 0);
    const shiftActualB = shiftB.reduce((total, item) => total + item.y, 0);
    const totalShiftADowntime = shiftAdowntimeDetails.reduce(
      (total, item) => total + parseInt(item.downTime),
      0,
    );
    const totalShiftBDowntime = shiftBdowntimeDetails.reduce(
      (total, item) => total + parseInt(item.downTime),
      0,
    );
    const totalOverallDowntime = totalShiftADowntime + totalShiftBDowntime;

    res.response = {
      code: 200,
      data: {
        status: 'Ok',
        message: rescodes?.success,
        data: {
          shiftA,
          shiftB,
          shiftAdowntimeDetails,
          shiftBdowntimeDetails,
          shiftADetails: {
            shiftTarget: parseInt(target, 10) * extractNumber(duration),
            shiftActual: shiftActualA,
            shiftUPH: Math.round(shiftActualA / shiftA.length),
            shiftdownTime: totalShiftADowntime,
          },
          shiftBDetails: {
            shiftTarget: parseInt(target, 10) * extractNumber(duration),
            shiftActual: shiftActualB,
            shiftUPH: Math.round(shiftActualB / shiftB.length),
            shiftdownTime: totalShiftBDowntime,
          },
          overAllDetails: {
            overAllTarget: parseInt(target, 10) * extractNumber(duration) * 2,
            overAllActual: shiftActualA + shiftActualB,
            overAllUPH: Math.round(
              (Math.round(shiftActualA / shiftA.length) +
                Math.round(shiftActualB / shiftB.length)) /
                2,
            ),
            overAlldownTime: totalOverallDowntime,
          },
          totalCount: shiftA?.length + shiftB?.length || 0,
          shiftATiming: `${formatAMPM(shiftAStartTime)} - ${formatAMPM(
            shiftAEndTime,
          )}`,
          shiftBTiming: `${formatAMPM(shiftBStartTime)} - ${formatAMPM(
            shiftBEndTime,
          )}`,
        },
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

const getPreviousTwoHoursIntervals = () => {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);

  // Set the start time to two hours before the current time
  start.setHours(start.getHours() - 2);

  const formatTime = (date) => {
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'pm' : 'am';
    return `${hours}:${minutes} ${ampm}`;
  };

  return {
    start: formatTime(start),
    end: formatTime(end),
  };
};

const getLastTwoFullHoursIntervals = () => {
  const now = new Date();
  const end1 = new Date(now);
  const end2 = new Date(now);

  // Round down to the previous full hour for the end times
  end1.setMinutes(0, 0, 0);
  end2.setMinutes(0, 0, 0);

  // Set the start times to one and two hours before the current full hour
  end1.setHours(end1.getHours() - 1);
  end2.setHours(end2.getHours() - 2);

  const formatTime = (date) => {
    const hours = date.getHours() % 12 || 12;
    const ampm = date.getHours() >= 12 ? 'pm' : 'am';
    return `${hours}:00 ${ampm}`;
  };

  const interval1 = `${formatTime(end2)} - ${formatTime(end1)}`;
  const interval2 = `${formatTime(end1)} - ${formatTime(now)}`;

  return [interval1, interval2];
};

userController.getDownTime = async (req, res, next) => {
  try {
    const { isShift, record } = req.query;
    const now = new Date();
    const currentHour = now.getHours();
    let downtimeDetails = [];

    if (isShift === 'false' || !isShift) {
      if (record === 'true') {
        downtimeDetails = [
          {
            interval: '03:00 - 04:00 pm',
            downTime: '10 mins',
            message: 'Conveyor is stopped',
          },
          {
            interval: '04:00 - 05:00 pm',
            downTime: '20 mins',
            message: 'Part Failure',
          },
          {
            interval: '05:00 - 06:00 pm',
            downTime: '15 mins',
            message: 'No Load',
          },
          {
            interval: '06:00 - 07:00 pm',
            downTime: '10 mins',
            message: 'Operator trainer',
          },
          {
            interval: '07:00 - 08:00 pm',
            downTime: '07 mins',
            message: 'Production failure',
          },
        ];
      } else {
        // Return the standard downtime details
        downtimeDetails = [
          {
            interval: '03:00 - 04:00 pm',
            downTime: '10 mins',
            message: 'Conveyor is stopped',
          },
          {
            interval: '04:00 - 05:00 pm',
            downTime: '17 mins',
            message: 'Part Failure',
          },
        ];
      }
    } else if (isShift === 'true') {
      if (currentHour === 9) {
        downtimeDetails = [];
      } else if (currentHour === 10) {
        const [interval1] = getLastTwoFullHoursIntervals();
        downtimeDetails = [
          {
            interval: interval1,
            downTime: '17 mins',
            message: 'No Load',
          },
        ];
      } else {
        const [interval1, interval2] = getLastTwoFullHoursIntervals();
        downtimeDetails = [
          {
            interval: interval1,
            downTime: '10 mins',
            message: 'No Load',
          },
          {
            interval: interval2,
            downTime: '12 mins',
            message: 'Operator trainer',
          },
        ];
      }
    }

    res.status(200).json({
      code: 200,
      data: downtimeDetails,
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      data: { status: 'Error', message: 'Something went wrong' },
    });
    return next(error);
  }
};

userController.getEmoji = async (req, res, next) => {
  try {
    const date = new Date();
    const { isShift, dataCount } = req.query;

    const currentTime = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const databaseDate = new Date(date);
    databaseDate.setHours(databaseDate.getHours() - 1);
    databaseDate.setMinutes(0, 0, 0);
    const databaseTime = databaseDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const formattedDatabaseDate = databaseDate.toISOString().split('T')[0];
    const minutes = parseInt(currentTime.split(':')[1]);

    let isHappy = false;
    if (isShift === 'false' || !isShift) {
      const data = await generalService.getPriviousHourCount(
        formattedDatabaseDate,
        databaseTime,
      );
      if (minutes >= 1 && minutes <= 20) {
        if (data / 4 <= dataCount) {
          isHappy = true;
        }
      } else if (minutes >= 21 && minutes <= 40) {
        if (data / 3 <= dataCount) {
          isHappy = true;
        }
      } else if (minutes >= 41 && minutes <= 60) {
        if (data / 2 <= dataCount) {
          isHappy = true;
        }
      } else {
        isHappy = false;
      }
    } else {
      const count = await previousShiftDate2();
      const currectShiftCount = await getCurrentShiftCount();
      if (count <= currectShiftCount) {
        isHappy = true;
      }
    }

    res.status(200).json({
      code: 200,
      data: {
        isHappy,
      },
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      data: { status: 'Error', message: 'Something went wrong' },
    });
    return next(error);
  }
};

const previousShiftDate2 = async (req) => {
  try {
    const line = 'L1';

    const currentDate = new Date();
    let currentDateString = currentDate.toISOString().split('T')[0];

    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const currentTime = currentDate.toLocaleTimeString('en-GB', options);

    let startTime;
    let endTime;
    let condition = 'AND';
    let startDate = currentDateString;
    let endDate = currentDateString;
    let condition2 = 'start_time < end_time';

    const formatTime = (time) => {
      const [hours, minutes, seconds] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(
        2,
        '0',
      )}:${seconds.padStart(2, '0')}`;
    };

    startTime = formatTime(todayGenaralShift?.startTime);
    endTime = formatTime(todayGenaralShift?.endTime);

    if (currentTime >= '09:00:00' && currentTime < '21:00:00') {
      currentDate.setDate(currentDate.getDate() - 1);

      startTime = formatTime(yesterdayTwileShift?.startTime);
      endTime = formatTime(yesterdayTwileShift?.endTime);
      condition = yesterdayTwileShift?.condition;
      startDate = currentDate.toISOString().split('T')[0];
    }

    const totalCount = await generalService.getCount(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
      condition2,
    );

    return totalCount;
  } catch (error) {
    console.error('Error in previousShiftDate2:', error);
    return 0;
  }
};

const getCurrentShiftCount = async (req) => {
  try {
    const line = 'L1';

    const currentDate = new Date();
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
    let condition2 = 'AND start_time < end_time';

    if (currentTime <= '21:00:00' && currentTime < '09:00:00') {
      startDate = currentDateString;

      currentDate.setDate(currentDate.getDate() + 1);
      currentDateString = currentDate.toISOString().split('T')[0];

      endDate = currentDateString;

      startTime = '21:00:00';
      endTime = '09:00:00';

      condition = 'OR';
    }

    const totalCount = await generalService.getCurrentShiftCount(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
      condition2,
    );

    return totalCount;
  } catch (error) {
    return 0;
  }
};

userController.getSystemUPH = async (req, res, next) => {
  try {
    const { isSystem, date } = req.query;

    let recievedDate = new Date(date);
    const currentDate = new Date();

    const isSameDay =
      recievedDate.getFullYear() === currentDate.getFullYear() &&
      recievedDate.getMonth() === currentDate.getMonth() &&
      recievedDate.getDate() === currentDate.getDate();

    let isToday = isSameDay;
    let shift = '1st';
    // currentDate.getHours() >= "9" && currentDate.getHours() < "21"
    //   ? "1st"
    //   : "2nd";

    const condition = {
      isToday,
      shift,
    };

    const results = await generalService.getTargetById(condition);

    const responseData = results.map((data) => ({
      target: isSystem === 'true' ? data.systemTarget : data.assignedTarget,
      model: data.model,
      time: data.time,
    }));

    res.status(200).json({
      code: 200,
      data: responseData,
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      data: { status: 'Error', message: 'Something went wrong' },
    });
    return next(error);
  }
};

userController.productionData = async (req, res, next) => {
  try {
    const { line, duration, target, date, shift, isSystem } = req.query;

    let recievedDate = new Date(date);
    // recievedDate = new Date(recievedDate.getTime() + recievedDate.getTimezoneOffset() * 60000);

    const currentDate = new Date();

    const isSameDay =
      recievedDate.getFullYear() === currentDate.getFullYear() &&
      recievedDate.getMonth() === currentDate.getMonth() &&
      recievedDate.getDate() === currentDate.getDate();

    const {
      general: shiftA,
      shiftADetails,
      shiftADowntimeDetails,
    } = await productionDataFirstShift({
      line,
      duration,
      target,
      date,
      shift,
      isSameDay,
      isSystem,
    });

    const {
      general: shiftB,
      shiftBDetails,
      shiftBDowntimeDetails,
    } = await productionDataSecondShift({
      line,
      duration,
      target,
      date,
      shift,
      isSameDay,
      isSystem,
    });

    let currectShiftCount = 0;

    if (isSameDay) {
      currectShiftCount = 1;
    }

    const shiftUPHA = shiftADetails?.shiftUPH ?? 0;
    const shiftUPHB = shiftBDetails?.shiftUPH ?? 0;

    const averageShiftUPH =
      (shiftUPHA + shiftUPHB) / (shiftUPHA === 0 || shiftUPHB === 0 ? 1 : 2);

    const overAllDetails = {
      overAllTarget: shiftADetails?.shiftTarget + shiftBDetails?.shiftTarget,
      overAllActual: shiftADetails?.shiftActual + shiftBDetails?.shiftActual,
      overAllUPH: averageShiftUPH,
      overAllOrdercount:
        shiftADetails?.mfgOrderCount + shiftBDetails?.mfgOrderCount,
      overAlldownTime:
        shiftADetails?.shiftdownTime + shiftBDetails?.shiftdownTime,
    };

    const result = {
      shiftA,
      shiftADetails,
      shiftADowntimeDetails,
      shiftB,
      shiftBDetails,
      shiftBDowntimeDetails,
      totalCount: shiftA?.length + shiftB?.length,
      overAllDetails,
    };

    if (isSameDay) {
      result.currentShift =
        currentDate.getHours() >= '9' && currentDate.getHours() < '21'
          ? 'shiftA'
          : 'shiftB';
    }

    res.response = {
      code: 200,
      data: {
        status: 'Ok',
        message: rescodes?.success,
        data: result,
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

const productionDataSecondShift = async ({
  line,
  duration,
  target,
  date,
  shift,
  isSameDay,
  isSystem,
}) => {
  try {
    const currentDate = new Date(date);

    let startTime = '21:00:00';
    let endTime = '09:00:00';
    let startDate = currentDate.toISOString().split('T')[0];
    currentDate.setDate(currentDate.getDate() + 1);
    let endDate = currentDate.toISOString().split('T')[0];
    let condition = 'OR';
    let condition2 = 'AND start_time < end_time';

    let shiftStartTime = currentDate;
    let shiftEndTime = currentDate;
    shiftStartTime.setHours(21, 0, 0, 0);
    shiftEndTime.setHours(9, 0, 0, 0);
    const now = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };
    const currentTimeIST = now.toLocaleTimeString('en-IN', options);

    let OtTimeCount = 0;

    if (currentTimeIST >= '5:30:00 am' && currentTimeIST <= '6:30:00 am') {
      OtTimeCount = 1;
    } else if (
      currentTimeIST > '6:45:00 am' &&
      currentTimeIST <= '9:00:00 am'
    ) {
      OtTimeCount = 2;
    }

    let targetModel = 0;

    if (isSystem === 'true') {
      if (isSameDay) {
        targetModel = 110 * 7.5 + 110 * OtTimeCount;
      } else {
        if (duration === '9hrs') {
          targetModel = 105 * 7.5;
        } else {
          targetModel = 105 * 9.5;
        }
      }
    } else {
      if (isSameDay) {
        targetModel = 121 * 7.5 + 121 * OtTimeCount;
      } else {
        if (duration === '9hrs') {
          targetModel = 117 * 7.5;
        } else {
          targetModel = 117 * 9.5;
        }
      }
    }
    targetModel = Math.round(targetModel);

    // let targetModel = duration && target ? parseInt(target) * extractNumber(duration) : 80 * 12;
    let shiftActual = 0;
    let downTime = 0;

    if (duration === '9hrs') {
      endTime = '06:00:00';
      shiftEndTime.setHours(6, 0, 0, 0);
    } else if (duration === '6hrs') {
      if (shift === '1st') {
        endTime = '03:00:00';
        shiftEndTime.setHours(3, 0, 0, 0);
      } else if (shift === '2nd') {
        startTime = '03:00:00';
        shiftStartTime.setHours(3, 0, 0, 0);
        condition = 'AND';
        startDate = endDate;
      }
    }

    // if (!isSameDay) {
    //   let shiftData = await getDataFromRedis(
    //     shift && duration === "6hrs"
    //       ? `${line}-${date}-${startTime}-${endTime}-${duration}-${shift}`
    //       : `${line}-${date}-${startTime}-${endTime}-${duration}`,
    //   );

    //   if (shiftData) {
    //     shiftData = JSON.parse(shiftData);
    //     console.log("from redis");
    //     return shiftData;
    //   }
    // }

    let general = await generalService.getShiftRecord2(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
      condition2,
    );

    let overTime = '00:00 - 00:00';
    let overTimeStart = '00:00:00';
    let overTimeEnd = '00:00:00';

    const downTimeDatas = await downTimeService.getAll();

    const shiftBDowntimeDetails = [];
    let orderCount = 0;
    let product_count = 0;
    const data = await getFilteredData();
    let count = 0;
    let frequencyMap = {};
    let mode = null;
    let maxFrequency = 0;
    general.forEach((data) => {
      count += data.y;
      const yValue = data.y;
      frequencyMap[yValue] = (frequencyMap[yValue] || 0) + 1;
      if (frequencyMap[yValue] > maxFrequency) {
        maxFrequency = frequencyMap[yValue];
        mode = yValue;
      }
    });
    let shiftActualCount = 0;
    if (isSameDay == true) {
      shiftActualCount = data.totalCount;
    }

    general = general.map((val, index) => {
      orderCount += val.ordercount;
      product_count += val.product_count;
      let min = 24;
      let max = 26;
      let randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
      val.headcount = randomValue;
      val.upph = (val.y / randomValue).toFixed(1);
      const downTimeData =
        index % 2 !== 0
          ? '-'
          : downTimeDatas[index]?.downTime.replace(' mins', '') || '-';
      const downTimeMessage =
        index % 2 !== 0 ? '-' : downTimeDatas[index]?.message || '-';

      if (/\d/.test(downTimeData)) {
        downTime = parseInt(downTimeData.split(' ')[0]) + downTime;

        const [shiftAStart, shiftAEnd] = val.x.split(' - ');

        shiftBDowntimeDetails.push({
          interval: `${formatTimeAMPM(shiftAStart)} - ${formatTimeAMPM(
            shiftAEnd,
          )}`,
          downTime: downTimeData,
          message: downTimeMessage,
        });
      }

      // over Time calculation
      let [startTime, endTime] = val?.x.split(' - ');
      // overTime =
      //   endTime > '06:00:00' && endTime <= '09:00:00' ? endTime : overTime;
      overTimeStart =
        startTime >= '05:00:00' && endTime <= '09:00:00'
          ? '05:30:00'
          : overTimeStart;
      overTimeEnd =
        startTime >= '05:00:00' && endTime <= '09:00:00'
          ? endTime
          : overTimeEnd;

      return {
        ...val,
        x: convertTimeToRange(val.x),
        downtime: downTimeData,
        message: downTimeMessage,
      };
    });
    let currentHour = 0;
    if (shiftStartTime != startTime) {
      currentHour = 1;
    }

    let currentCount = 0;

    if (!isSameDay) {
      if (currentTimeIST > '9:00:00 pm' && currentTimeIST > '9:00:00 am') {
        currentCount = data.totalCount;
      }
    }

    overTime =
      overTimeStart && overTimeEnd !== '00:00:00'
        ? `${convertTimeTo12HourFormat(
            overTimeStart,
          )} - ${convertTimeTo12HourFormat(overTimeEnd)}`
        : overTime;

    const result = {
      general,
      shiftBDetails: {
        shiftTarget: targetModel,
        shiftActual: count,
        shiftUPH: mode || 0,
        shiftdownTime: downTime,
        mfgOrderCount: orderCount || 0,
        mfgProductCount: product_count || 0,
        shiftTiming: `${formatTimeAMPM(startTime)} - ${formatTimeAMPM(
          endTime,
        )}`,
        // overTime: overTime !== '0' ? formatTimeAMPM(overTime) : overTime,
        overTime,
      },
      shiftBDowntimeDetails: shiftBDowntimeDetails.reverse(),
    };

    // if (!isSameDay && general?.length) {
    //   let key =
    //     shift && duration === "6hrs"
    //       ? `${line}-${date}-${startTime}-${endTime}-${duration}-${shift}`
    //       : `${line}-${date}-${startTime}-${endTime}-${duration}`;
    //   await storeDataInRedis(result, key);
    //   // console.log("stored data in redis");
    // }

    return result;
  } catch (error) {
    throw error;
  }
};

const getDataFromRedis = async (data) => {
  const redisInstance = new RedisDB();
  let shiftData = await redisInstance.getValueFromRedis(data);
  return shiftData;
};

const storeDataInRedis = async (data, key) => {
  const redisInstance = new RedisDB();
  let appData = JSON.stringify(data);
  await redisInstance.setValueInRedis(key, appData);
};

const productionDataFirstShift = async ({
  line,
  duration,
  target,
  date,
  shift,
  isSameDay,
  isSystem,
}) => {
  try {
    const currentDate = new Date(date);

    let currentDateString = currentDate.toISOString().split('T')[0];

    let startTime = '09:00:00';
    let endTime = '21:00:00';
    let startDate = currentDateString;
    let endDate = currentDateString;
    let condition = 'AND';
    let condition2 = 'AND start_time < end_time';

    let shiftStartTime = currentDate;
    let shiftEndTime = currentDate;
    shiftStartTime.setHours(9, 0, 0, 0);
    shiftEndTime.setHours(21, 0, 0, 0);

    const now = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };
    const currentTimeIST = now.toLocaleTimeString('en-IN', options);

    let OtTimeCount = 0;

    if (currentTimeIST >= '5:30:00 pm' && currentTimeIST <= '6:30:00 pm') {
      OtTimeCount = 1;
    } else if (
      currentTimeIST > '6:45:00 pm' &&
      currentTimeIST <= '9:00:00 pm'
    ) {
      OtTimeCount = 2;
    }

    let targetModel = 0;

    if (isSystem === 'true') {
      if (isSameDay) {
        targetModel = 110 * 7.5 + 110 * OtTimeCount;
      } else {
        if (duration === '9hrs') {
          targetModel = 105 * 7.5;
        } else {
          targetModel = 105 * 9.5;
        }
      }
    } else {
      if (isSameDay) {
        targetModel = 121 * 7.5 + 121 * OtTimeCount;
      } else {
        if (duration === '9hrs') {
          targetModel = 117 * 7.5;
        } else {
          targetModel = 117 * 9.5;
        }
      }
    }
    targetModel = Math.round(targetModel);

    let shiftActual = 0;
    let downTime = 0;

    if (duration === '9hrs') {
      endTime = '18:00:00';
      shiftEndTime.setHours(18, 0, 0, 0);
    } else if (duration === '6hrs') {
      if (shift === '1st') {
        endTime = '15:00:00';
        shiftEndTime.setHours(15, 0, 0, 0);
      } else if (shift === '2nd') {
        startTime = '15:00:00';
        shiftStartTime.setHours(15, 0, 0, 0);
      }
    }

    // if (!isSameDay) {
    //   let shiftData = await getDataFromRedis(
    //     shift && duration === "6hrs"
    //       ? `${line}-${date}-${startTime}-${endTime}-${duration}-${shift}`
    //       : `${line}-${date}-${startTime}-${endTime}-${duration}`,
    //   );
    //   if (shiftData) {
    //     shiftData = JSON.parse(shiftData);
    //     console.log("from redis");
    //     return shiftData;
    //   }
    // }

    let general = await generalService.getShiftRecord2(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
      condition2,
    );

    let overTime = '00:00 - 00:00';
    let overTimeStart = '00:00:00';
    let overTimeEnd = '00:00:00';

    const downTimeDatas = await downTimeService.getAll();

    const data = await getFilteredData();
    const shiftADowntimeDetails = [];
    let orderCount = 0;
    let product_count = 0;

    if (general.length === 0) {
      shiftActual = data.totalCount;
    }

    let count = 0;
    let frequencyMap = {};
    let mode = null;
    let maxFrequency = 0;
    general.forEach((data) => {
      const yValue = data.y;
      frequencyMap[yValue] = (frequencyMap[yValue] || 0) + 1;
      if (frequencyMap[yValue] > maxFrequency) {
        maxFrequency = frequencyMap[yValue];
        mode = yValue;
      }
    });

    general.forEach((data) => {
      count += data.y;
    });

    let shiftActualCount = 0;

    if (isSameDay === 'true') {
      shiftActualCount = data.totalCount;
    }
    general = general.map((val, index) => {
      orderCount += val.ordercount;
      product_count += val.product_count;
      let min = 24;
      let max = 26;
      let randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
      val.headcount = randomValue;
      val.upph = (val.y / randomValue).toFixed(1);

      const downTimeData =
        index % 2 !== 0
          ? '-'
          : downTimeDatas[index]?.downTime.replace(' mins', '') || '-';
      const downTimeMessage =
        index % 2 !== 0 ? '-' : downTimeDatas[index]?.message || '-';

      if (/\d/.test(downTimeData)) {
        downTime = parseInt(downTimeData.split(' ')[0]) + downTime;

        const [shiftAStart, shiftAEnd] = val.x.split(' - ');

        shiftADowntimeDetails.push({
          interval: `${formatTimeAMPM(shiftAStart)} - ${formatTimeAMPM(
            shiftAEnd,
          )}`,
          downTime: downTimeData,
          message: downTimeMessage,
        });
      }

      // over Time calculation
      let [startTime, endTime] = val?.x.split(' - ');
      overTimeStart =
        startTime >= '17:00:00' && endTime <= '21:00:00'
          ? '17:30:00'
          : overTimeStart;
      overTimeEnd =
        startTime >= '17:00:00' && endTime <= '21:00:00'
          ? endTime
          : overTimeEnd;

      return {
        ...val,
        x: convertTimeToRange(val.x),
        downtime: downTimeData,
        message: downTimeMessage,
      };
    });

    let currentHour = 0;
    if (shiftStartTime != startTime) {
      currentHour = 1;
    }

    let currentCount = 0;

    if (!isSameDay) {
      if (currentTimeIST < '9:00:00 pm' && currentTimeIST < '9:00:00 am') {
        currentCount = data.totalCount;
      }
    }

    overTime =
      overTimeStart && overTimeEnd !== '00:00:00'
        ? `${convertTimeTo12HourFormat(
            overTimeStart,
          )} - ${convertTimeTo12HourFormat(overTimeEnd)}`
        : overTime;

    const result = {
      general,
      shiftADetails: {
        shiftTarget: targetModel,
        shiftActual: count + currentCount,
        shiftUPH: mode || 0,
        shiftdownTime: downTime,
        mfgOrderCount: orderCount || 0,
        mfgProductCount: product_count || 0,
        shiftTiming: `${formatTimeAMPM(startTime)} - ${formatTimeAMPM(
          endTime,
        )}`,
        // overTime: overTime !== '0' ? formatTimeAMPM(overTime) : overTime,
        overTime,
      },
      shiftADowntimeDetails: shiftADowntimeDetails.reverse(),
    };

    // storing data in redis
    // if (!isSameDay && general?.length) {
    //   let key =
    //     shift && duration === "6hrs"
    //       ? `${line}-${date}-${startTime}-${endTime}-${duration}-${shift}`
    //       : `${line}-${date}-${startTime}-${endTime}-${duration}`;
    //   await storeDataInRedis(result, key);
    //   // console.log("stored data in redis");
    // }

    return result;
  } catch (error) {
    throw error;
  }
};

const extractNumber = (str) => {
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

module.exports = userController;

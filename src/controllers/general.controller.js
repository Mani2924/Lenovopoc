const generalService = require("../services/general.service");

const rescodes = require("../utility/rescodes");

const logger = require("../config/logger");

const RedisDB = require("../config/redis");
// const DateFormat = require('../utility/dateFormat');
const XLSX = require("xlsx");

const emailService = require("../config/emailConfig");
const path = require("path");

const xlsx = require("xlsx");
const { sampleData, oldData } = require("../../models/index");

const moment = require("moment");

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
} = require("../data/shiftData");

const userController = {};

userController.shiftData = async (req, res, next) => {
  try {
    // duration 6hrs or 8hrs
    // shift 1 (1st 6hrs) or shift 2 (2nd 6hrs)
    const { line, duration, shift } = req.query;

    const redisInstance = new RedisDB();

    const currentDate = new Date();

    let currentDateString = currentDate.toISOString().split("T")[0];

    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const currentTime = currentDate.toLocaleTimeString("en-GB", options);
    // const currentTime = '08:00:00';

    let startTime;
    let endTime;
    let condition = "AND";
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

    if (currentTime >= "09:00:00" && currentTime < "21:00:00") {
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
            ? currentDate.toISOString().split("T")[0]
            : currentDateString;
      } else {
        startTime = yesterdayGenaralShift?.startTime;
        endTime = yesterdayGenaralShift?.endTime;
        condition = yesterdayGenaralShift?.condition;
        startDate = currentDate.toISOString().split("T")[0];
      }
    }

    let shiftData = await redisInstance.getValueFromRedis(
      `${line}-${startDate}-${endDate}-${startTime}-${endTime}`
    );
    if (shiftData) {
      shiftData = JSON.parse(shiftData);
      console.log("from redis");
      res.response = {
        code: 200,
        data: { status: "Ok", message: rescodes?.success, data: shiftData },
      };
      return next();
    }

    const general = await generalService.getShiftRecord(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition
    );

    // storing data in redis
    if (general?.length) {
      let appData = JSON.stringify(general);
      redisInstance.setValueInRedis(
        `${line}-${startDate}-${endDate}-${startTime}-${endTime}`,
        appData
      );
    }

    res.response = {
      code: 200,
      data: { status: "Ok", message: rescodes?.success, data: general },
    };

    return next();
  } catch (error) {
    logger.error(error);
    res.response = {
      code: 400,
      data: { status: "Error", message: rescodes?.wentWrong },
    };
    return next();
  }
};

userController.currentShiftData = async (req, res, next) => {
  try {
    const { line } = req.query;

    const currentDate = new Date();

    // const redisInstance = new RedisDB();

    let currentDateString = currentDate.toISOString().split("T")[0];

    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const currentTime = currentDate.toLocaleTimeString("en-GB", options);

    let startTime = "09:00:00";
    let endTime = "21:00:00";

    let startDate = currentDateString;
    let endDate = currentDateString;

    let condition = "AND";

    if (currentTime >= "21:00:00" && currentTime < "09:00:00") {
      startDate = currentDateString;

      currentDate.setDate(currentDate.getDate() + 1);
      currentDateString = currentDate.toISOString().split("T")[0];

      endDate = currentDateString;

      startTime = "21:00:00";
      endTime = "09:00:00";

      condition = "OR";
    }

    const general = await generalService.getShiftRecord(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition
    );
    const convertTimeToRange = (time) => {
      const [hour] = time.split(":");
      let currentHour = parseInt(hour);

      // Handle the case where the input hour is "24"
      if (currentHour === 24) {
        currentHour = 0;
      }
      let nextHour = (currentHour + 1) % 24; // Ensures the hour wraps around at 23
      nextHour = nextHour.toString().padStart(2, "0");

      return `${currentHour.toString().padStart(2, "0")} - ${nextHour}`;
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
      data: { status: "Ok", message: rescodes?.success, data: updatedData },
    };

    return next();
  } catch (error) {
    logger.error(error);
    res.response = {
      code: 400,
      data: { status: "Error", message: rescodes?.wentWrong },
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
        data: { status: "Error", message: rescodes?.noData },
      };
      return next();
    }

    const email = await generalService.getProductOwnerEmail(checkData.mt);

    const templateData = { code: 123, verifyCode: "" };
    const templateFilePath = path.join(__dirname, "../views/comingsoon.ejs");
    const mail = await emailService.sendEmail(
      email?.trim(),
      "Production Down time Alert",
      templateFilePath,
      templateData
    );

    await generalService.update(id, comments);

    res.response = {
      code: 200,
      data: {
        status: "Ok",
        message: rescodes?.success,
        data: "Updated Successfully",
      },
    };

    return next();
  } catch (error) {
    logger.error(error);

    res.response = {
      code: 400,
      data: { status: "Error", message: rescodes?.wentWrong },
    };
    return next();
  }
};

userController.fileUpload = async (req, res, next) => {
  try {
    const fileData = req.file.buffer;
    const workbook = XLSX.read(fileData, { type: "buffer" });

    const sheetNames = ["Line 1", "Line 2", "Line 3"];
    const lineDetails = {
      "Line 1": "L1",
      "Line 2": "L2",
      "Line 3": "L3",
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
      let parsedDate = moment(itm, "MM/DD/YY hh:mm A");
      parsedDate.date(12).month(5); // Setting date to 11th and month to June (index 5 represents June)
      return parsedDate.format("MM/DD/YY hh:mm A");
    };
    sheetNames.forEach((sheetName) => {
      if (workbook.SheetNames.includes(sheetName)) {
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);
        const data = rawData.map((row) => ({
          // Op_Finish_Time: row['Op Finish Time'],
          Op_Finish_Time: a(row["Op Finish Time"]),

          // Op_Finish_Time: moment(
          //   new Date((row['Op Finish Time'] - (25567 + 2)) * 86400 * 1000),
          // )
          //   .utc()
          //   .format('YYYY-MM-DD HH:mm:ssZ'),
          dest_Operation: row["Dest Operation"],
          Associate_Id: row["Associate Id"],
          Mfg_Order_Id: row["Mfg Order Id"],
          product_id: row["Product Id"],
          Serial_Num: row["Serial Num"],
          Operation_Id: row["Operation Id"],
          Work_Position_Id: row["Work Position Id"],
          line: lineDetails[sheetName],
          isActive: true,
          deletedAt: null,
        }));
        allData = allData.concat(data);
      }
    });

    // console.log('allData', allData[0]);

    // if (allData.length > 0) {
    //   await sampleData.bulkCreate(allData, {
    //     ignoreDuplicates: true,
    //   });
    // }

    if (allData.length > 0) {
      await oldData.bulkCreate(allData, {
        ignoreDuplicates: true,
      });
    }

    res.send("Data inserted successfully");
  } catch (error) {
    logger.error(error);
    res.status(400).json({
      status: "Error",
      message: "Something went wrong",
    });
    return next();
  }
};

userController.previousShiftDate2 = async (req, res, next) => {
  try {
    // duration 6hrs or 8hrs
    // shift 1 (1st 6hrs) or shift 2 (2nd 6hrs)
    const { line, duration, shift } = req.query;

    const redisInstance = new RedisDB();

    const currentDate = new Date();

    let currentDateString = currentDate.toISOString().split("T")[0];

    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const currentTime = currentDate.toLocaleTimeString("en-GB", options);
    // const currentTime = '08:00:00';

    let startTime;
    let endTime;
    let condition = "AND";
    let startDate = currentDateString;
    let endDate = currentDateString;
    let condition2 = "AND start_time < end_time";

    const formatTime = (time) => {
      const [hours, minutes, seconds] = time.split(":");
      return `${hours.padStart(2, "0")}:${minutes.padStart(
        2,
        "0"
      )}:${seconds.padStart(2, "0")}`;
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

    if (currentTime >= "09:00:00" && currentTime < "21:00:00") {
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
            ? currentDate.toISOString().split("T")[0]
            : currentDateString;
      } else {
        if (duration === "9hrs") {
          startTime = formatTime(yesterdayGenaralShift?.startTime);
          endTime = formatTime(yesterdayGenaralShift?.endTime);
          condition = yesterdayGenaralShift?.condition;
          startDate = currentDate.toISOString().split("T")[0];
        } else {
          startTime = formatTime(yesterdayTwileShift?.startTime);
          endTime = formatTime(yesterdayTwileShift?.endTime);
          condition = yesterdayTwileShift?.condition;
          startDate = currentDate.toISOString().split("T")[0];
        }
      }
    }

    let shiftData = await redisInstance.getValueFromRedis(
      !shift
        ? `${line}-${startDate}-${endDate}-${startTime}-${endTime}${duration}`
        : `${line}-${startDate}-${endDate}-${startTime}-${endTime}${duration}${shift}`
    );
    if (shiftData) {
      shiftData = JSON.parse(shiftData);
      console.log("from redis");
      res.response = {
        code: 200,
        data: { status: "Ok", message: rescodes?.success, data: shiftData },
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
      condition2
    );

    general = general.map((itm) => {
      let { x } = itm;
      const aa = x.split(":");
      const ab = aa[2].split(" - ")[1];
      // x = `${aa[0] < 12 ? aa[0] : aa[0] - 12} - ${ab < 12 ? ab : ab - 12} `;
      const startHour = aa[0].padStart(2, "0");
      const startFormatted =
        startHour <= 12
          ? startHour === "00"
            ? "12"
            : startHour
          : (startHour - 12).toString().padStart(2, "0");

      const endHour = ab.padStart(2, "0");
      const endFormatted =
        endHour <= 12
          ? endHour === "00"
            ? "12"
            : endHour
          : (endHour - 12).toString().padStart(2, "0");

      x = `${startFormatted} - ${endFormatted}`;

      // x = `${aa[0]} - ${ab} `;

      return {
        ...itm,
        x,
      };
    });

    // storing data in redis
    if (general?.length) {
      let appData = JSON.stringify({
        data: general,
        totalCount: general?.length,
      });
      redisInstance.setValueInRedis(
        !shift
          ? `${line}-${startDate}-${endDate}-${startTime}-${endTime}${duration}`
          : `${line}-${startDate}-${endDate}-${startTime}-${endTime}${duration}${shift}`,
        appData
      );
    }

    res.response = {
      code: 200,
      data: {
        status: "Ok",
        message: rescodes?.success,
        data: { data: general, totalCount: general?.length || 0 },
      },
    };

    return next();
  } catch (error) {
    logger.error(error);
    res.response = {
      code: 400,
      data: { status: "Error", message: rescodes?.wentWrong },
    };
    return next();
  }
};

// Function to format time to "h:mm A"
function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

userController.currentShiftData2 = async (req, res, next) => {
  try {
    const { line, duration, shift } = req.query;

    const currentDate = new Date();

    let currentDateString = currentDate.toISOString().split("T")[0];

    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const currentTime = currentDate.toLocaleTimeString("en-GB", options);

    let startTime = "09:00:00";
    let endTime = "21:00:00";

    let startDate = currentDateString;
    let endDate = currentDateString;

    let condition = "AND";
    let condition2 = "AND start_time < end_time";

    let shiftStartTime = new Date();
    let shiftEndTime = new Date();

    shiftStartTime.setHours(9, 0, 0, 0);
    shiftEndTime.setHours(21, 0, 0, 0);

    // let shiftStartTime = moment().startOf("day");
    // let shiftEndTime = moment().startOf("day");

    // shiftStartTime.set("hour", "09");
    // shiftEndTime.set("hour", "21");

    if (currentTime >= "21:00:00" && currentTime < "09:00:00") {
      startDate = currentDateString;

      currentDate.setDate(currentDate.getDate() + 1);
      currentDateString = currentDate.toISOString().split("T")[0];

      endDate = currentDateString;

      startTime = "21:00:00";
      endTime = "09:00:00";

      condition = "OR";
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
      condition2
    );

    const convertTimeToRange = (time) => {
      const [hour] = time.split(":");
      let currentHour = parseInt(hour);

      // Handle the case where the input hour is "24"
      if (currentHour === 24) {
        currentHour = 0;
      }
      let nextHour = (currentHour + 1) % 24; // Ensures the hour wraps around at 23

      // Format the hours for 12-hour clock with leading zeros
      const currentHour12 = currentHour % 12 === 0 ? 12 : currentHour % 12;
      const nextHour12 = nextHour % 12 === 0 ? 12 : nextHour % 12;

      const currentHourString = currentHour12.toString().padStart(2, "0");
      const nextHourString = nextHour12.toString().padStart(2, "0");

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
          .join(",");
        // const combinedTarget = repeatedItems.reduce(
        //   (sum, el) => sum + el.target,
        //   0,
        // );
        const combinedTarget = Math.min(
          ...repeatedItems.map((val) => val.target)
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

    if (duration === "6hrs" && shift === "1st") {
      updatedData = updatedData.slice(0, 6);
      // shiftEndTime.subtract("6", "hours");
      shiftEndTime.setHours(shiftEndTime.getHours() - 6);
    } else if (duration === "6hrs" && shift === "2nd") {
      updatedData = updatedData.slice(6, 12);
      // shiftStartTime.subtract("6", "hours");
      shiftStartTime.setHours(shiftStartTime.getHours() - 6);
    } else {
      updatedData = updatedData.slice(0, 9);
      // shiftEndTime.subtract("3", "hours");
      shiftEndTime.setHours(shiftEndTime.getHours() - 3);
    }

    res.response = {
      code: 200,
      data: {
        status: "Ok",
        message: rescodes?.success,
        data: {
          updatedData,
          totalCount: updatedData?.length,
          shiftTiming: `${formatAMPM(shiftStartTime)} - ${formatAMPM(
            shiftEndTime
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
      data: { status: "Error", message: rescodes?.wentWrong },
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
        data: { status: "Error", message: rescodes?.wentWrong },
      };
      return next();
    }

    const storeTargetValue = await generalService.createTargetValue(
      eachDayTargetByModel
    );

    res.response = {
      code: 200,
      data: {
        status: "Ok",
        message: rescodes?.success,
        data: storeTargetValue,
      },
    };

    return next();
  } catch (error) {
    logger.error(error);
    res.response = {
      code: 400,
      data: { status: "Error", message: rescodes?.wentWrong },
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
    console.log("setStartOfDay", currentDate);

    // currentDate.addHours(5);
    currentDate.setHours(2);

    console.log("currentDate", currentDate);
    // console.log('currentDate', currentDate.getHours());

    res.response = {
      code: 200,
      data: {
        status: "Ok",
        message: rescodes?.success,
        data: "success",
      },
    };

    return next();
  } catch (error) {
    logger.error(error);
    res.response = {
      code: 400,
      data: { status: "Error", message: rescodes?.wentWrong },
    };
    return next();
  }
};

userController.displayPreviousTwoShiftsData = async (req, res, next) => {
  try {
    const { line, duration, date, shift } = req.query;

    const currentDate = new Date();
    // const currentDate = new Date(date);

    currentDate.setDate(currentDate.getDate() - 1);

    let currentDateString = currentDate.toISOString().split("T")[0];

    let startTime;
    let endTime;
    let condition = "AND";
    let startDate = currentDateString;
    let endDate = currentDateString;
    let condition2 = "AND start_time < end_time";

    let shiftAStartTime = new Date();
    let shiftAEndTime = new Date();

    let shiftBStartTime = new Date();
    let shiftBEndTime = new Date();

    shiftAStartTime.setHours(9, 0, 0, 0);
    shiftAEndTime.setHours(21, 0, 0, 0);

    shiftBStartTime.setHours(21, 0, 0, 0);
    shiftBEndTime.setHours(9, 0, 0, 0);

    if (duration === "6hrs") {
      startTime = firstShift?.startTime;
      endTime = firstShift?.endTime;
    } else if (duration === "9hrs") {
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
      condition2
    );

    currentDate.setDate(currentDate.getDate() + 1);
    endDate = currentDate.toISOString().split("T")[0];
    condition2 = "AND end_time > start_time";

    if (duration === "6hrs") {
      startTime = secondShift?.startTime;
      endTime = secondShift?.endTime;
      condition = secondShift?.condition;
    } else if (duration === "9hrs") {
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
      condition2
    );
    const convert = (general, shifts) => {
      let shiftStart, shiftEnd;
      shifts === "shiftA"
        ? (shiftStart = shiftAStartTime)
        : (shiftStart = shiftBStartTime);
      shifts === "shiftA"
        ? (shiftEnd = shiftAEndTime)
        : (shiftEnd = shiftBEndTime);

      let updatedData;
      const data = general.map((itm) => {
        let { x } = itm;
        const aa = x.split(":");
        const ab = aa[2].split(" - ")[1];

        const startHour = aa[0].padStart(2, "0");
        const startFormatted =
          startHour <= 12
            ? startHour === "00"
              ? "12"
              : startHour
            : (startHour - 12).toString().padStart(2, "0");

        const endHour = ab.padStart(2, "0");
        const endFormatted =
          endHour <= 12
            ? endHour === "00"
              ? "12"
              : endHour
            : (endHour - 12).toString().padStart(2, "0");

        x = `${startFormatted} - ${endFormatted}`;

        // x = `${aa[0]} - ${ab} `;

        return {
          ...itm,
          x,
        };
      });

      if (duration === "6hrs" && shift === "1st") {
        updatedData = data.slice(0, 6);
        shiftEnd.setHours(shiftEnd.getHours() - 6);
      } else if (duration === "6hrs" && shift === "2nd") {
        updatedData = data.slice(6, 12);
        shiftStart.setHours(shiftStart.getHours() - 6);
      } else if (duration === "9hrs") {
        updatedData = data.slice(0, 9);
        shiftEnd.setHours(shiftEnd.getHours() - 3);
      } else {
        updatedData = data.slice(0, 12);
      }

      shifts === "shiftA"
        ? (shiftAStartTime = shiftStart)
        : (shiftBStartTime = shiftStart);
      shifts === "shiftA"
        ? (shiftAEndTime = shiftEnd)
        : (shiftBEndTime = shiftEnd);

      return updatedData;
    };

    const shiftA = convert(general, "shiftA");
    const shiftB = convert(general2, "shiftB");

    res.response = {
      code: 200,
      data: {
        status: "Ok",
        message: rescodes?.success,
        data: {
          shiftA,
          shiftB,
          totalCount: shiftA?.length + shiftB?.length || 0,
          shiftATiming: `${formatAMPM(shiftAStartTime)} - ${formatAMPM(
            shiftAEndTime
          )}`,
          shiftBTiming: `${formatAMPM(shiftBStartTime)} - ${formatAMPM(
            shiftBEndTime
          )}`,
        },
      },
    };

    return next();
  } catch (error) {
    logger.error(error);
    res.response = {
      code: 400,
      data: { status: "Error", message: rescodes?.wentWrong },
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
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "pm" : "am";
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
    const ampm = date.getHours() >= 12 ? "pm" : "am";
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

    if (isShift === "false" || !isShift) {
      if (record === "true") {
        downtimeDetails = [
          {
            interval: "03:00 - 04:00 pm",
            downTime: "10 mins",
            message: "Conveyor is stopped",
          },
          {
            interval: "04:00 - 05:00 pm",
            downTime: "20 mins",
            message: "Part Failure",
          },
          {
            interval: "05:00 - 06:00 pm",
            downTime: "15 mins",
            message: "No Load",
          },
          {
            interval: "06:00 - 07:00 pm",
            downTime: "10 mins",
            message: "Operator trainer",
          },
          {
            interval: "07:00 - 08:00 pm",
            downTime: "07 mins",
            message: "Production failure",
          },
        ];
      } else {
        // Return the standard downtime details
        downtimeDetails = [
          {
            interval: "03:00 - 04:00 pm",
            downTime: "10 mins",
            message: "Conveyor is stopped",
          },
          {
            interval: "04:00 - 05:00 pm",
            downTime: "17 mins",
            message: "Part Failure",
          },
        ];
      }
    } else if (isShift === "true") {
      if (currentHour === 9) {
        downtimeDetails = [];
      } else if (currentHour === 10) {
        const [interval1] = getLastTwoFullHoursIntervals();
        downtimeDetails = [
          {
            interval: interval1,
            downTime: "17 mins",
            message: "No Load",
          },
        ];
      } else {
        const [interval1, interval2] = getLastTwoFullHoursIntervals();
        downtimeDetails = [
          {
            interval: interval1,
            downTime: "10 mins",
            message: "No Load",
          },
          {
            interval: interval2,
            downTime: "12 mins",
            message: "Operator trainer",
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
      data: { status: "Error", message: "Something went wrong" },
    });
    return next(error);
  }
};

userController.getEmoji = async (req, res, next) => {
  try {
    const date = new Date();
    const { isShift, dataCount } = req.query;

    const currentTime = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const databaseDate = new Date(date);
    databaseDate.setHours(databaseDate.getHours() - 1);
    databaseDate.setMinutes(0, 0, 0);
    const databaseTime = databaseDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const formattedDatabaseDate = databaseDate.toISOString().split("T")[0];
    const minutes = parseInt(currentTime.split(":")[1]);

    let isHappy = false;
    if (isShift === "false" || !isShift) {
      const data = await generalService.getPriviousHourCount(
        formattedDatabaseDate,
        databaseTime
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
      data: { status: "Error", message: "Something went wrong" },
    });
    return next(error);
  }
};

const previousShiftDate2 = async (req) => {
  try {
    const line = "L1";

    const currentDate = new Date();
    let currentDateString = currentDate.toISOString().split("T")[0];

    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const currentTime = currentDate.toLocaleTimeString("en-GB", options);

    let startTime;
    let endTime;
    let condition = "AND";
    let startDate = currentDateString;
    let endDate = currentDateString;
    let condition2 = "start_time < end_time";

    const formatTime = (time) => {
      const [hours, minutes, seconds] = time.split(":");
      return `${hours.padStart(2, "0")}:${minutes.padStart(
        2,
        "0"
      )}:${seconds.padStart(2, "0")}`;
    };

    startTime = formatTime(todayGenaralShift?.startTime);
    endTime = formatTime(todayGenaralShift?.endTime);

    if (currentTime >= "09:00:00" && currentTime < "21:00:00") {
      currentDate.setDate(currentDate.getDate() - 1);

      startTime = formatTime(yesterdayTwileShift?.startTime);
      endTime = formatTime(yesterdayTwileShift?.endTime);
      condition = yesterdayTwileShift?.condition;
      startDate = currentDate.toISOString().split("T")[0];
    }

    const totalCount = await generalService.getCount(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
      condition2
    );

    return totalCount;
  } catch (error) {
    console.error("Error in previousShiftDate2:", error);
    return 0;
  }
};

const getCurrentShiftCount = async (req) => {
  try {
    const line = "L1";

    const currentDate = new Date();
    let currentDateString = currentDate.toISOString().split("T")[0];

    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const currentTime = currentDate.toLocaleTimeString("en-GB", options);

    let startTime = "09:00:00";
    let endTime = "21:00:00";

    let startDate = currentDateString;
    let endDate = currentDateString;

    let condition = "AND";
    let condition2 = "AND start_time < end_time";

    if (currentTime >= "21:00:00" && currentTime < "09:00:00") {
      startDate = currentDateString;

      currentDate.setDate(currentDate.getDate() + 1);
      currentDateString = currentDate.toISOString().split("T")[0];

      endDate = currentDateString;

      startTime = "21:00:00";
      endTime = "09:00:00";

      condition = "OR";
    }

    const totalCount = await generalService.getCount(
      line,
      startDate,
      endDate,
      startTime,
      endTime,
      condition,
      condition2
    );

    return totalCount;
  } catch (error) {
    return 0;
  }
};

userController.getSystemUPH = async (req, res, next) => {
  try {
    const { isSystem } = req.query;

    const data = await generalService.getTarget();

    let target = 0;

    if (isSystem === true || isSystem) {
      target = data.systemTarget;
    } else {
      target = data.assignedTarget;
    }

    res.status(200).json({
      code: 200,
      data: {
        target: target,
      },
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      data: { status: "Error", message: "Something went wrong" },
    });
    return next(error);
  }
};

module.exports = userController;

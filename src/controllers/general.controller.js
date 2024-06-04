const generalService = require('../services/general.service');

const rescodes = require('../utility/rescodes');

const logger = require('../config/logger');

const userController = {};

userController.shiftData = async (req, res, next) => {
  try {
    // const { date, line, shift } = req.query;
    const { line } = req.query;

    // console.log('date', date);
    // console.log('line', line);
    // console.log('shift', shift);

    const currentDate = new Date();

    // Format the current date as YYYY-MM-DD
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

    if (currentTime >= '09:00:00' && currentTime < '21:00:00') {
      // Get the previous date

      startDate = currentDateString;

      currentDate.setDate(currentDate.getDate() - 1);
      currentDateString = currentDate.toISOString().split('T')[0];

      endDate = currentDate.toISOString().split('T')[0];

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
    // Function to convert time to range
    const convertTimeToRange = (time) => {
      const [hour] = time.split(':');
      const previousHour = (parseInt(hour) - 1).toString().padStart(2, '0');
      return `${previousHour} - ${hour}`;
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

userController.currentShiftData = async (req, res, next) => {
  try {
    const { line } = req.query;

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
      const previousHour = (parseInt(hour) - 1).toString().padStart(2, '0');
      return `${previousHour} - ${hour}`;
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
    console.log(error);

    res.response = {
      code: 400,
      data: { status: 'Error', message: rescodes?.wentWrong },
    };
    return next();
  }
};

module.exports = userController;

const { Op } = require('sequelize');

const userService = require('../services/user.service');

const rescodes = require('../utility/rescodes');

const logger = require('../config/logger');

const userController = {};

const getOrderCriteria = (field, direction) => {
  if (direction !== undefined && direction !== null) {
    return [[field, direction === 'ASC' ? direction : 'DESC']];
  }
  return [];
};

userController.getAllUsers = async (req, res, next) => {
  try {
    const {
      page,
      pageSize,
      relatedId,
      search,
      firstName: sortFirstName,
      lastName: sortLastName,
      id: sortId,
      email: sortEmail,
      occupation,
      mobile: sortMobile,
      relatedType,
    } = req.query;
    const defaultPage = pageSize !== undefined ? pageSize : 10;
    const offset = page && page > 0 ? (page - 1) * defaultPage : 0;

    const whereClause = {};
    let searchCriteria = {};

    if (relatedId) {
      whereClause.related_id = relatedId;
    }

    if (search && search?.length > 0) {
      searchCriteria = {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { mobile: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    const order = [
      ...getOrderCriteria('firstName', sortFirstName),
      ...getOrderCriteria('lastName', sortLastName),
      ...getOrderCriteria('id', sortId),
      ...getOrderCriteria('related_id', occupation),
      ...getOrderCriteria('email', sortEmail),
      ...getOrderCriteria('mobile', sortMobile),
      ...getOrderCriteria('related_type', relatedType),
    ];

    const attributes = {
      userAttributes: ['id', 'firstName', 'lastName', 'mobile', 'email', 'related_type', 'related_id', 'userStatus'],
      userCourseAttributes: ['course_progress'],
      courseAttributes: ['id'],
    };

    const { count, rows } = await userService.findAllUsers({
      whereClause,
      searchCriteria,
      defaultPage,
      offset,
      order,
      attributes,
    });

    if (!rows?.length) {
      res.response = {
        code: 404,
        data: { status: 'Error', message: rescodes?.userNF },
      };
      return next();
    }

    const users = rows.map((value) => {
      const { id, firstName, lastName, mobile, email, related_type, related_id, course, userStatus } = value;
      return {
        id,
        firstName,
        lastName,
        mobile,
        email,
        related_type,
        related_id,
        userStatus,
        coursecount: course.filter((item) => item?.course_user?.course_progress === 100)?.length,
      };
    });

    const totalPage = Math.ceil(count / defaultPage);
    const totalUser = count;
    res.response = {
      code: 200,
      data: { status: 'Ok', message: rescodes?.success, data: { users, totalPage, totalUser } },
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

userController.getUserById = async (req, res, next) => {
  try {
    const userId = req?.params?.id;
    const attributes = {
      userAttributes: ['id', 'firstName', 'lastName', 'mobile', 'email', 'related_type', 'dob'],
      certificateAttributes: ['id', 'course_id', 'courseName', 'imageUrl', 'earnedDate'],
      courseAttributes: ['id', 'name'],
      courseUserAttributes: ['course_progress', 'enrollmentDate'],
    };
    const { user, course } = await userService.getUserById(userId, attributes);
    if (!user) {
      res.response = {
        code: 404,
        data: { status: 'Ok', message: rescodes?.userNF, data: {} },
      };

      return next();
    }
    const { id, firstName, lastName, mobile, email, related_type, dob, certificates } = user;

    const userObj = {
      id,
      firstName,
      lastName,
      mobile,
      email,
      occupation: related_type,
      dob,
      courseCount: course?.length,
      certificateCount: certificates?.length,
      userCourse: course.map(({ id: courseId, name, course_user }) => ({
        id: courseId,
        name,
        progress: course_user?.course_progress,
        startDate: course_user?.enrollmentDate,
      })),
      certificates,
    };
    res.response = {
      code: 200,
      data: { status: 'Ok', message: rescodes?.success, data: userObj },
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

userController.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userExists = await userService.getExistingUser(userId);
    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: rescodes?.userNF,
      });
    }
    await userService.updateUserState(userId);
    return res.status(200).json({
      status: 'Ok',
      message: rescodes?.success,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = userController;

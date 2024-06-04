const { Op, Sequelize } = require('sequelize');

const { users, userCourseTracker, course, certificate } = require('../../models/index');

const userService = {};

userService.getAllUser = async (filterOptions, limit, offset) => {
  const whereClause = {
    ...(filterOptions?.firstName ? { firstName: { [Op.iLike]: `%${filterOptions?.firstName}%` } } : {}),
    ...(filterOptions?.lastName ? { lastName: { [Op.iLike]: `%${filterOptions?.lastName}%` } } : {}),
    ...(filterOptions?.email ? { email: { [Op.eq]: filterOptions.email } } : {}),
    ...(filterOptions?.related_type ? { related_type: { [Op.eq]: filterOptions.related_type } } : {}),
    ...(filterOptions?.userStatus ? { userStatus: { [Op.eq]: filterOptions.userStatus } } : {}),
    ...(filterOptions?.mobile ? { mobile: { [Op.eq]: filterOptions.mobile } } : {}),
  };

  const totalCount = await users.count({
    where: whereClause,
  });

  const getAllUser = await users.findAll({
    where: whereClause,
    limit,
    offset,
    order: [['createdAt', 'ASC']],
  });
  const totalPages = Math.ceil(totalCount / limit);

  return [getAllUser, totalPages, totalCount];
};

userService.totalCourseComplete = async (id) => {
  const totalCompletedCourses = await userCourseTracker.count({
    where: {
      course_user_id: id,
      isCompleted: true,
    },
  });
  return totalCompletedCourses;
};

userService.getUserById = async (userId, attributes) => {
  const existingUser = await users.findOne({
    where: { id: userId },
    attributes: attributes.userAttributes,
    include: [
      {
        model: course,
        as: 'course',
        attributes: attributes.courseAttributes,
        required: false,
        through: { attributes: attributes.courseUserAttributes },
      },
      {
        model: certificate,
        attributes: attributes.certificateAttributes,
        required: false,
      },
    ],
  });

  return { user: existingUser, course: existingUser?.course };
};
userService.getExistingUser = async (userId) => {
  const existingUser = await users.findOne({ where: { id: userId, isTrash: false, userStatus: 'Active' } });
  return existingUser;
};

userService.deleteUser = async (userId) => {
  const deleteUser = await users.destroy(
    // { isTrash: true },
    {
      where: { id: userId },
    }
  );
  return deleteUser;
};

userService.updateUserState = async (id) => {
  const deleteUser = await users.update(
    { userStatus: 'Inactive', isTrash: true },
    {
      where: { id },
    }
  );
  return deleteUser;
};

userService.findAllUsers = async ({ whereClause, searchCriteria, defaultPage: limit, offset, order, attributes }) => {
  const result = await users.findAndCountAll({
    where: [whereClause, searchCriteria],
    attributes: attributes.userAttributes,
    include: {
      model: course,
      as: 'course',
      attributes: attributes.courseAttributes,
      through: {
        attributes: attributes.userCourseAttributes,
      },
    },
    limit,
    offset,
    order,
  });
  return result;
};

module.exports = userService;

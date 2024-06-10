const db = require('../../models/index');

const { users } = require('../../models/index');

const authservice = {};

module.exports = {
  userExist: async (email) => {
    const userExit = await db?.adminUser?.findOne({
      where: {
        email,
        isActive: true,
      },
    });
    return userExit;
  },
  getFeature: async (roleFeature) => {
    const getFeature = await db?.roleFeatures?.findAll({
      order: [['id', 'ASC']],
      include: [{ model: db?.features, as: 'features' }],
      where: {
        role_id: roleFeature?.role_id,
      },
    });
    return getFeature;
  },
  getUserModuleFeature: async (userExist) => {
    const getUserModuleFeature = await db?.userModuleRoles?.findAll({
      order: [['id', 'ASC']],
      include: [
        { model: db?.roles, as: 'role' },
        { model: db?.modules, as: 'module' },
      ],
      where: {
        adminUser_id: userExist?.id,
      },
    });
    return getUserModuleFeature;
  },
  getModuleFeature: async () => {
    const getModuleFeature = await db?.modules?.findAll({
      include: [{ model: db?.features, through: db?.moduleFeatures, as: 'features' }],
      order: [['orderId', 'ASC']],
      where: {
        isActive: true,
      },
    });
    return getModuleFeature;
  },

  checkUser: async ({ email }) => {
    return users.findOne({
      where: {
        email,
        isTrash: false,
      },
    });
  },
  findUserByEmail: async (email) => {
    return users.findOne({
      where: {
        email,
      },
    });
  },
  updateUserPassword: async (user_id, newPassword) => {
    return users.update(
      {
        password: newPassword,
      },
      {
        where: {
          id: user_id,
        },
      }
    );
  },
  findUserByEmailAndId: async (email, user_id) => {
    return users.findOne({
      where: {
        email,
        id: user_id,
      },
    });
  },
};

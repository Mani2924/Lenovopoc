/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const db = require('../../models/index');

const accessPermission = {};

accessPermission.featureAccess = async ({ userId, featureKey }) => {
  let grantAccess = false;
  const getmodules = await db?.userModuleRoles?.findAll({
    include: [
      {
        model: db?.roles,
        as: 'role',
      },
    ],
    where: {
      adminUser_id: userId,
    },
  });
  if (!getmodules?.length) return grantAccess;
  const roleIds = [];
  getmodules?.forEach((roles) => {
    const { role } = roles;
    roleIds.push(role?.id);
  });
  for (const roleId of roleIds) {
    const getFeature = await db?.roleFeatures?.findAll({
      include: [
        {
          model: db?.features,
          as: 'features',
        },
      ],
      where: {
        role_id: roleId,
      },
    });
    if (getFeature?.length) {
      getFeature?.forEach((feature) => {
        const { key } = feature.features;
        if (key === featureKey) {
          grantAccess = true;
        }
      });
    }
  }
  return grantAccess;
};

module.exports = accessPermission;

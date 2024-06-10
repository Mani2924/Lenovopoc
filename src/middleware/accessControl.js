const accessPermission = require('../utility/permissionaccess');
const logger = require('../config/logger');

const rescodes = require('../utility/rescodes');

const authorize = (featureKey) => async (req, res, next) => {
  try {
    const isAdmin = req?.user?.isAdmin;
    const isSuperadmin = req?.user?.isSuperadmin;
    if (!isSuperadmin && !isAdmin) {
      let checkAccess = false;
      if (Array.isArray(featureKey) && featureKey?.length > 1) {
        const promises = featureKey.map(async (element) => {
          const access = await accessPermission?.featureAccess({
            userId: req?.user?.id,
            featureKey: element,
          });
          return access;
        });

        // Wait for all promises to resolve
        const accesses = await Promise.all(promises);

        // Check if any access is true
        checkAccess = accesses.some((access) => access);
      } else {
        checkAccess = await accessPermission?.featureAccess({
          userId: req?.user?.id,
          featureKey,
        });
      }

      if (!checkAccess) {
        return res.status(401).json({
          code: 401,
          data: {
            status: 'Error',
            message: rescodes?.unAuthorized,
            data: {},
          },
        });
      }
    }
    return next();
  } catch (error) {
    logger.error(error);
    return res?.sendStatus(500);
  }
};

module.exports = authorize;

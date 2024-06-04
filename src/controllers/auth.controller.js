/* eslint-disable no-restricted-syntax */
/* eslint-disable security/detect-possible-timing-attacks */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const logger = require('../config/logger');
const config = require('../config/vars');

const adminUserService = require('../services/adminUser.service');
const adminRefreshTokenService = require('../services/adminRefreshToken.service');
const passwordChangeRequestsService = require('../services/passwordChangeRequests.service');

const rescodes = require('../utility/rescodes');
const values = require('../utility/getValues');
const emailSystem = require('../utility/emailConfig');
const authservice = require('../services/auth.service');

const authModule = {};

authModule.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const attributes = {
      userCheckAttributes: ['id', 'email', 'password'],
    };
    const emailExist = await adminUserService.checkUser(email, attributes);
    if (!emailExist) {
      res.response = {
        code: 401,
        data: { status: 'Error', message: rescodes?.emailNExist },
      };
      return next();
    }
    if (emailExist.isActive === false) {
      res.response = {
        code: 404,
        data: { status: 'Error', message: rescodes?.inActiveUsr },
      };
      return next();
    }
    const depass = jwt.verify(emailExist.password, config.app.accesstoken);
    if (depass.password !== password) {
      res.response = {
        code: 401,
        data: { status: 'Error', message: rescodes?.checkCred },
      };
      return next();
    }

    const user = { id: emailExist.id };
    const accessToken = await values.generateAccessToken(user);
    const refreshToken = jwt?.sign(user, config?.app?.refreshtoken);
    await adminRefreshTokenService.adminRefreshToken({
      userId: user.id,
      token: refreshToken,
    });

    const userExist = await authservice.userExist(email);
    const allList = [];
    const getModuleFeature = await authservice.getModuleFeature();
    let adminEnable;
    if (userExist?.isAdmin || userExist?.isSuperadmin) adminEnable = true;
    if (getModuleFeature?.length) {
      getModuleFeature.forEach((val) => {
        const modules = {
          moduleLabel: val?.name,
          moduleKey: val?.key,
          enable: adminEnable ? true : false,
        };
        const features = {};

        if (val?.features) {
          const { features: moduleFeatures } = val;
          moduleFeatures.forEach((item) => {
            features[item?.key] = adminEnable ? true : false;
          });
        }

        allList.push({ module: modules, features: features });
      });
    }

    const getUserModuleFeature = await authservice.getUserModuleFeature(userExist);
    const userList = [];
    if (getUserModuleFeature?.length) {
      for (const roleFeature of getUserModuleFeature) {
        const userFeatureList = [];
        const userModuleList = { moduleLabel: roleFeature?.module?.name, moduleKey: roleFeature?.module?.key };
        const getFeature = await authservice.getFeature(roleFeature);
        if (getFeature?.length) {
          getFeature?.forEach((fea) => {
            userFeatureList?.push({ featureLabel: fea?.features?.name, featureKey: fea?.features?.key });
          });
        }
        userList?.push({ module: userModuleList, features: userFeatureList });
      }
    }

    if (!userExist?.isAdmin && !userExist?.isSuperadmin) {
      allList.forEach((moduleA) => {
        const moduleItemB = userList?.find((moduleB) => moduleB?.module?.moduleKey === moduleA?.module?.moduleKey);
        if (moduleItemB) {
          moduleA.module.enable = true;
          if (moduleA) {
            const { features } = moduleA;
            moduleItemB.features.forEach((item) => {
              features[item?.featureKey] = true;
            });
          }
        }
      });
    }
    const userObj = {
      accessToken,
      refreshToken,
      expiresIn: 3600000,
      moudleFeatureAccess: allList,
    };

    res.response = {
      code: 200,
      data: {
        status: 'Ok',
        data: userObj,
        message: rescodes?.loginSuc,
      },
    };
    return next();
  } catch (err) {
    logger.error(err);
    res.response = {
      code: 500,
      data: { status: 'Error', message: rescodes?.wentWrong },
    };
    return next();
  }
};

authModule.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req?.body || {};

    const attributes = {
      userCheckAttributes: ['id', 'email', 'password'],
    };
    const userExist = await adminUserService.checkUser(email, attributes);
    if (userExist.iaActive === false) {
      res.response = {
        code: 404,
        data: { status: 'Error', message: rescodes?.inActiveUsr },
      };
      return next();
    }
    const uuid = uuidv4();
    const passTrigger = await passwordChangeRequestsService.createPasswordChangeRequest(userExist?.id, uuid);
    const reset = `${config.app.frontendURL}login/reset-password?id=${passTrigger?.code}`;
    if (passTrigger && Object.keys(passTrigger)?.length) {
      const subject = 'Reset Link';
      const templateData = { username: userExist.userName, resetLink: reset };
      const templateFilePath = path.join(__dirname, '../views/resetMail.ejs');
      const result = await emailSystem.sendEmail(email, subject, templateFilePath, templateData);
      if (result === 'success') {
        res.response = {
          code: 200,
          data: { status: 'Ok', message: rescodes?.mailSentF },
        };
        return next();
      }
    }
    return '';
  } catch (err) {
    logger.error(err);
    res.response = {
      code: 500,
      data: { status: 'Error', message: rescodes?.IntSerError },
    };
    return next();
  }
};

authModule.resetPassword = async (req, res, next) => {
  try {
    const { resetCode } = req.query;
    const { newPassword } = req.body;

    const checklink = await passwordChangeRequestsService.checkPasswordChangeRequest(resetCode);

    if (checklink && Object.keys(checklink)?.length) {
      const encryptedPassword = jwt.sign({ password: newPassword }, config.app.accesstoken);
      const updatePass = await adminUserService.updateUserPassword(checklink?.dataValues?.user_id, encryptedPassword);
      const deleteReq = await passwordChangeRequestsService.deletePasswordChangeRequest(resetCode);
      if (deleteReq && updatePass) {
        res.response = {
          code: 200,
          data: { status: 'ok', message: rescodes?.passRS },
        };
        return next();
      }
    } else {
      await passwordChangeRequestsService.deletePasswordChangeRequest(resetCode);
      res.response = {
        code: 404,
        data: { status: 'Error', message: rescodes?.resetCode },
      };
      return next();
    }
  } catch (err) {
    logger.info(err);
    res.response = {
      code: 500,
      data: { status: 'Error', message: rescodes?.error },
    };
    return next();
  }
  return Promise.resolve();
};

authModule.adminRefreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const checkTokenExist = await adminRefreshTokenService.adminTokenExist(token);
    if (!checkTokenExist) {
      res.response = {
        code: 400,
        data: { status: 'Error', message: rescodes?.tokenAldel },
      };
      return next();
    }
    const refreshTokenUser = jwt.verify(token, config.app.refreshtoken);
    const existQuery = await adminUserService.findAdminUserByEmailAndId(refreshTokenUser?.id);
    if (!existQuery || !Object.keys(existQuery)?.length) {
      res.response = {
        code: 401,
        data: { status: 'Error', message: rescodes?.unAuthorized },
      };
      return next();
    }
    const getId = await adminRefreshTokenService.findRefreshTokensByAdminUserId(existQuery?.dataValues?.id);
    const result = getId.map((val) => val?.dataValues?.token);
    if (!result?.includes(token)) {
      res.response = {
        code: 403,
        data: { status: 'Error', message: rescodes?.forbidden },
      };
      return next();
    }
    const users = { name: refreshTokenUser?.name, id: refreshTokenUser?.id };
    const accessToken = await values.generateAccessToken(users);
    res.response = {
      code: 200,
      data: { status: 'Ok', data: { accessToken, expiresIn: 3600000 } },
    };
    return next();
  } catch (err) {
    logger.error(err);
    res.response = {
      code: 500,
      data: { status: 'Error', message: rescodes?.wentWrong },
    };
    return next();
  }
};

authModule.logout = async (req, res, next) => {
  try {
    const { token } = req.body;
    const checkTokenExist = await adminRefreshTokenService.adminTokenExist(token);
    if (!checkTokenExist) {
      res.response = {
        code: 400,
        data: { status: 'Error', message: rescodes?.tokenAldel },
      };
      return next();
    }

    const deletedRows = await adminRefreshTokenService.deleteAdminRefreshToken(token);
    if (deletedRows) {
      res.response = {
        code: 200,
        data: { status: 'Ok', message: rescodes?.logout },
      };
      return next();
    }
    return '';
  } catch (err) {
    logger.info(err);
    res.response = {
      code: 500,
      data: { status: 'Error', message: rescodes?.IntSerError },
    };
    return next();
  }
};

module.exports = authModule;

/* eslint-disable no-unsafe-optional-chaining */
const getValues = {};
const jwt = require('jsonwebtoken');
const config = require('../config/vars');
// const inviteService = require('../services/invite.service');

getValues.generateAccessToken = async (user) => {
  return jwt.sign(user, config.app.accesstoken, { expiresIn: '60m' });
};

getValues.generatedUserName = async (firstname, lastname) => {
  const formattedFirstname = firstname.replace(/\s/g, '').toLowerCase();
  const formattedLastname = lastname.replace(/\s/g, '').toLowerCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const resultData = `${formattedFirstname}${formattedLastname}${randomNum}`;
  return resultData;
};

getValues.generateinviteUser = async () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// getValues.checkInviteCom = async (inviteCode) => {
//   const codeExist = await inviteService.checkInviteCode(inviteCode);
//   if (codeExist) {
//     const code = await getValues.generateinviteUser();
//     const generateCode = await getValues.checkInviteCom(code);
//     return generateCode;
//   }
//   return inviteCode;
// };

getValues.getDefaultPassword = (token) => {
  const decoded = jwt.verify(token, config.app.accesstoken);
  return decoded;
};

getValues.generatePassword = () => {
  const { defaultPassword } = config.credentials;

  const payload = {
    password: defaultPassword,
    iat: Math.floor(Date.now() / 1000),
  };

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const password = jwt.sign(payload, config.app.accesstoken, { header });
  return password;
};

getValues.updatePassword = (password) => {
  const payload = {
    password,
    iat: Math.floor(Date.now() / 1000),
  };

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  return jwt.sign(payload, config.app.accesstoken, { header });
};

module.exports = getValues;

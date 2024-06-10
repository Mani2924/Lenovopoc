/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const config = require('../config/vars');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.adminEmail,
    pass: config.email.adminPassword,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async (to, subject, templateFilePath, templateData) => {
  try {
    const html = await ejs.renderFile(templateFilePath, templateData);
    const mailOptions = {
      from: config.email.adminEmail,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return 'success';
  } catch (error) {
    return 'error';
  }
};

module.exports = { sendEmail, transporter };

// const ejs = require('ejs');
// const sgMail = require('@sendgrid/mail');
// const config = require('../config/vars');

// sgMail.setApiKey(config.app.sgApiKey);

// const sendEmail = async (to, subject, templateFilePath, templateData) => {
//   const html = await ejs.renderFile(templateFilePath, templateData);
//   const sendGridMailOptions = {
//     from: config.app.adminEmail,
//     to,
//     subject,
//     html,
//   };

//   const mailSent = await sgMail.send(sendGridMailOptions);
//   if (mailSent) {
//     return 'success';
//   }
//   return 'failure';
// };

// module.exports = { sendEmail };

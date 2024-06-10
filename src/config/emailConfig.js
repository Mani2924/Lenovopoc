const ejs = require('ejs');
const { SendEmailCommand } = require('@aws-sdk/client-ses');
const { sesClient } = require('./s3Connection');

const config = require('../config/vars');

const sendEmail = async (email, subject, templateFilePath, templateData) => {
  try {
    const html = await ejs.renderFile(templateFilePath, templateData);

    const mailOptions = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Data: html,
          },
        },
        Subject: {
          Data: subject,
        },
      },
      Source: config.email.adminEmail,
    };

    const mailSent = await sesClient.send(new SendEmailCommand(mailOptions));
    if (mailSent) {
      return 'success';
    }
    return 'failure';
  } catch (error) {
    return 'failure';
  }
};

module.exports = { sendEmail };
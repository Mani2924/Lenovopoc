/* eslint-disable import/no-extraneous-dependencies */
const { S3Client } = require('@aws-sdk/client-s3');
const { SESClient } = require('@aws-sdk/client-ses');

const config = require('../config/vars');

const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accesskey,
    secretAccessKey: config.aws.secretkey,
  },
});

const sesClient = new SESClient({
  region: config.temp.regionTemp,
  credentials: {
    accessKeyId: config.temp.accessKeyTemp,
    secretAccessKey: config.temp.secretKeyTemp,
  },
});

module.exports = { s3, sesClient };

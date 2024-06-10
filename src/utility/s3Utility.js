const multer = require('multer');
const multerS3 = require('multer-s3');
const shortId = require('shortid');

const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const { s3 } = require('./s3Connection');

const config = require('../config/vars');

const createMulter = (folderName) => {
  return multer({
    storage: multerS3({
      s3,
      bucket: config?.aws?.bucketName,
      contentType: multerS3?.AUTO_CONTENT_TYPE,
      key(req, file, cb) {
        cb(null, `${folderName}/${shortId?.generate()}-${file?.originalname}`);
      },
    }),
  });
};

const deleteRecord = async (record) => {
  const input = {
    Bucket: config?.aws?.bucketName,
    Key: record,
  };
  const command = new DeleteObjectCommand(input);
  await s3?.send(command);
};

module.exports = { createMulter, deleteRecord };

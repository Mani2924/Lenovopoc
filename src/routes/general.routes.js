const express = require('express');

const {
  shiftData,
  currentShiftData,
  updateCurrentShiftData,
  fileUpload
} = require('../controllers/general.controller');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });
// const validate = require('../middleware/validate');

// const userValidation = require('../validation/user.validation');

const router = express.Router();

router.get('/shiftdata', shiftData);
router.get('/shift', currentShiftData);
router.put('/:id', updateCurrentShiftData);
router.route('/importExcel').post(upload.single('file'), fileUpload);

module.exports = router;

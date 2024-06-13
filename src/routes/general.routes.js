const express = require('express');

const {
  shiftData,
  currentShiftData,
  updateCurrentShiftData,
  fileUpload,
  previousShiftDate2,
  currentShiftData2,
} = require('../controllers/general.controller');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });
// const validate = require('../middleware/validate');

// const userValidation = require('../validation/user.validation');

const router = express.Router();

router.get('/shiftdata', shiftData);
router.get('/previousshiftdata', previousShiftDate2);
router.get('/shift', currentShiftData);
router.get('/shift2', currentShiftData2);

router.put('/:id', updateCurrentShiftData);
router.route('/importExcel').post(upload.single('file'), fileUpload);

module.exports = router;

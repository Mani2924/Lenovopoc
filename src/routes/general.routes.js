const express = require('express');

const {
  shiftData,
  currentShiftData,
  updateCurrentShiftData,
  fileUpload,
  previousShiftDate2,
  currentShiftData2,
  targetCalculation,
  shiftDataBasedOnDate,
  displayPreviousTwoShiftsData,
  getDownTime,
  getEmoji
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
router.get('/', shiftDataBasedOnDate);
router.get('/getDownTime', getDownTime);
router.get('/getEmoji', getEmoji);

router.get('/displayprevioustwoshiftsdata', displayPreviousTwoShiftsData);

router.put('/:id', updateCurrentShiftData);
router.route('/importExcel').post(upload.single('file'), fileUpload);

router.post('/insertTarget', targetCalculation);

module.exports = router;

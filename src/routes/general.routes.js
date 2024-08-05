const express = require('express');

const {
  targetCalculation,
  getDownTime,
  getEmoji,
  getSystemUPH,
  productionData,
  getLastThreeHourData,
  getLastHourData
} = require('../controllers/general.controller');
const multer = require('multer');
const router = express.Router();

router.get('/getDownTime', getDownTime);
router.get('/getEmoji', getEmoji);
router.get('/getTarget', getSystemUPH);
router.post('/insertTarget', targetCalculation);
router.get('/productiondata', productionData);
router.get('/getLastThreeHour',getLastThreeHourData)
router.get('/getLastHour',getLastHourData)

module.exports = router;

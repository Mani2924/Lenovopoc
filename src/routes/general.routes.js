const express = require('express');

const {shiftData, currentShiftData} = require('../controllers/general.controller');
// const validate = require('../middleware/validate');

// const userValidation = require('../validation/user.validation');

const router = express.Router();

router.get('/shiftdata', shiftData);
router.get('/shift', currentShiftData);

module.exports = router;

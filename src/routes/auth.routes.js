const express = require('express');

const { login, forgotPassword, resetPassword, logout, adminRefreshToken } = require('../controllers/auth.controller');

const adminAuth = require('../middleware/adminAuth');

const validate = require('../middleware/validate');
const loginValidation = require('../validation/auth.validation');

const router = express.Router();

router.post('/login', validate(loginValidation.login), login);
router.post('/forgotpassword', validate(loginValidation.forgotpassword), forgotPassword);
router.post('/resetpassword', validate(loginValidation.resetpassword), resetPassword);
router.post('/refreshtoken', validate(loginValidation.logout), adminRefreshToken);
router.post('/logout', adminAuth, validate(loginValidation.logout), logout);

module.exports = router;

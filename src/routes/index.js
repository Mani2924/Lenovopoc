const express = require('express');

const routes = express.Router();

const response = require('../utility/response');

const auth = require('../middleware/adminAuth');

const authorize = require('../middleware/accessControl');
const { featuresValues } = require('../utility/featuresValue');

// routes.use('/auth', require('./auth.routes'), response.default);

routes.use('/user', auth, require('./user.routes'), response.default);
routes.use('/general', require('./general.routes'), response.default);

module.exports = routes;

const express = require('express');

const routes = express.Router();

const response = require('../utility/response');
routes.use('/general', require('./general.routes'), response.default);

module.exports = routes;

/* eslint-disable consistent-return */
const Joi = require('joi');

const httpStatus = require('http-status');

const pick = require('../utility/pick');

const validate = (schema) =>
  function (req, res, next) {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(', ');
      res.status(httpStatus.BAD_REQUEST).send({
        status: 'FALSE',
        message: errorMessage,
      });
      return;
    }
    Object.assign(req, value);
    return next();
  };

module.exports = validate;

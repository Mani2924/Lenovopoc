const Joi = require('joi');

const updateById = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
};

module.exports = { updateById };

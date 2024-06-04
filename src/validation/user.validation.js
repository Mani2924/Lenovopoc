const Joi = require('joi');

const getById = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
};
const getAllUser = Joi.object({
  firstName: Joi.string().allow('').optional(),
  lastName: Joi.string().allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  relatedType: Joi.string().allow('').optional(),
  userStatus: Joi.string().allow('').optional(),
  mobile: Joi.string().allow('').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100000).optional(),
});
module.exports = { getById, getAllUser };

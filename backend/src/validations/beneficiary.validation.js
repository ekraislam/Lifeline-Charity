const Joi = require('joi');

const createHelpRequestSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required()
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('under_review', 'approved', 'rejected', 'fulfilled').required()
});

module.exports = { createHelpRequestSchema, updateStatusSchema };

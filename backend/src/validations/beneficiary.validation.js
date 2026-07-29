const Joi = require('joi');

const createHelpRequestSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    required_amount: Joi.number().min(0).default(0)
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('under_review', 'approved', 'rejected', 'waiting_for_ngo', 'assigned', 'campaign_active', 'fulfilled').required()
});

module.exports = { createHelpRequestSchema, updateStatusSchema };

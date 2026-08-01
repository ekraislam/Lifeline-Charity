const Joi = require('joi');

const createHelpRequestSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    required_amount: Joi.number().min(0).default(0),
    payment_method: Joi.string().valid('Bank Transfer', 'bKash', 'Nagad', 'Rocket').default('Bank Transfer'),
    account_holder_name: Joi.string().allow('', null).optional(),
    account_number: Joi.string().allow('', null).optional()
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('under_review', 'approved', 'rejected', 'waiting_for_ngo', 'assigned', 'campaign_active', 'fulfilled').required(),
    admin_note: Joi.string().allow('', null).optional()
});

module.exports = { createHelpRequestSchema, updateStatusSchema };

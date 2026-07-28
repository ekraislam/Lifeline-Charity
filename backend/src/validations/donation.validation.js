const Joi = require('joi');

const createDonationSchema = Joi.object({
    campaign_id: Joi.number().required(),
    amount: Joi.number().positive().required(),
    is_anonymous: Joi.boolean().default(false),
    is_recurring: Joi.boolean().default(false),
    recurring_frequency: Joi.string().valid('none', 'weekly', 'monthly', 'yearly').default('none')
});

module.exports = { createDonationSchema };

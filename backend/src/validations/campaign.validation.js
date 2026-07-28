const Joi = require('joi');

const createCampaignSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category_id: Joi.number().optional(),
    goal_amount: Joi.number().positive().required(),
    deadline: Joi.date().iso().optional(),
    is_featured: Joi.boolean().optional()
});

const updateCampaignSchema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    category_id: Joi.number().optional(),
    goal_amount: Joi.number().positive().optional(),
    deadline: Joi.date().iso().optional(),
    is_featured: Joi.boolean().optional()
});

const approveRejectSchema = Joi.object({
    status: Joi.string().valid('approved', 'rejected').required()
});

module.exports = { createCampaignSchema, updateCampaignSchema, approveRejectSchema };

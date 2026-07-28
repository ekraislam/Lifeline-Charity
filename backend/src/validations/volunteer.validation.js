const Joi = require('joi');

const updateProfileSchema = Joi.object({
    skills: Joi.string().required(),
    availability: Joi.string().required()
});

const createTaskSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    required_skills: Joi.string().optional()
});

const assignTaskSchema = Joi.object({
    volunteer_id: Joi.number().required(),
    task_id: Joi.number().required()
});

const logHoursSchema = Joi.object({
    task_id: Joi.number().required(),
    hours_logged: Joi.number().positive().required(),
    attendance_status: Joi.string().valid('present', 'absent', 'excused').required()
});

module.exports = { updateProfileSchema, createTaskSchema, assignTaskSchema, logHoursSchema };

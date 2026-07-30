const Joi = require('joi');

const createEventSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    event_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().min(Joi.ref('event_date')).required()
}).unknown(true);

const joinEventSchema = Joi.object({
    role: Joi.string().valid('participant', 'volunteer').default('participant')
});

const attendanceSchema = Joi.object({
    user_id: Joi.number().required(),
    attendance_status: Joi.string().valid('attended', 'absent').required()
});

module.exports = { createEventSchema, joinEventSchema, attendanceSchema };

const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('donor', 'volunteer', 'beneficiary', 'ngo', 'guest').default('guest'),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    org_name: Joi.string().when('role', { is: 'ngo', then: Joi.required(), otherwise: Joi.optional() }),
    registration_number: Joi.string().when('role', { is: 'ngo', then: Joi.required(), otherwise: Joi.optional() }),
    skills: Joi.string().when('role', { is: 'volunteer', then: Joi.required(), otherwise: Joi.optional() }),
    availability: Joi.string().when('role', { is: 'volunteer', then: Joi.required(), otherwise: Joi.optional() })
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});

module.exports = { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };

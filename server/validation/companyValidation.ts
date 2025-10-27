import Joi from 'joi'

// Company creation validation rules
export const companyCreateValidationSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'title is required',
    'string.empty': 'title is required',
  }),
  email: Joi.string().required().email().normalize().messages({
    'any.required': 'Email is required',
    'string.email': 'Provide valid email',
  }),
  plan: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'any.required': 'plan is required',
      'string.pattern.base': 'plan should be valid',
    }),
  purchasedOn: Joi.string().required().messages({
    'any.required': 'purchased date is required',
    'string.empty': 'purchased date should be string',
  }),
  secondaryEmail: Joi.string().optional().email().normalize().messages({
    'string.email': 'Provide valid email',
  }),
})

export default { companyCreateValidationSchema }

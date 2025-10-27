import Joi from 'joi'

// Add pricing plan validation rules
export const pricingAddValidationSchema = Joi.object({
  plan: Joi.string().required().messages({
    'any.required': 'plan name is required',
    'string.empty': 'plan name must not be empty',
  }),
  price: Joi.number().required().messages({
    'any.required': 'price is required',
    'number.base': 'price should be valid Number',
  }),
  duration: Joi.number().required().messages({
    'any.required': 'duration is required',
    'number.base': 'duration should be valid Number',
  }),
})

// Update pricing plan validation rules
export const updatePricingValidationSchema = Joi.object({
  plan: Joi.string().optional().messages({
    'string.empty': 'plan name should be in the format of string',
  }),
  price: Joi.number().optional().messages({
    'number.base': 'price should be valid Number',
  }),
  duration: Joi.number().optional().messages({
    'number.base': 'duration should be valid Number',
  }),
})

export default { pricingAddValidationSchema, updatePricingValidationSchema }

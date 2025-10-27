import Joi from 'joi'

// Add role validation rules
export const addRoleValidationSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Role title is required',
    'string.empty': 'Title should not be empty',
  }),
  permissions: Joi.array().required().messages({
    'any.required': 'Permissions are required',
    'array.base': 'Permissions should be valid array',
  }),
  company: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'any.required': 'Company is required',
      'string.pattern.base': 'Company should be valid',
    }),
})

// Update role validation rules
export const updateRoleValidationSchema = Joi.object({
  title: Joi.string().optional().messages({
    'string.empty': 'Title should be valid string',
  }),
  permissions: Joi.array().optional().messages({
    'array.base': 'Permissions should be valid array',
  }),
  company: Joi.string()
    .optional()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Company should be valid',
    }),
})

export default {
  addRoleValidationSchema,
  updateRoleValidationSchema,
}

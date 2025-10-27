import Joi from 'joi'

// Add country validation rules
export const addCOuntryValidationSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Country title is required',
    'string.empty': 'Title should not be empty',
  }),
  approvalDays: Joi.number().required().messages({
    'any.required': 'ApprovalDays is required',
    'number.base': 'ApprovalDays should be valid Number',
  }),
  launchDays: Joi.number().required().messages({
    'any.required': 'LaunchDays is required',
    'number.base': 'LaunchDays should be valid Number',
  }),
  initiateDays: Joi.number().required().messages({
    'any.required': 'InitiateDays is required',
    'number.base': 'InitiateDays should be valid Number',
  }),
  submitDays: Joi.number().required().messages({
    'any.required': 'SubmitDays is required',
    'number.base': 'SubmitDays should be valid Number',
  }),
  renewDays: Joi.number().required().messages({
    'any.required': 'RenewDays is required',
    'number.base': 'RenewDays should be valid Number',
  }),
  IA: Joi.number().required().messages({
    'any.required': 'IA is required',
    'number.base': 'IA should be valid Number',
  }),
  IB: Joi.number().required().messages({
    'any.required': 'IB is required',
    'number.base': 'IB should be valid Number',
  }),
  major: Joi.number().required().messages({
    'any.required': 'Major is required',
    'number.base': 'Major should be valid Number',
  }),
  minor: Joi.number().required().messages({
    'any.required': 'Minor is required',
    'number.base': 'Minor should be valid Number',
  }),
})

// Update country validation rules
export const updateCOuntryValidationSchema = Joi.object({
  title: Joi.string().optional().messages({
    'string.empty': 'Title should be valid string',
  }),
  approvalDays: Joi.number().optional().messages({
    'number.base': 'ApprovalDays should be valid Number',
  }),
  launchDays: Joi.number().optional().messages({
    'number.base': 'LaunchDays should be valid Number',
  }),
  initiateDays: Joi.number().optional().messages({
    'number.base': 'InitiateDays should be valid Number',
  }),
  submitDays: Joi.number().optional().messages({
    'number.base': 'SubmitDays should be valid Number',
  }),
  renewDays: Joi.number().optional().messages({
    'number.base': 'RenewDays should be valid Number',
  }),
  IA: Joi.number().optional().messages({
    'number.base': 'IA should be valid Number',
  }),
  IB: Joi.number().optional().messages({
    'number.base': 'IB should be valid Number',
  }),
  major: Joi.number().optional().messages({
    'number.base': 'Major should be valid Number',
  }),
  minor: Joi.number().optional().messages({
    'number.base': 'Minor should be valid Number',
  }),
})

export default { addCOuntryValidationSchema, updateCOuntryValidationSchema }

import Joi from 'joi'

// Add renewal validation rules
export const addValidationSchema = Joi.object({
  id: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'any.required': 'id is required',
      'string.pattern.base': 'id should be valid',
    }),
  renewDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'renew date is required',
    'string.empty': 'renew date should not be empty',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
  posPdf: Joi.string().optional().messages({
    'string.empty': 'posPdf should be string',
  }),
  approvalPdf: Joi.string().optional().messages({
    'string.empty': 'approvalPdf should be string',
  }),
  stage: Joi.string().required().messages({
    'any.required': 'stage is required',
    'string.empty': 'stage should not be empty',
  }),
  expInitiateDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'expected Initiate Date is required',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
  expRenewDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'expected renew Date is required',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
  expSubmitDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'expected submit Date is required',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
  initiateDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'initiate date Date is required',
    'string.empty': 'initiate date should contain a date',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
})

// Initiate renewal validation rules
export const initiateValidationSchema = Joi.object({
  id: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'any.required': 'id is required',
      'string.pattern.base': 'id should be valid',
    }),
  countryID: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'any.required': 'country is required',
      'string.pattern.base': 'country should be valid',
    }),
  expInitiateDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'expected Initiate Date is required',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
  expRenewDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'expected renew Date is required',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
  expSubmitDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'expected submit Date is required',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
  initiateDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'initiate date Date is required',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
  stage: Joi.string().required().messages({
    'any.required': 'stage is required',
  }),
})

// Submit renewal validation rules
export const submitValidationSchema = Joi.object({
  id: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'any.required': 'id is required',
      'string.pattern.base': 'id should be valid',
    }),
  countryID: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'any.required': 'country is required',
      'string.pattern.base': 'country should be valid',
    }),
  expInitiateDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'expected Initiate Date is required',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
  expRenewDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'expected renew Date is required',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
  expSubmitDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'expected submit Date is required',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
  initiateDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'initiate date Date is required',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
  stage: Joi.string().required().messages({
    'any.required': 'stage is required',
  }),
  submitDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'submit date is required',
    'string.empty': 'submit date should contain a date',
    'string.min': 'Invalid date format',
    'string.max': 'Invalid date format',
  }),
})

// Alert report validation rules
export const alertReportSchema = Joi.object({
  renewYear: Joi.string().required().min(4).max(4).messages({
    'any.required': 'Please provide year',
    'string.empty': 'year should not be empty',
    'string.min': 'Invalid year format',
    'string.max': 'Invalid year format',
  }),
})

export default {
  addValidationSchema,
  initiateValidationSchema,
  submitValidationSchema,
  alertReportSchema,
}

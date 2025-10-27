import Joi from 'joi'

// Add variation validation rules
export const addVariationValidationSchema = Joi.object({
  preregistration: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'any.required': 'Pre registration is required',
      'string.pattern.base': 'Pre registration should be valid',
    }),
  title: Joi.string().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title should not be empty',
  }),
  category: Joi.string().required().valid('IA', 'IB', 'MINOR', 'MAJOR').messages({
    'any.required': 'category is required',
    'any.only': 'Invalid category name',
  }),
  expApprovalDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'expected approval date is required',
    'string.empty': 'expected approval date should not be empty',
    'string.min': 'Invalid expected approval date format',
    'string.max': 'Invalid expected approval date format',
  }),
  submissionDate: Joi.string().required().min(10).max(10).messages({
    'any.required': 'submission date is required',
    'string.empty': 'submission date should not be empty',
    'string.min': 'Invalid submission date format',
    'string.max': 'Invalid submission date format',
  }),
  remark: Joi.string().optional().messages({
    'string.empty': 'remark should not be empty',
  }),
  POS: Joi.string().required().valid('received', 'not-received').messages({
    'any.required': 'POS is required',
    'any.only': 'Invalid POS name',
  }),
  approvalPdf: Joi.string().optional().messages({
    'string.empty': 'approval Pdf should be string',
  }),
  posPdf: Joi.string().optional().messages({
    'string.empty': 'pos Pdf should be string',
  }),
  approvalDate: Joi.string().optional().min(10).max(10).messages({
    'string.empty': 'approval date should not be empty',
    'string.min': 'Invalid approval date format',
    'string.max': 'Invalid approval date format',
  }),
  approval: Joi.string().optional().valid('received', 'not-received').messages({
    'any.only': 'Invalid approval name',
  }),
  stage: Joi.string().optional().valid('submitted', 'not-submitted').messages({
    'any.only': 'Invalid stage name',
  }),
  company: Joi.string()
    .optional()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'company should be valid',
    }),
  status: Joi.boolean().optional().messages({
    'boolean.base': 'status should be valid',
  }),
})

// Update variation validation rules
export const updateVariationValidationSchema = Joi.object({
  id: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'any.required': 'id is required',
      'string.pattern.base': 'id should be valid',
    }),
  product: Joi.string()
    .optional()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Product should be valid',
    }),
  title: Joi.string().optional().messages({
    'string.empty': 'Title should not be empty',
  }),
  category: Joi.string().optional().valid('IA', 'IB', 'MINOR', 'MAJOR').messages({
    'any.only': 'Invalid category name',
  }),
  expApprovalDate: Joi.string().optional().min(10).max(10).messages({
    'string.empty': 'expected approval date should not be empty',
    'string.min': 'Invalid expected approval date format',
    'string.max': 'Invalid expected approval date format',
  }),
  submissionDate: Joi.string().optional().min(10).max(10).messages({
    'string.empty': 'submission date should not be empty',
    'string.min': 'Invalid submission date format',
    'string.max': 'Invalid submission date format',
  }),
  remark: Joi.string().optional().messages({
    'string.empty': 'remark should not be empty',
  }),
  POS: Joi.string().optional().valid('received', 'not-received').messages({
    'any.only': 'Invalid POS name',
  }),
  approvalPdf: Joi.string().optional().messages({
    'string.empty': 'approval Pdf should be string',
  }),
  posPdf: Joi.string().optional().messages({
    'string.empty': 'pos Pdf should be string',
  }),
  approvalDate: Joi.string().optional().min(10).max(10).messages({
    'string.empty': 'approval date should not be empty',
    'string.min': 'Invalid approval date format',
    'string.max': 'Invalid approval date format',
  }),
  approval: Joi.string().optional().valid('received', 'not-received').messages({
    'any.only': 'Invalid approval name',
  }),
  stage: Joi.string().optional().valid('submitted', 'not-submitted').messages({
    'any.only': 'Invalid stage name',
  }),
  company: Joi.string()
    .optional()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'company should be valid',
    }),
  status: Joi.boolean().optional().messages({
    'boolean.base': 'status should be valid',
  }),
})

export default {
  addVariationValidationSchema,
  updateVariationValidationSchema,
}

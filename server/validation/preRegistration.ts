import Joi from 'joi'

// Pre-registration creation validation rules
export const preRegistrationCreateValidationSchema = Joi.object({
  product: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'any.required': 'Product is required',
      'string.pattern.base': 'Product should be valid',
    }),
  country: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'any.required': 'country is required',
      'string.pattern.base': 'country should be valid',
    }),
  apiName: Joi.string().required().messages({
    'any.required': 'Api Name is required',
    'string.empty': 'Api Name should be valid string',
  }),
  brandName: Joi.string().required().messages({
    'any.required': 'Brand Name is required',
    'string.empty': 'Brand Name should be valid string',
  }),
  localPartner: Joi.array().optional().messages({
    'array.base': 'Partner name be valid string',
  }),
  remark: Joi.string().optional().messages({
    'string.empty': 'remark should be valid string',
  }),
  status: Joi.boolean().optional().messages({
    'boolean.base': 'Provide valid status',
  }),
})

// Pre-registration update validation rules
export const preRegistrationUpdateValidationSchema = Joi.object({
  productID: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'any.required': 'product id is required to update',
      'string.pattern.base': 'product id  should be valid',
    }),
  sample: Joi.string().optional().messages({
    'string.empty': 'sample should be string',
  }),
  country: Joi.string()
    .optional()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'country should be valid',
    }),
  status: Joi.boolean().optional().messages({
    'boolean.base': 'Provide valid status',
  }),
  remark: Joi.string().optional().messages({
    'string.empty': 'remark should be valid string',
  }),
  registrationNo: Joi.string().optional().messages({
    'string.empty': 'registration No should be valid string',
  }),
  expApprovalDate: Joi.string().optional().messages({
    'string.empty': 'expApproval Date should be valid string',
  }),
  dossier: Joi.string().optional().messages({
    'string.empty': 'dossier should be valid string',
  }),
  submissionDate: Joi.string().optional().messages({
    'string.empty': 'submission Date should be valid string',
  }),
  expLaunchDate: Joi.string().optional().messages({
    'string.empty': 'expLaunch Date should be valid string',
  }),
  localPartner: Joi.array().optional().messages({
    'array.base': 'local Partner should be valid string',
  }),
  api: Joi.array().optional().messages({
    'array.base': 'api be valid string',
  }),
  modeOfRegistration: Joi.string().optional().messages({
    'string.empty': 'mode of registration should be valid string',
  }),
  siteGMP: Joi.string().optional().messages({
    'string.empty': 'site GMPshould be valid string',
  }),
  modeOfVersion: Joi.string().optional().messages({
    'string.empty': 'mode of version Partner should be valid string',
  }),
  FPSpecificationNumber: Joi.string().optional().messages({
    'string.empty': 'FPS pecification number should be valid string',
  }),
  shelfLife: Joi.string().optional().messages({
    'string.empty': 'shelf life number should be valid string',
  }),
  batchSize: Joi.string().optional().messages({
    'string.empty': 'batch size number should be valid string',
  }),
  batchFormula: Joi.string().optional().messages({
    'string.empty': 'batch formula number should be valid string',
  }),
  storageCondition: Joi.string().optional().messages({
    'string.empty': 'storage conditionnumber should be valid string',
  }),
  packSize: Joi.string().optional().messages({
    'string.empty': 'pack size number should be valid string',
  }),
  registeredArtworkLabel: Joi.string().optional().messages({
    'string.empty': 'registered artwork label number should be valid string',
  }),
  registeredArtworkCarton: Joi.string().optional().messages({
    'string.empty': 'registered artwork carton number should be valid string',
  }),
  registeredArtworkOuterCarton: Joi.string().optional().messages({
    'string.empty': 'registered artwork outer carton number should be valid string',
  }),
  registeredArtworkPackageInsert: Joi.string().optional().messages({
    'string.empty': 'registered artwork package insert number should be valid string',
  }),
  registeredArtworkPIL: Joi.string().optional().messages({
    'string.empty': 'registered artwork PIL number should be valid string',
  }),
  rc: Joi.string().optional().messages({
    'string.empty': 'rc number should be valid string',
  }),
  company: Joi.string()
    .optional()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'company should be valid',
    }),
})

export default {
  preRegistrationCreateValidationSchema,
  preRegistrationUpdateValidationSchema,
}

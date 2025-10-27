import Joi from 'joi'

// User creation validation rules
export const userCreateValidationSchema = Joi.object({
  firstName: Joi.string().required().trim(),
  lastName: Joi.string().required().trim(),
  password: Joi.string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .min(8)
    .max(20),
  email: Joi.string().required().email().normalize(),
  role: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId pattern
})

// Login validation rules
export const loginValidationSchema = Joi.object({
  email: Joi.string().required().email().normalize(),
  password: Joi.string().required().min(5).max(12),
})

// Logout validation rules
export const logoutValidationSchema = Joi.object({
  id: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId pattern
})

// Update user validation rules
export const updateUserValidationSchema = Joi.object({
  firstName: Joi.string().trim(),
  lastName: Joi.string().trim(),
  email: Joi.string().email().normalize(),
  company: Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId pattern
  role: Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId pattern
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .min(8)
    .max(20),
})

// Forgot password validation rules
export const forgetPwdValidationSchema = Joi.object({
  email: Joi.string().required().email().normalize(),
})

// Verify OTP validation rules
export const verifyOtpValidationSchema = Joi.object({
  reset_otp: Joi.string().required().length(4).pattern(/^\d+$/),
})

// Change password validation rules
export const changePasswordValidationSchema = Joi.object({
  id: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId pattern
  email: Joi.string().required().email().normalize(),
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  confirmPassword: Joi.string().required(),
})

export default {
  userCreateValidationSchema,
  updateUserValidationSchema,
  loginValidationSchema,
  logoutValidationSchema,
  forgetPwdValidationSchema,
  verifyOtpValidationSchema,
  changePasswordValidationSchema,
}

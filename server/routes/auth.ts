import { Router } from 'express'
import middleware from '../middleware/middleware'
import authController from '../controller/auth'
import { validate } from '../middleware/validationMiddleware'
import { userCreateValidationSchema, updateUserValidationSchema } from '../validation/authValidation'

const router = Router()

router.get('/users', middleware.checkToken, middleware.checkRoot, authController.getAllUser)
router.post(
  '/addUser',
  middleware.checkToken,
  middleware.checkRoot,
  validate(userCreateValidationSchema),
  authController.register
)
router.put(
  '/update/:id',
  middleware.checkToken,
  middleware.checkRoot,
  validate(updateUserValidationSchema),
  authController.updateUser
)
router.delete('/delete/:id', middleware.checkToken, middleware.checkRoot, authController.deleteUser)
router.post('/change/password', middleware.checkToken, authController.changePassword)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.post('/verify-otp', authController.verifyLoginOtp)
router.post('/resend-otp', authController.resendLoginOtp)
router.post('/two-factor-verify/:id', authController.enableTwoFactorAuth)
router.post('/sent-otp', authController.otpSent)
router.post('/forget-password/verify-otp', authController.forgetPasswordOtpVerify)
router.post('/forget-password', authController.forgetPassword)

export default router

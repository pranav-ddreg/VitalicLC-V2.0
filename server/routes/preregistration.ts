import { Router } from 'express'
import formidableMiddleware from 'express-formidable'
import middleware from '../middleware/middleware'
import { validate } from '../middleware/validationMiddleware'
import preregistrationController from '../controller/preregistration'
import { preRegistrationCreateValidationSchema } from '../validation/preRegistration'

const router = Router()

router.get('/exportPdf/:id', middleware.checkToken, preregistrationController.exportSinglePreregistration)
router.get('/get', middleware.checkToken, preregistrationController.getallPreRegistration)
router.get('/getSingleRegistration/:id', middleware.checkToken, preregistrationController.getSinglePreRegistration)
router.get('/generatePresignedUrl/:id/:fileType', middleware.checkToken, preregistrationController.generatePresignedUrl)
router.post(
  '/',
  middleware.checkToken,
  middleware.checkCreate,
  validate(preRegistrationCreateValidationSchema),
  preregistrationController.addPreRegistration
)
router.put(
  '/update/:id',
  middleware.checkToken,
  middleware.checkUpdate,
  formidableMiddleware(),
  preregistrationController.updatePreRegistration
)
router.get('/productCountry/:productId', middleware.checkToken, preregistrationController.getCountryPreRegistration)
router.get('/countryProduct/:countryId', middleware.checkToken, preregistrationController.getProductPreRegistration)
router.delete(
  '/delete/:id',
  middleware.checkToken,
  middleware.checkDelete,
  formidableMiddleware(),
  preregistrationController.deletePreRegistration
)

export default router

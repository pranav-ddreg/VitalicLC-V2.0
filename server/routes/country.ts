import { Router } from 'express'
import formidableMiddleware from 'express-formidable'
import middleware from '../middleware/middleware'
import { validate } from '../middleware/validationMiddleware'
import countryController from '../controller/country'
import { addCOuntryValidationSchema, updateCOuntryValidationSchema } from '../validation/countryValidataion'

const router = Router()

router.get('/get', middleware.checkToken, countryController.getallCountry)
router.post(
  '/',
  middleware.checkToken,
  middleware.superAdmin,
  validate(addCOuntryValidationSchema),
  countryController.addCountry
)
router.post(
  '/uploadExcelFile',
  middleware.checkToken,
  middleware.superAdmin,
  formidableMiddleware(),
  countryController.importCountry
)
router.put(
  '/update/:id',
  middleware.checkToken,
  middleware.superAdmin,
  validate(updateCOuntryValidationSchema),
  countryController.updateCountry
)
router.delete('/delete/:id', middleware.checkToken, middleware.superAdmin, countryController.deleteCountry)

export default router

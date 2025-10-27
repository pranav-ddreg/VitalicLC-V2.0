import { Router } from 'express'
import middleware from '../middleware/middleware'
import { validate } from '../middleware/validationMiddleware'
import pricingController from '../controller/pricing'
import { pricingAddValidationSchema, updatePricingValidationSchema } from '../validation/pricingPlan'

const router = Router()

router.post(
  '/',
  middleware.checkToken,
  middleware.superAdmin,
  validate(pricingAddValidationSchema),
  pricingController.addPricing
)
router.get('/', middleware.checkToken, middleware.superAdmin, pricingController.viewPricing)
router.put(
  '/:id',
  middleware.checkToken,
  middleware.superAdmin,
  validate(updatePricingValidationSchema),
  pricingController.updatePricing
)
router.delete('/:id', middleware.checkToken, middleware.superAdmin, pricingController.deletePricing)

export default router

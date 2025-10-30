import { Router } from 'express'
import middleware from '../middleware/middleware'
import variationController from '../controller/variation'

const router = Router()

router.post('/add', middleware.checkToken, variationController.addVariation)
router.put('/submit', middleware.checkToken, variationController.submitVariation)
router.put('/update/:id', middleware.checkToken, variationController.updateVariation)
router.delete('/delete/:id', middleware.checkToken, variationController.deleteVariation)
router.get('/', middleware.checkToken, variationController.getallVariation)
router.get('/:id', middleware.checkToken, variationController.getVariationByProductId)
router.get('/byProduct/:productId', middleware.checkToken, variationController.getVariationByProductId)
router.post('/calculate', middleware.checkToken, variationController.calculate)

export default router

import { Router } from 'express'
import middleware from '../middleware/middleware'
import productController from '../controller/product'

const router = Router()

router.get('/get', middleware.checkToken, productController.getAllProduct)
router.post('/add', middleware.checkToken, middleware.checkCreate, productController.addProducts)
router.put('/update/:id', middleware.checkToken, middleware.checkUpdate, productController.updateProduct)
router.delete('/delete/:id', middleware.checkToken, middleware.checkDelete, productController.deleteProduct)

export default router

import { Router } from 'express'
import formidableMiddleware from 'express-formidable'
import middleware from '../middleware/middleware'
import companyController from '../controller/company'

const router = Router()

router.get('/get', middleware.checkToken, middleware.superAdmin, companyController.getallCompany)
router.post('/', middleware.checkToken, middleware.superAdmin, formidableMiddleware(), companyController.addCompany)
router.put(
  '/update/:id',
  middleware.checkToken,
  middleware.superAdmin,
  formidableMiddleware(),
  companyController.updateCompany
)
router.delete('/delete/:id', middleware.checkToken, middleware.superAdmin, companyController.deleteCompany)

export default router

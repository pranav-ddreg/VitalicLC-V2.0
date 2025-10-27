import { Router } from 'express'
import middleware from '../middleware/middleware'
import { validate } from '../middleware/validationMiddleware'
import roleController from '../controller/role'
import { addRoleValidationSchema, updateRoleValidationSchema } from '../validation/roleValidation'

const router = Router()

router.get('/get', middleware.checkToken, middleware.checkRoot, roleController.getallRole)
router.get('/roleByCompanyId/:companyId', middleware.checkToken, middleware.checkRoot, roleController.getCompanyRole)
router.post('/', middleware.checkToken, middleware.checkRoot, validate(addRoleValidationSchema), roleController.addRole)
router.put(
  '/update/:id',
  middleware.checkToken,
  middleware.checkRoot,
  validate(updateRoleValidationSchema),
  roleController.updateRole
)
router.delete('/delete/:id', middleware.checkToken, middleware.checkRoot, roleController.deleteRole)

export default router

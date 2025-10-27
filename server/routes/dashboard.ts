import { Router } from 'express'
import middleware from '../middleware/middleware'
import dashboardController from '../controller/dashboard'

const router = Router()

router.get('/', middleware.checkToken, dashboardController.dashboard)
router.get('/alertReport', middleware.checkToken, dashboardController.alertReport)
router.get('/expectedActual', middleware.checkToken, dashboardController.expectedActual)
router.get('/renewYear', middleware.checkToken, dashboardController.renewedYear)
router.get('/preRegistrationYear', middleware.checkToken, dashboardController.preRegistrationYear)
router.get('/search', middleware.checkToken, dashboardController.search)

export default router

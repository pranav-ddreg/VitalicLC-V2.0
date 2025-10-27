import { Router } from 'express'
import middleware from '../middleware/middleware'
import renewalController from '../controller/renewal'

const router = Router()

router.get('/', middleware.checkToken, renewalController.getallRenewal)
router.get('/byProduct/:productId', middleware.checkToken, renewalController.getRenewalByPreregistrationId)
router.delete('/delete/:id', middleware.checkToken, renewalController.deleteRenewal)
router.post('/add', middleware.checkToken, renewalController.addRenewal)
router.put('/update/:id', middleware.checkToken, renewalController.updateRenewal)
router.get('/years', middleware.checkToken, renewalController.getRenewYears)
router.post('/calculate', middleware.checkToken, renewalController.calculate)
router.get('/alertRenewal/:year', middleware.checkToken, renewalController.alertRenewal)
router.put('/initiate', middleware.checkToken, renewalController.initiate)
router.put('/submit', middleware.checkToken, renewalController.submit)
router.put('/renewed', middleware.checkToken, renewalController.renewed)

export default router

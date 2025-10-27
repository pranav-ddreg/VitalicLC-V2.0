import { Router } from 'express'
import middleware from '../middleware/middleware'
import recyclebinController from '../controller/recyclebin'

const router = Router()

router.get('/get', middleware.checkToken, recyclebinController.getTrash)
router.delete('/empty', middleware.checkToken, middleware.checkUpdate, recyclebinController.emptyTrash)
router.delete('/delete/:id', middleware.checkToken, middleware.checkUpdate, recyclebinController.deleteTrash)
router.put('/restore/:id', middleware.checkToken, middleware.checkUpdate, recyclebinController.restoreTrash)
router.get('/export/pdf', middleware.checkToken, (req, res) => {
  req.query.isDownload = 'true'
  req.query.filetype = 'pdf'
  recyclebinController.getTrash(req, res)
})
router.get('/export/excel', middleware.checkToken, (req, res) => {
  req.query.isDownload = 'true'
  req.query.filetype = 'xlsx'
  recyclebinController.getTrash(req, res)
})

export default router

import { Router } from 'express'
import formidableMiddleware from 'express-formidable'
import middleware from '../middleware/middleware'
import folderController from '../controller/folder'

const router = Router()

router.post('/upload-zip/:parentId', middleware.checkToken, formidableMiddleware(), folderController.uploadZipFile)
router.post('/presign-upload', folderController.presignUpload)
router.post('/get-upload-part-urls', folderController.getMultipartPartUrls)
router.post('/complete-upload', folderController.completeMultipartUpload)
router.post('/abort-upload', folderController.abortMultipartUpload)
router.get('/:parentId', middleware.checkToken, folderController.viewFolder)
router.get('/download/file', middleware.checkToken, folderController.downloadFile)
router.get('/download-zip/folder/:folderId', middleware.checkToken, folderController.downloadFolderAsZip)
router.get('/breadcrumb/:folderId', middleware.checkToken, folderController.breadCrumb)
router.delete('/delete-all-folders/:parentId', middleware.checkToken, folderController.deleteAllFolders)
router.delete('/delete-folder-file/:id', middleware.checkToken, folderController.deleteFolderFile)

export default router

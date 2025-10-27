import { Router } from 'express'
import middleware from '../middleware/middleware'
import fileController from '../controller/file'

const router = Router()

// Initiate multipart upload
// GET /api/pre-signed-url/:filename?contentType=application/zip
router.get('/pre-signed-url/:filename', middleware.checkToken, fileController.initiateMultipartUpload)

// GET /api/pre-signed-part-url?key=...&uploadId=...&partNumber=...&contentType=...
router.get('/pre-signed-part-url', middleware.checkToken, fileController.getPresignedPartUrl)

// Complete multipart upload
// POST /api/complete-multipart-upload { key, uploadId, parts: [{ETag, PartNumber}] }
router.post('/complete-multipart-upload', middleware.checkToken, fileController.completeMultipartUpload)

// Optional: Abort MPU to clean up on failures
// POST /api/abort-multipart-upload { key, uploadId }
router.post('/abort-multipart-upload', middleware.checkToken, fileController.abortMultipartUpload)

// Get job status for progress tracking
// GET /api/job-status/:jobId
router.get('/job-status/:jobId', middleware.checkToken, fileController.getJobStatus)

// Get S3 file size
// GET /api/file/size/:key
router.get('/size/:key', middleware.checkToken, fileController.getS3FileSize)

export default router

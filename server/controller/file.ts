import { UploadPartCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

import {
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3'

import s3 from '../config/s3client'
import JobsModel from '../model/jobs'
import RenewalModel from '../model/renewal'
import VariationModel from '../model/variation'
import FolderModel from '../model/folder'
import file from '../model/file'
import { processZipExtraction } from '../utils/zipExtractionProcess'
import { Request, Response, RequestWithUser } from '../types/interfaces'

const BUCKET = process.env.AWS_BUCKET_NAME
if (!BUCKET) {
  throw new Error('Missing S3_BUCKET env variables.')
}

// Utility to build a key; adjust prefix/naming as needed
function buildKey(filename: string): string {
  const safeName = filename.replace(/[^\w.\-]/g, '_')
  return `uploads/${Date.now()}-${randomUUID()}-${safeName}`
}

export default {
  initiateMultipartUpload: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const filename = req.params.filename
      const contentType = req.query.contentType || 'application/octet-stream'
      const key = buildKey(filename)

      const cmd = new CreateMultipartUploadCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType as string,
      })

      console.log('Creating multipart upload for:', key)

      const out = await s3.send(cmd)
      return res.json({
        bucket: BUCKET,
        key: out.Key,
        uploadId: out.UploadId,
      })
    } catch (err) {
      console.error('CreateMultipartUpload failed:', err)
      return res.status(500).json({ error: 'Failed to initialize multipart upload.' })
    }
  },

  getPresignedPartUrl: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { key, uploadId, partNumber } = req.query
      if (!key || !uploadId || !partNumber) {
        return res.status(400).json({ error: 'key, uploadId and partNumber are required.' })
      }

      const cmd = new UploadPartCommand({
        Bucket: BUCKET,
        Key: key as string,
        UploadId: uploadId as string,
        PartNumber: Number(partNumber),
      })

      const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 })
      return res.json({ url })
    } catch (err) {
      console.error('Presign part failed:', err)
      return res.status(500).json({ error: 'Failed to create presigned part URL.' })
    }
  },

  completeMultipartUpload: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { key, uploadId, parts, parentId, fileName } = req.body

      if (!key || !uploadId || !Array.isArray(parts) || parts.length === 0) {
        return res.status(400).json({ error: 'key, uploadId and non-empty parts are required.' })
      }

      console.log('Req User: ', req.user)

      // Determine collectionName by checking if parentId exists in renewal or variation
      let collectionName = 'renewal' // default fallback

      try {
        const renewalExists = await RenewalModel.findById(parentId)
        if (renewalExists) {
          collectionName = 'renewal'
        } else {
          const variationExists = await VariationModel.findById(parentId)
          if (variationExists) {
            collectionName = 'variation'
          }
        }
      } catch (checkErr) {
        console.log('Error checking parent collection:', checkErr)
        // Keep default collectionName as "renewal"
      }

      console.log(`Determined collectionName: ${collectionName} for parentId: ${parentId}`)

      // AWS expects parts sorted by PartNumber
      parts.sort((a: any, b: any) => a.PartNumber - b.PartNumber)

      const cmd = new CompleteMultipartUploadCommand({
        Bucket: BUCKET,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map((p: any) => ({
            ETag: p.ETag,
            PartNumber: Number(p.PartNumber),
          })),
        },
      })

      const out = await s3.send(cmd)

      // Create root container folder for this ZIP extraction
      const zipFolderName = (fileName || 'unknown').replace(/\.[^/.]+$/, '') // Remove extension
      console.log(`Creating root container folder: ${zipFolderName} under parent: ${parentId}`)

      const rootContainer = await FolderModel.create({
        title: zipFolderName,
        parent: parentId,
      })

      console.log(`Root container created with ID: ${rootContainer._id}`)

      const job = await JobsModel.create({
        fileKey: key,
        userId: req.user!._id,
        fileName: fileName || 'unknown',
        jobType: collectionName,
        parentId: rootContainer._id,
        s3Location: `dossier/${parentId}`,
        companyId: (req?.user?.company as any)?._id,
        status: 'in-progress',
      })

      console.log('Created job, starting immediate extraction:', job._id)

      // Start extraction asynchronously - don't wait for it
      processZipExtraction(job.id).catch((err: any) => {
        console.error('Background extraction failed:', err)
        // Mark job as failed in database
        JobsModel.findByIdAndUpdate(job.id, { status: 'failed' }).catch(console.error)
      })

      // Return immediately with success - extraction will happen in background
      return res.status(200).json({
        location: out.Location,
        key: out.Key,
        bucket: out.Bucket,
        message: `Upload complete! Creating folder "${zipFolderName}" and extracting files...`,
        jobId: job._id,
        rootFolderId: rootContainer._id,
        rootFolderName: zipFolderName,
      })
    } catch (err) {
      console.error('CompleteMultipartUpload failed:', err)
      return res.status(500).json({ error: 'Failed to complete multipart upload.' })
    }
  },

  abortMultipartUpload: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { key, uploadId } = req.body
      if (!key || !uploadId) {
        return res.status(400).json({ error: 'key and uploadId are required.' })
      }
      await s3.send(
        new AbortMultipartUploadCommand({
          Bucket: BUCKET,
          Key: key,
          UploadId: uploadId,
        })
      )
      return res.json({ ok: true })
    } catch (err) {
      console.error('abortMultipartUpload failed:', err)
      return res.status(500).json({ error: 'Failed to abort multipart upload.' })
    }
  },

  getS3FileSize: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { key } = req.params
      if (!key) {
        return res.status(400).json({ error: 'S3 key is required' })
      }

      const { getS3FileSize } = await import('../services/uploadsFiles')
      const result = await getS3FileSize(key)

      if (result.error) {
        return res.status(500).json({ error: result.error })
      }

      const size = typeof result.size === 'number' ? result.size : 0
      const formattedSize =
        typeof result.size === 'number'
          ? `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB (${size.toLocaleString()} bytes)`
          : 'Unknown size'

      return res.json({
        key: key,
        size: size,
        formattedSize,
        lastModified: result.lastModified,
        etag: result.etag,
      })
    } catch (err) {
      console.error('getS3FileSize failed:', err)
      return res.status(500).json({ error: 'Failed to get S3 file size' })
    }
  },

  getJobStatus: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { jobId } = req.params
      if (!jobId) {
        return res.status(400).json({ error: 'Job ID is required' })
      }

      const job = await JobsModel.findById(jobId)
      if (!job) {
        return res.status(404).json({ error: 'Job not found' })
      }

      // Count processed files (folders + files in the archive)
      const fileCount = await file.countDocuments({ parent: job.parentId })
      const folderCount = await FolderModel.countDocuments({ parent: job.parentId })

      return res.json({
        jobId: job._id,
        status: job.status,
        fileName: job.fileName,
        fileCount,
        folderCount,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      })
    } catch (err) {
      console.error('Get job status failed:', err)
      return res.status(500).json({ error: 'Failed to get job status' })
    }
  },
}

// Set environment variable before requiring the controller
process.env.AWS_BUCKET_NAME = 'test-bucket'

// Mock dependencies before requiring the controller
jest.mock('@aws-sdk/client-s3', () => ({
  CreateMultipartUploadCommand: jest.fn(),
  CompleteMultipartUploadCommand: jest.fn(),
  AbortMultipartUploadCommand: jest.fn(),
  UploadPartCommand: jest.fn(),
}))

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}))

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-uuid'),
}))

jest.mock(
  '../../config/s3client',
  () => ({
    send: jest.fn(),
  }),
  { virtual: false }
)

jest.mock('../../model/jobs', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  countDocuments: jest.fn(),
}))

jest.mock('../../model/renewal', () => ({
  findById: jest.fn(),
}))

jest.mock('../../model/variation', () => ({
  findById: jest.fn(),
}))

jest.mock('../../model/folder', () => ({
  create: jest.fn(),
  countDocuments: jest.fn(),
}))

jest.mock('../../model/file', () => ({
  countDocuments: jest.fn(),
}))

jest.mock('../../utils/zipExtractionProcess', () => ({
  processZipExtraction: jest.fn().mockResolvedValue({}),
}))

const {
  initiateMultipartUpload,
  getPresignedPartUrl,
  completeMultipartUpload,
  abortMultipartUpload,
  getJobStatus,
} = require('../../controller/file')

const {
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  UploadPartCommand,
} = require('@aws-sdk/client-s3')

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const s3 = require('../../config/s3client')
const JobsModel = require('../../model/jobs')
const RenewalModel = require('../../model/renewal')
const VariationModel = require('../../model/variation')
const FolderModel = require('../../model/folder')
const FileModel = require('../../model/file')

beforeAll(() => {
  process.env.AWS_BUCKET_NAME = 'test-bucket'
  // Suppress console logs to prevent test output noise
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterAll(() => {
  delete process.env.AWS_BUCKET_NAME
  // Restore console after all tests
  jest.restoreAllMocks()
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('file controller', () => {
  describe('initiateMultipartUpload', () => {
    test('should initiate multipart upload successfully', async () => {
      const req = {
        params: { filename: 'test.zip' },
        query: { contentType: 'application/zip' },
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }
      const mockOut = { Key: 'uploads/123-mocked-uuid-test.zip', UploadId: 'upload123' }

      s3.send.mockResolvedValue(mockOut)

      await initiateMultipartUpload(req, res)

      expect(CreateMultipartUploadCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: expect.stringContaining('test.zip'),
        ContentType: 'application/zip',
      })
      expect(s3.send).toHaveBeenCalledWith(expect.any(CreateMultipartUploadCommand))
      expect(res.json).toHaveBeenCalledWith({
        bucket: 'test-bucket',
        key: mockOut.Key,
        uploadId: mockOut.UploadId,
      })
    })

    test('should use default content-type when not provided', async () => {
      const req = {
        params: { filename: 'test.zip' },
        query: {},
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      s3.send.mockResolvedValue({ Key: 'key', UploadId: 'uploadId' })

      await initiateMultipartUpload(req, res)

      expect(CreateMultipartUploadCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: expect.any(String),
        ContentType: 'application/octet-stream',
      })
    })

    test('should handle AWS errors', async () => {
      const req = {
        params: { filename: 'test.zip' },
        query: {},
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }
      const error = new Error('AWS Error')

      s3.send.mockRejectedValue(error)

      await initiateMultipartUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to initialize multipart upload.',
      })
    })
  })

  describe('getPresignedPartUrl', () => {
    test('should generate presigned URL successfully', async () => {
      const req = {
        query: { key: 'test-key', uploadId: 'upload123', partNumber: '1' },
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }
      const mockUrl = 'https://presigned-url.com'

      getSignedUrl.mockResolvedValue(mockUrl)

      await getPresignedPartUrl(req, res)

      expect(UploadPartCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'test-key',
        UploadId: 'upload123',
        PartNumber: 1,
      })
      expect(getSignedUrl).toHaveBeenCalledWith(s3, expect.any(UploadPartCommand), {
        expiresIn: 3600,
      })
      expect(res.json).toHaveBeenCalledWith({ url: mockUrl })
    })

    test('should return 400 if required parameters missing', async () => {
      const req = {
        query: { key: 'test-key' }, // missing uploadId and partNumber
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      await getPresignedPartUrl(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'key, uploadId and partNumber are required.',
      })
    })

    test('should handle AWS presign errors', async () => {
      const req = {
        query: { key: 'test-key', uploadId: 'upload123', partNumber: '1' },
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }
      const error = new Error('Presign failed')

      getSignedUrl.mockRejectedValue(error)

      await getPresignedPartUrl(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to create presigned part URL.',
      })
    })
  })

  describe('completeMultipartUpload', () => {
    test('should complete multipart upload successfully', async () => {
      const req = {
        body: {
          key: 'test-key',
          uploadId: 'upload123',
          parts: [
            { ETag: 'etag1', PartNumber: 1 },
            { ETag: 'etag2', PartNumber: 2 },
          ],
          parentId: 'parent123',
          fileName: 'test.zip',
        },
        user: { _id: 'user123' },
        company: { _id: 'company123' },
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }
      const mockOut = {
        Location: 'https://s3.amazonaws.com/test-bucket/test-key',
        Key: 'test-key',
        Bucket: 'test-bucket',
      }

      s3.send.mockResolvedValue(mockOut)
      RenewalModel.findById.mockResolvedValue({ _id: 'parent123' })
      FolderModel.create.mockResolvedValue({ _id: 'folder123' })
      JobsModel.create.mockResolvedValue({ _id: 'job123' })

      await completeMultipartUpload(req, res)

      expect(RenewalModel.findById).toHaveBeenCalledWith('parent123')
      expect(FolderModel.create).toHaveBeenCalledWith({
        title: 'test',
        parent: 'parent123',
      })
      expect(JobsModel.create).toHaveBeenCalledWith({
        fileKey: 'test-key',
        userId: 'user123',
        fileName: 'test.zip',
        jobType: 'renewal',
        parentId: 'folder123',
        s3Location: 'dossier/parent123',
        companyId: 'company123',
        status: 'in-progress',
      })
    })

    test('should determine collectionName as variation', async () => {
      const req = {
        body: {
          key: 'test-key',
          uploadId: 'upload123',
          parts: [{ ETag: 'etag1', PartNumber: 1 }],
          parentId: 'parent123',
          fileName: 'test.zip',
        },
        user: { _id: 'user123' },
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      s3.send.mockResolvedValue({
        Location: 'https://s3.amazonaws.com/test-bucket/test-key',
        Key: 'test-key',
        Bucket: 'test-bucket',
      })
      RenewalModel.findById.mockResolvedValue(null)
      VariationModel.findById.mockResolvedValue({ _id: 'parent123' })
      FolderModel.create.mockResolvedValue({ _id: 'folder123' })
      JobsModel.create.mockResolvedValue({ _id: 'job123' })

      await completeMultipartUpload(req, res)

      expect(RenewalModel.findById).toHaveBeenCalledWith('parent123')
      expect(VariationModel.findById).toHaveBeenCalledWith('parent123')
      expect(JobsModel.create).toHaveBeenCalledWith(expect.objectContaining({ jobType: 'variation' }))
    })

    test('should return 400 if required body fields missing', async () => {
      const req = {
        body: { key: 'test-key' }, // missing uploadId, parts
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      await completeMultipartUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'key, uploadId and non-empty parts are required.',
      })
    })

    test('should handle AWS completion errors', async () => {
      const req = {
        body: {
          key: 'test-key',
          uploadId: 'upload123',
          parts: [{ ETag: 'etag1', PartNumber: 1 }],
          parentId: 'parent123',
          fileName: 'test.zip',
        },
        user: { _id: 'user123' },
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }
      const error = new Error('Completion failed')

      s3.send.mockRejectedValue(error)
      RenewalModel.findById.mockResolvedValue({ _id: 'parent123' })
      FolderModel.create.mockResolvedValue({ _id: 'folder123' })
      JobsModel.create.mockResolvedValue({ _id: 'job123' })

      await completeMultipartUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to complete multipart upload.',
      })
    })

    test('should sort parts by PartNumber', async () => {
      const req = {
        body: {
          key: 'test-key',
          uploadId: 'upload123',
          parts: [
            { ETag: 'etag2', PartNumber: 2 },
            { ETag: 'etag1', PartNumber: 1 },
          ],
          parentId: 'parent123',
          fileName: 'test.zip',
        },
        user: { _id: 'user123' },
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      s3.send.mockResolvedValue({
        Location: 'location',
        Key: 'key',
        Bucket: 'bucket',
      })
      RenewalModel.findById.mockResolvedValue({ _id: 'parent123' })
      FolderModel.create.mockResolvedValue({ _id: 'folder123' })
      JobsModel.create.mockResolvedValue({ _id: 'job123' })

      await completeMultipartUpload(req, res)

      expect(CompleteMultipartUploadCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'test-key',
        UploadId: 'upload123',
        MultipartUpload: {
          Parts: [
            { ETag: 'etag1', PartNumber: 1 },
            { ETag: 'etag2', PartNumber: 2 },
          ],
        },
      })
    })
  })

  describe('abortMultipartUpload', () => {
    test('should abort multipart upload successfully', async () => {
      const req = {
        body: { key: 'test-key', uploadId: 'upload123' },
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      s3.send.mockResolvedValue({})

      await abortMultipartUpload(req, res)

      expect(AbortMultipartUploadCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'test-key',
        UploadId: 'upload123',
      })
      expect(s3.send).toHaveBeenCalledWith(expect.any(AbortMultipartUploadCommand))
      expect(res.json).toHaveBeenCalledWith({ ok: true })
    })

    test('should return 400 if required body fields missing', async () => {
      const req = {
        body: { key: 'test-key' }, // missing uploadId
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      await abortMultipartUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'key and uploadId are required.',
      })
    })

    test('should handle AWS abort errors', async () => {
      const req = {
        body: { key: 'test-key', uploadId: 'upload123' },
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }
      const error = new Error('Abort failed')

      s3.send.mockRejectedValue(error)

      await abortMultipartUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to abort multipart upload.',
      })
    })
  })

  describe('getJobStatus', () => {
    test('should return job status successfully', async () => {
      const req = {
        params: { jobId: 'job123' },
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }
      const mockJob = {
        _id: 'job123',
        status: 'completed',
        fileName: 'test.zip',
        parentId: 'parent123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      JobsModel.findById.mockResolvedValue(mockJob)
      FileModel.countDocuments.mockResolvedValue(5)
      FolderModel.countDocuments.mockResolvedValue(3)

      await getJobStatus(req, res)

      expect(JobsModel.findById).toHaveBeenCalledWith('job123')
      expect(FileModel.countDocuments).toHaveBeenCalledWith({
        parent: 'parent123',
      })
      expect(FolderModel.countDocuments).toHaveBeenCalledWith({
        parent: 'parent123',
      })
      expect(res.json).toHaveBeenCalledWith({
        jobId: 'job123',
        status: 'completed',
        fileName: 'test.zip',
        fileCount: 5,
        folderCount: 3,
        createdAt: mockJob.createdAt,
        updatedAt: mockJob.updatedAt,
      })
    })

    test('should return 400 if jobId missing', async () => {
      const req = {
        params: {},
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      await getJobStatus(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Job ID is required',
      })
    })

    test('should return 404 if job not found', async () => {
      const req = {
        params: { jobId: 'job123' },
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      JobsModel.findById.mockResolvedValue(null)

      await getJobStatus(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Job not found',
      })
    })

    test('should handle database errors', async () => {
      const req = {
        params: { jobId: 'job123' },
      }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }
      const error = new Error('Database error')

      JobsModel.findById.mockRejectedValue(error)

      await getJobStatus(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to get job status',
      })
    })
  })
})

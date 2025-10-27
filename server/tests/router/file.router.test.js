const path = require('path')
const express = require('express')
const request = require('supertest')

// Resolve actual module paths exactly as used by the router,
// so the mocks match what file.js requires.
const routerPath = require.resolve(path.join(__dirname, '..', '..', 'routers', 'file'))

// Create jest.fn handlers so we can assert calls and control responses
const mockController = jest.fn()
mockController.initiateMultipartUpload = jest.fn((req, res) =>
  res.status(200).json({
    route: 'initiateMultipartUpload',
    filename: req.params.filename,
    contentType: req.query.contentType || null,
  })
)
mockController.getPresignedPartUrl = jest.fn((req, res) =>
  res.status(200).json({
    route: 'getPresignedPartUrl',
    key: req.query.key,
    uploadId: req.query.uploadId,
    partNumber: Number(req.query.partNumber),
  })
)
mockController.completeMultipartUpload = jest.fn((req, res) =>
  res.status(200).json({
    route: 'completeMultipartUpload',
    key: req.body.key,
    uploadId: req.body.uploadId,
    partsCount: Array.isArray(req.body.parts) ? req.body.parts.length : 0,
    parentId: req.body.parentId || null,
    fileName: req.body.fileName || null,
  })
)
mockController.abortMultipartUpload = jest.fn((req, res) =>
  res.status(200).json({
    route: 'abortMultipartUpload',
    key: req.body.key,
    uploadId: req.body.uploadId,
  })
)
mockController.getJobStatus = jest.fn((req, res) =>
  res.status(200).json({
    route: 'getJobStatus',
    jobId: req.params.jobId,
  })
)
mockController.getS3FileSize = jest.fn((req, res) =>
  res.status(200).json({
    route: 'getS3FileSize',
    key: req.params.key,
  })
)

// Mock controller and middleware modules before requiring the router
jest.mock(
  require.resolve('../../controller/file'),
  () => ({
    initiateMultipartUpload: mockController.initiateMultipartUpload,
    getPresignedPartUrl: mockController.getPresignedPartUrl,
    completeMultipartUpload: mockController.completeMultipartUpload,
    abortMultipartUpload: mockController.abortMultipartUpload,
    getJobStatus: mockController.getJobStatus,
    getS3FileSize: mockController.getS3FileSize,
  }),
  { virtual: false }
)

const mockMw = {
  checkToken: jest.fn((req, res, next) => {
    req.user = { _id: 'user123' }
    return next()
  }),
}
jest.mock(require.resolve('../../middleware/middleware'), () => ({ checkToken: mockMw.checkToken }), { virtual: false })

// Now require router (after mocks)
// eslint-disable-next-line import/no-dynamic-require, global-require
const router = require(routerPath)

// Helper to build app mounting this router
const buildApp = () => {
  const app = express()
  app.use(express.json())
  app.use('/api', router)
  return app
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('file router', () => {
  test('GET /pre-signed-url/:filename invokes initiateMultipartUpload with params/query', async () => {
    const app = buildApp()
    const res = await request(app)
      .get('/api/pre-signed-url/archive.zip')
      .query({ contentType: 'application/zip' })
      .expect(200)

    expect(mockMw.checkToken).toHaveBeenCalledTimes(1)
    expect(mockController.initiateMultipartUpload).toHaveBeenCalledTimes(1)
    const [reqArg] = mockController.initiateMultipartUpload.mock.calls[0]
    expect(reqArg.params.filename).toBe('archive.zip')
    expect(reqArg.query.contentType).toBe('application/zip')

    expect(res.body).toEqual({
      route: 'initiateMultipartUpload',
      filename: 'archive.zip',
      contentType: 'application/zip',
    })
  })

  test('GET /pre-signed-part-url calls getPresignedPartUrl with query', async () => {
    const app = buildApp()
    const query = { key: 'dossier/abc.zip', uploadId: 'u123', partNumber: '3' }
    const res = await request(app).get('/api/pre-signed-part-url').query(query).expect(200)

    expect(mockMw.checkToken).toHaveBeenCalledTimes(1)
    expect(mockController.getPresignedPartUrl).toHaveBeenCalledTimes(1)
    const [reqArg] = mockController.getPresignedPartUrl.mock.calls[0]
    expect(reqArg.query).toMatchObject({ key: 'dossier/abc.zip', uploadId: 'u123', partNumber: '3' })

    expect(res.body).toEqual({
      route: 'getPresignedPartUrl',
      key: 'dossier/abc.zip',
      uploadId: 'u123',
      partNumber: 3,
    })
  })

  test('POST /complete-multipart-upload calls completeMultipartUpload with body', async () => {
    const app = buildApp()
    const body = {
      key: 'dossier/abc.zip',
      uploadId: 'u999',
      parts: [
        { ETag: 'etag1', PartNumber: 1 },
        { ETag: 'etag2', PartNumber: 2 },
      ],
      parentId: 'parent123',
      fileName: 'abc.zip',
    }

    const res = await request(app).post('/api/complete-multipart-upload').send(body).expect(200)

    expect(mockMw.checkToken).toHaveBeenCalledTimes(1)
    expect(mockController.completeMultipartUpload).toHaveBeenCalledTimes(1)
    const [reqArg] = mockController.completeMultipartUpload.mock.calls[0]
    expect(reqArg.body).toMatchObject(body)

    expect(res.body).toEqual({
      route: 'completeMultipartUpload',
      key: 'dossier/abc.zip',
      uploadId: 'u999',
      partsCount: 2,
      parentId: 'parent123',
      fileName: 'abc.zip',
    })
  })

  test('POST /abort-multipart-upload calls abortMultipartUpload with body', async () => {
    const app = buildApp()
    const body = { key: 'dossier/abc.zip', uploadId: 'u999' }

    const res = await request(app).post('/api/abort-multipart-upload').send(body).expect(200)

    expect(mockMw.checkToken).toHaveBeenCalledTimes(1)
    expect(mockController.abortMultipartUpload).toHaveBeenCalledTimes(1)
    const [reqArg] = mockController.abortMultipartUpload.mock.calls[0]
    expect(reqArg.body).toMatchObject(body)

    expect(res.body).toEqual({
      route: 'abortMultipartUpload',
      key: 'dossier/abc.zip',
      uploadId: 'u999',
    })
  })

  test('GET /job-status/:jobId calls getJobStatus with params', async () => {
    const app = buildApp()
    const res = await request(app).get('/api/job-status/job123').expect(200)

    expect(mockMw.checkToken).toHaveBeenCalledTimes(1)
    expect(mockController.getJobStatus).toHaveBeenCalledTimes(1)
    const [reqArg] = mockController.getJobStatus.mock.calls[0]
    expect(reqArg.params.jobId).toBe('job123')

    expect(res.body).toEqual({
      route: 'getJobStatus',
      jobId: 'job123',
    })
  })

  test('middleware can block request (401) and controller is not called', async () => {
    // For this specific request, block in middleware
    mockMw.checkToken.mockImplementationOnce((req, res) => res.status(401).json({ code: 'INVALID_TOKEN' }))

    const app = buildApp()
    const res = await request(app).get('/api/pre-signed-url/blocked.zip').expect(401)

    expect(res.body).toEqual({ code: 'INVALID_TOKEN' })
    expect(mockController.initiateMultipartUpload).not.toHaveBeenCalled()
  })
})

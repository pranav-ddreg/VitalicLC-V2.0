const path = require('path')
const { createRequire } = require('module')
const express = require('express')
const request = require('supertest')

// Absolute path to the router file
const routerPath = path.join(__dirname, '..', '..', 'recyclebin', 'router')

// Create a require function that resolves exactly like the router file
const routerRequire = createRequire(routerPath)

// Resolve controller and middleware exactly as the router would
const controllerModuleId = routerRequire.resolve('./controller')
const middlewareModuleId = routerRequire.resolve('../middleware/middleware')

// Create controller mocks. We respond from mocks to keep tests isolated from controller logic
const mockCtrl = {
  getTrash: jest.fn((req, res) =>
    res.status(200).json({
      route: 'getTrash',
      isDownload: req.query.isDownload,
      filetype: req.query.filetype,
    })
  ),
  emptyTrash: jest.fn((req, res) => res.status(200).json({ route: 'emptyTrash' })),
  restoreTrash: jest.fn((req, res) => res.status(200).json({ route: 'restoreTrash', id: req.params.id })),
  deleteTrash: jest.fn((req, res) => res.status(200).json({ route: 'deleteTrash', id: req.params.id })),
  exportTrashPdf: jest.fn((req, res) => {
    req.query.isDownload = 'true'
    req.query.filetype = 'pdf'
    mockCtrl.getTrash(req, res)
  }),
  exportTrashExcel: jest.fn((req, res) => {
    req.query.isDownload = 'true'
    req.query.filetype = 'xlsx'
    mockCtrl.getTrash(req, res)
  }),
}

// Middleware mock (adjust shape if your real module exports differently)
const mockMw = {
  checkToken: jest.fn((req, res, next) => next()),
  checkUpdate: jest.fn((req, res, next) => next()),
}

// Apply mocks BEFORE importing the router
jest.doMock(controllerModuleId, () => mockCtrl, { virtual: false })
jest.doMock(middlewareModuleId, () => mockMw, { virtual: false })

// Import the router after mocks are in place
// eslint-disable-next-line global-require
const router = routerRequire(routerPath)

// Helper to mount this router in an app
const buildApp = () => {
  const app = express()
  app.use(express.json())
  app.use('/api/recyclebin', router)
  return app
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('recyclebin router', () => {
  test('GET /export/pdf sets isDownload and filetype, then delegates to getTrash', async () => {
    const app = buildApp()

    const res = await request(app).get('/api/recyclebin/export/pdf').expect(200)

    expect(mockMw.checkToken).toHaveBeenCalledTimes(1)
    // Depending on router implementation, either exportTrashPdf or getTrash will be invoked.
    // We assert getTrash was ultimately called (export handlers call it).
    expect(mockCtrl.getTrash).toHaveBeenCalledTimes(1)

    const [reqArg] = mockCtrl.getTrash.mock.calls[0]
    expect(reqArg.query.isDownload).toBe('true')
    expect(reqArg.query.filetype).toBe('pdf')
    expect(res.body).toEqual({ route: 'getTrash', isDownload: 'true', filetype: 'pdf' })
  })

  test('GET /export/excel sets isDownload and filetype, then delegates to getTrash', async () => {
    const app = buildApp()

    const res = await request(app).get('/api/recyclebin/export/excel').expect(200)

    expect(mockMw.checkToken).toHaveBeenCalledTimes(1)
    expect(mockCtrl.getTrash).toHaveBeenCalledTimes(1)

    const [reqArg] = mockCtrl.getTrash.mock.calls[0]
    expect(reqArg.query.isDownload).toBe('true')
    expect(reqArg.query.filetype).toBe('xlsx')
    expect(res.body).toEqual({ route: 'getTrash', isDownload: 'true', filetype: 'xlsx' })
  })

  test('PUT /restore/:id passes through both middlewares and calls restoreTrash', async () => {
    const app = buildApp()

    const res = await request(app).put('/api/recyclebin/restore/abc123').expect(200)

    expect(mockMw.checkToken).toHaveBeenCalledTimes(1)
    expect(mockMw.checkUpdate).toHaveBeenCalledTimes(1)
    expect(mockCtrl.restoreTrash).toHaveBeenCalledTimes(1)

    const [reqArg] = mockCtrl.restoreTrash.mock.calls[0]
    expect(reqArg.params.id).toBe('abc123')
    expect(res.body).toEqual({ route: 'restoreTrash', id: 'abc123' })
  })

  test('middleware can block request on export/pdf and controller is not called', async () => {
    // Force checkToken to block this request
    mockMw.checkToken.mockImplementationOnce((req, res) => res.status(401).json({ code: 'INVALID_TOKEN' }))

    const app = buildApp()

    const res = await request(app).get('/api/recyclebin/export/pdf').expect(401)

    expect(res.body).toEqual({ code: 'INVALID_TOKEN' })
    expect(mockCtrl.getTrash).not.toHaveBeenCalled()
  })

  test('checkUpdate can block restore and controller is not called', async () => {
    // Allow token, block on checkUpdate
    mockMw.checkToken.mockImplementationOnce((req, res, next) => next())
    mockMw.checkUpdate.mockImplementationOnce((req, res) => res.status(403).json({ code: 'UNAUTHORIZED' }))

    const app = buildApp()

    const res = await request(app).put('/api/recyclebin/restore/blocked').expect(403)

    expect(res.body).toEqual({ code: 'UNAUTHORIZED' })
    expect(mockCtrl.restoreTrash).not.toHaveBeenCalled()
  })
})

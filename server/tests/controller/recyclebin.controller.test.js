// Simple Jest test cases for server/controller/recyclebin.js

// Mocks for models and utilities used by the controller
jest.mock('../../model/product', () => ({
  updateOne: jest.fn(),
  find: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
}))

jest.mock('../../model/preregistration', () => ({
  aggregate: jest.fn(),
  find: jest.fn(),
  updateOne: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
}))

jest.mock('../../model/renewal', () => ({
  deleteMany: jest.fn(),
}))

jest.mock('../../model/variation', () => ({
  deleteMany: jest.fn(),
}))

jest.mock('../../utils/exportSelectedFieldsCSV', () => ({
  exportSelectedFieldsXLSX: jest.fn(),
}))

jest.mock('../../services/ejsToPdf', () => ({
  generatingEjsWithFieldToExportAndTitle: jest.fn(),
}))

const controller = require('../../controller/recyclebin')

const Product = require('../../model/product')
const PreRegistration = require('../../model/preregistration')
const Renewal = require('../../model/renewal')
const Variation = require('../../model/variation')
const { exportSelectedFieldsXLSX } = require('../../utils/exportSelectedFieldsCSV')

// Helper to create a minimal Express res mock
const createRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.setHeader = jest.fn().mockReturnValue(res)
  res.set = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  return res
}

describe('recyclebin controller - simple tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTrash', () => {
    test('should return fetched data with 200 when aggregation succeeds', async () => {
      const req = {
        query: {
          // simplest query, no pagination/download
        },
        user: {
          role: { slug: 'superadmin' }, // avoids company filter
        },
      }
      const res = createRes()

      const now = new Date()
      const aggregateResult = [
        {
          data: [
            {
              product: { title: 'Prod A' },
              company: { title: 'Comp X' },
              country: { title: 'Country Y' },
              type: 'preregistration',
              deletedBy: { user: { fullName: 'John Doe' }, time: now },
            },
          ],
          count: 1,
        },
      ]

      PreRegistration.aggregate.mockResolvedValue(aggregateResult)

      await controller.getTrash(req, res)

      expect(PreRegistration.aggregate).toHaveBeenCalledTimes(1)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        code: 'FETCHED',
        data: aggregateResult[0],
      })
    })

    test("should download XLSX when isDownload='true' and filetype='xlsx'", async () => {
      const req = {
        query: {
          isDownload: 'true',
          filetype: 'xlsx',
          selectedFields: JSON.stringify(['productName', 'deletedBy']),
        },
        user: { role: { slug: 'superadmin' } },
      }
      const res = createRes()

      const now = new Date()
      const aggregateResult = [
        {
          data: [
            {
              product: { title: 'Prod B' },
              company: { title: 'Comp Y' },
              country: { title: 'Country Z' },
              type: 'preregistration',
              deletedBy: { user: { fullName: 'Jane Smith' }, time: now },
            },
          ],
          count: 1,
        },
      ]

      const fakeBuffer = Buffer.from('xlsx-bytes')
      PreRegistration.aggregate.mockResolvedValue(aggregateResult)
      exportSelectedFieldsXLSX.mockResolvedValue(fakeBuffer)

      await controller.getTrash(req, res)

      // Verify transformation/export invoked
      expect(PreRegistration.aggregate).toHaveBeenCalledTimes(1)
      expect(exportSelectedFieldsXLSX).toHaveBeenCalledTimes(1)

      // Headers and response
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment: filename=RecycleBinData.xlsx')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(fakeBuffer)
    })
  })

  describe('restoreTrash', () => {
    test('should restore a product by id and return 200', async () => {
      const req = {
        query: { type: 'product' },
        params: { id: 'abc123' },
      }
      const res = createRes()

      Product.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 })

      await controller.restoreTrash(req, res)

      expect(Product.updateOne).toHaveBeenCalledWith(
        { _id: 'abc123' },
        { $set: { active: true }, $unset: { deletedBy: '' } }
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        code: 'RESTORED',
        message: 'Product restored !!',
      })
    })

    test('should respond 400 for invalid type', async () => {
      const req = {
        query: { type: 'unknown' },
        params: { id: 'abc123' },
      }
      const res = createRes()

      await controller.restoreTrash(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid type',
        message: 'Type is invalid !!',
      })
    })
  })

  describe('deleteTrash', () => {
    test('should cascade delete when type=product and return 200', async () => {
      const req = {
        query: { type: 'product' },
        params: { id: 'prod123' },
      }
      const res = createRes()

      // Preregistrations linked to product
      PreRegistration.find.mockResolvedValue([{ _id: 'pre1' }, { _id: 'pre2' }])
      Variation.deleteMany.mockResolvedValue({ acknowledged: true })
      Renewal.deleteMany.mockResolvedValue({ acknowledged: true })
      PreRegistration.deleteMany.mockResolvedValue({ acknowledged: true })
      Product.deleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 })

      await controller.deleteTrash(req, res)

      expect(PreRegistration.find).toHaveBeenCalledWith({ product: 'prod123' }, { _id: 1 })
      expect(Variation.deleteMany).toHaveBeenCalled()
      expect(Renewal.deleteMany).toHaveBeenCalled()
      expect(PreRegistration.deleteMany).toHaveBeenCalledWith({ product: 'prod123' })
      expect(Product.deleteOne).toHaveBeenCalledWith({ _id: 'prod123' })

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        code: 'DELETED',
        message: 'Product deleted !!',
      })
    })
  })
})

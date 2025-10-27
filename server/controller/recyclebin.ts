import Product from '../model/product'
import PreRegistration from '../model/preregistration'
import Renewal from '../model/renewal'
import Variation from '../model/variation'
import { Types } from 'mongoose'
import { exportSelectedFieldsXLSX } from '../utils/exportSelectedFieldsCSV'
import { generatingEjsWithFieldToExportAndTitle } from '../services/ejsToPdf'
import { Request, Response, RequestWithUser } from '../types/interfaces'

export default {
  getTrash: async (req: RequestWithUser, res: Response): Promise<Response> => {
    const { searchTitle, search, page, limit, sort, order, startDate, endDate, isDownload, filetype, selectedFields } =
      req.query
    const fieldsToExport = selectedFields ? JSON.parse(selectedFields as string) : []
    let title: string = searchTitle ? (searchTitle as string) : 'title'
    let sortTitle: string = sort ? (sort as string) : 'createdAt'
    const pageNum = page ? parseInt(page as string) : 1
    const limitNum = limit ? parseInt(limit as string) : 10

    const sortOrder = order === 'ascending' ? 1 : -1

    if (sort === 'product') sortTitle = 'product.title'
    else sortTitle = sort ? (sort as string) : 'createdAt'

    if (searchTitle === 'product') title = 'product.title'
    else if (searchTitle === 'deletedBy') title = 'deletedBy.user.fullName'
    else if (searchTitle === 'deletedOn') title = 'deletedBy.time'
    else title = searchTitle ? (searchTitle as string) : 'product.title'

    const getSearch = () => {
      if (startDate && endDate) {
        return {
          [title]: {
            $gte: new Date(startDate as string),
            $lt: new Date(endDate as string),
          },
        }
      } else if (startDate) {
        return { [title]: { $gte: new Date(startDate as string) } }
      } else if (endDate) {
        return { [title]: { $lt: new Date(endDate as string) } }
      } else if (['deletedOn'].includes(title)) {
        return { 'product.title': { $regex: search || '', $options: 'si' } }
      } else {
        return { [title]: { $regex: search || '', $options: 'si' } }
      }
    }

    const searchCondition = getSearch()

    let match: any
    if ((req.user!.role as any).slug === 'superadmin') match = { active: false }
    else
      match = {
        company: new Types.ObjectId((req?.user?.company as any)?._id),
        active: false,
      }

    try {
      const data = await PreRegistration.aggregate([
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'companies',
            localField: 'company',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  title: 1,
                },
              },
            ],
            as: 'company',
          },
        },
        {
          $lookup: {
            from: 'countries',
            localField: 'country',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  title: 1,
                },
              },
            ],
            as: 'country',
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  title: 1,
                },
              },
            ],
            as: 'product',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'deletedBy.userId',
            foreignField: '_id',
            pipeline: [
              {
                $lookup: {
                  from: 'roles',
                  localField: 'role',
                  foreignField: '_id',
                  pipeline: [
                    {
                      $project: {
                        title: 1,
                        permissions: 1,
                        slug: 1,
                      },
                    },
                  ],
                  as: 'role',
                },
              },
              {
                $lookup: {
                  from: 'companies',
                  localField: 'company',
                  foreignField: '_id',
                  pipeline: [
                    {
                      $project: {
                        title: 1,
                      },
                    },
                  ],
                  as: 'company',
                },
              },
              { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
              {
                $unwind: { path: '$company', preserveNullAndEmptyArrays: true },
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  fullName: { $concat: ['$firstName', ' ', '$lastName'] },
                  email: 1,
                  company: 1,
                  role: 1,
                },
              },
            ],
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$country', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            company: 1,
            country: 1,
            product: 1,
            type: 'preregistration',
            deletedBy: { user: '$user', time: '$deletedBy.time' },
          },
        },
        {
          $unionWith: {
            coll: 'products',
            pipeline: [
              { $match: match },
              {
                $lookup: {
                  from: 'companies',
                  localField: 'company',
                  foreignField: '_id',
                  pipeline: [
                    {
                      $project: {
                        title: 1,
                      },
                    },
                  ],
                  as: 'company',
                },
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'deletedBy.userId',
                  foreignField: '_id',
                  pipeline: [
                    {
                      $project: {
                        firstName: 1,
                        lastName: 1,
                        fullName: { $concat: ['$firstName', ' ', '$lastName'] },
                        email: 1,
                      },
                    },
                  ],
                  as: 'user',
                },
              },
              { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
              {
                $unwind: { path: '$company', preserveNullAndEmptyArrays: true },
              },
              {
                $project: {
                  product: { title: '$title', _id: '$_id' },
                  company: 1,
                  type: 'product',
                  deletedBy: { user: '$user', time: '$deletedBy.time' },
                },
              },
            ],
          },
        },
        { $match: searchCondition },
        {
          $facet: {
            data: limit
              ? [{ $sort: { [sortTitle]: sortOrder } }, { $skip: (pageNum - 1) * limitNum }, { $limit: limitNum }]
              : [{ $sort: { [sortTitle]: sortOrder } }],
            count: [{ $count: 'totalCount' }],
          },
        },
        { $unwind: { path: '$count', preserveNullAndEmptyArrays: false } },
        { $set: { count: '$count.totalCount' } },
      ])

      if (isDownload === 'true') {
        // Flatten the complex nested data for export - include all available fields
        const flattenedData =
          data[0]?.data?.map((item: any) => {
            const flatItem = {
              product: item.product?.title || item.product || 'N/A',
              company: item.company?.title || 'N/A',
              country: item.country?.title || 'N/A',
              type: item.type || 'N/A',
              deletedBy: item.deletedBy?.user?.fullName || 'N/A',
              deletedOn: item.deletedBy?.time ? new Date(item.deletedBy.time) : 'N/A',
            }

            return flatItem
          }) || []

        // Field mapping for frontend selectedFields to data field names
        const fieldMappings: { [key: string]: string } = {
          productName: 'product',
          deletedBy: 'deletedBy',
          deletedOn: 'deletedOn',
        }

        // Map frontend selectedFields to data field names, plus all core fields
        const mappedSelectedFields = fieldsToExport.map((field: string) => fieldMappings[field] || field)

        // Use deduplified fields based on flattened data structure
        const allFields = Object.keys(flattenedData[0] || {})
        const exportFields = [...new Set([...allFields, ...mappedSelectedFields])]

        if (filetype === 'xlsx') {
          const xlsxBuffer = await exportSelectedFieldsXLSX(flattenedData, exportFields)
          res.setHeader('Content-Type', 'application/vnd/openxmlformats-officedocument.spreadsheetml.sheet')
          res.setHeader('Content-Disposition', 'attachment: filename=RecycleBinData.xlsx')
          return res.status(200).send(xlsxBuffer)
        }

        if (filetype === 'pdf') {
          const { ok, fileBuffer, error } = await generatingEjsWithFieldToExportAndTitle(
            'exportSelectedFields',
            flattenedData,
            exportFields,
            'Recycle Bin',
            true
          )

          if (error) return res.status(400).json({ message: 'Something Broken!!' })

          res.set('Content-Type', 'application/pdf')
          return res.status(200).send(fileBuffer)
        }

        return res.status(400).json({ message: 'Please provide proper file type' })
      }
      return res.status(200).json({ code: 'FETCHED', data: data[0] || {} })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },

  emptyTrash: async (req: Request, res: Response): Promise<Response> => {
    try {
      const products = await Product.find({ active: false }, { _id: 1 })
      const preregistration = await PreRegistration.find(
        { $or: [{ product: { $in: products } }, { active: false }] },
        { _id: 1 }
      )
      await Variation.deleteMany({ preregistration: { $in: preregistration } })
      await Renewal.deleteMany({ preregistration: { $in: preregistration } })
      await PreRegistration.deleteMany({
        $or: [{ product: { $in: products } }, { active: false }],
      })
      await Product.deleteMany({ active: false })

      return res.status(200).json({ code: 'DELETED', message: 'Bin emptied !!' })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },

  restoreTrash: async (req: Request, res: Response): Promise<Response> => {
    const { type } = req.query
    let restored
    try {
      if (type === 'product') {
        restored = await Product.updateOne(
          { _id: req.params?.id },
          { $set: { active: true }, $unset: { deletedBy: '' } }
        )
      } else if (type === 'preregistration') {
        restored = await PreRegistration.updateOne(
          { _id: req.params?.id },
          { $set: { active: true }, $unset: { deletedBy: '' } }
        )
      } else {
        return res.status(400).json({ error: 'Invalid type', message: 'Type is invalid !!' })
      }

      return res.status(200).json({ code: 'RESTORED', message: 'Product restored !!' })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },

  deleteTrash: async (req: Request, res: Response): Promise<Response> => {
    const { type } = req.query
    let deleted
    try {
      if (type === 'product') {
        const preregistration = await PreRegistration.find({ product: req.params?.id }, { _id: 1 })
        await Variation.deleteMany({
          preregistration: { $in: preregistration },
        })
        await Renewal.deleteMany({ preregistration: { $in: preregistration } })
        await PreRegistration.deleteMany({ product: req.params.id })
        deleted = await Product.deleteOne({ _id: req.params?.id })
      } else if (type === 'preregistration') {
        deleted = await PreRegistration.deleteOne({ _id: req.params?.id })
      } else {
        return res.status(400).json({ error: 'Invalid type', message: 'Type is invalid !!' })
      }

      return res.status(200).json({ code: 'DELETED', message: 'Product deleted !!' })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },
}

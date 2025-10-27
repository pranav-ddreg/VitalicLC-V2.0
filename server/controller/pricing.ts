import Pricing from '../model/pricing'
import slugify from 'slugify'
import { generatingEjsWithFieldToExportAndTitle } from '../services/ejsToPdf'
import { exportSelectedFieldsXLSX } from '../utils/exportSelectedFieldsCSV'
import { Request, Response, RequestWithUser } from '../types/interfaces'

export default {
  addPricing: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { plan, price, duration } = req.body

      const exists = await Pricing.exists({
        price: price,
        duration: duration,
        slug: slugify(plan, { lower: true }),
      })

      if (exists) return res.status(409).json({ code: 'DUPLICATE', message: 'Pricing Plan already exists.' })

      const priceQuery = {
        plan: plan,
        slug: slugify(plan, { lower: true }),
        price: price,
        duration: duration,
      }

      const pricing = new Pricing(priceQuery)
      const result = await pricing.save()

      return res.status(200).json({
        code: 'CREATED',
        data: result,
        message: 'Pricing plan created successfully!!',
      })
    } catch (error) {
      console.log('ERROR:', 'Something Broken!!')
      return res.status(500).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },

  viewPricing: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { searchTitle, search, page, limit, sort, order, isDownload, filetype, listLess, selectedFields } =
        req.query
      const fieldsToExport = selectedFields ? JSON.parse(selectedFields as string) : []
      let effectiveListLess = isDownload === 'true' ? 'false' : listLess // For exports, always use full projection
      let title: string = searchTitle ? (searchTitle as string) : 'plan'
      let sortTitle: string = sort ? (sort as string) : 'createdAt'
      const sortOrder = order === 'ascending' ? 1 : -1
      const pageNum = page ? parseInt(page as string) : 1
      const limitNum = limit ? parseInt(limit as string) : 10

      const priceData = Pricing.aggregate([
        {
          $addFields: {
            price: { $toString: '$price' },
            duration: { $toString: '$duration' },
          },
        },

        {
          $match: {
            [title]: { $regex: search || '', $options: 'si' },
          },
        },
        {
          $project:
            effectiveListLess === 'true'
              ? { plan: 1, createdAt: 1 }
              : {
                  plan: 1,
                  slug: 1,
                  price: { $toInt: '$price' },
                  duration: { $toInt: '$duration' },
                  createdAt: 1,
                },
        },
        {
          $facet: {
            data:
              isDownload === 'true'
                ? [{ $sort: { [sortTitle]: sortOrder } }]
                : limitNum
                  ? [{ $sort: { [sortTitle]: sortOrder } }, { $skip: (pageNum - 1) * limitNum }, { $limit: limitNum }]
                  : [{ $sort: { [sortTitle]: sortOrder } }],
            count: [{ $count: 'totalCount' }],
          },
        },
        {
          $unwind: {
            path: '$count',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $set: {
            count: '$count.totalCount',
          },
        },
      ])

      priceData.exec(async (error, result) => {
        if (result) {
          if (result.length === 0) return res.status(200).json({ code: 'FETCHED', data: {} })
          if (isDownload === 'true') {
            if (filetype === 'xlsx') {
              const xlsxBuffer = await exportSelectedFieldsXLSX(result[0]?.data, fieldsToExport)
              res.setHeader('Content-Type', 'application/vnd/openxmlformats-officedocument/spreadsheetml.sheet')
              res.setHeader('Content-Disposition', 'attachment: filename=PricingPlanData.xlsx')
              return res.status(200).send(xlsxBuffer)
            }

            if (filetype === 'pdf') {
              const { ok, fileBuffer, error } = await generatingEjsWithFieldToExportAndTitle(
                'exportSelectedFields',
                result[0]?.data,
                fieldsToExport,
                'Pricing Plan',
                true
              )

              if (error) return res.status(400).json({ message: 'Something Broken!!' })

              res.set('Content-Type', 'application/pdf')
              return res.status(200).send(fileBuffer)
            }

            return res.status(400).json({ message: 'Please provide proper file ' })
          }

          return res.status(200).json({ code: 'FETCHED', data: result[0] || {} })
        } else return res.status(400).json({ code: 'ERROROCCURED', message: error })
      })

      return res.status(200).end() // For consistency with async operations
    } catch (error) {
      console.log('ERROR: ' + error)
      return res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  updatePricing: async (req: Request, res: Response): Promise<Response> => {
    const id = req.params?.id
    const { plan, price, duration } = req.body

    const pricingPlanExists = await Pricing.findOne({ plan: plan, price: price, duration: duration }, { _id: 1 })

    if (pricingPlanExists?._id.toString() === id)
      return res.status(409).json({ message: 'Pricing plan already exists' })
    const priceQuery: any = {
      price: price,
      duration: duration,
    }
    if (plan) {
      priceQuery.plan = plan
      priceQuery.slug = slugify(plan, { lower: true })
    }

    const updatePrice = await Pricing.findOneAndUpdate({ _id: id }, priceQuery, { new: true })

    if (!updatePrice) return res.status(400).json({ message: 'Pricing plan not updated.' })

    return res.status(200).json({ message: 'Pricing plan updated successfully!!' })
  },

  deletePricing: async (req: Request, res: Response): Promise<Response> => {
    const id = req.params?.id

    const deletePricing = await Pricing.findOneAndDelete({ _id: id })

    if (!deletePricing) return res.status(400).json({ code: 'ERROROCCOURED', message: 'Pricing plan not deleted.' })

    return res.status(200).json({
      code: 'DELETED',
      message: 'Pricing plan deleted successfully!!',
    })
  },
}

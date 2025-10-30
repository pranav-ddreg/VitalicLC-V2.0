import Variation from '../model/variation'
import { emailSend } from '../services/email'
import { Types } from 'mongoose'
import { deleteFile, uploadFile } from '../services/uploadsFiles'
import { generatingEjsWithFieldToExportAndTitle } from '../services/ejsToPdf'
import { exportSelectedFieldsXLSX } from '../utils/exportSelectedFieldsCSV'
import NotificationService from '../services/notificationService'
import { Request, Response, RequestWithUser, ICompany } from '../types/interfaces'

export default {
  //-------------------------Add new variation API------------------------------//
  addVariation: async (req: RequestWithUser, res: Response): Promise<Response> => {
    const { preregistration, title, category, expApprovalDate, submissionDate, remark } = req.fields || {}

    if (!preregistration)
      return res.status(400).json({
        code: 'ERROROCCURED',
        message: 'Pre-registration id is required',
      })
    if (!title) return res.status(400).json({ code: 'ERROROCCURED', message: 'Title is required' })
    if (!category) return res.status(400).json({ code: 'ERROROCCURED', message: 'Category is required' })
    if (!expApprovalDate) return res.status(400).json({ code: 'ERROROCCURED', message: 'ExpApprovalDate is required' })
    if (!submissionDate) return res.status(400).json({ code: 'ERROROCCURED', message: 'SubmissionDate is required' })

    const posPdf = req?.files?.posPdf
    const posFolder = process.env.FOLDER + `/POS/${(req?.user?.company as any)?.title}`
    let posPath: any = {}

    const result = await Variation.exists({
      title: title,
      company: (req?.user?.company as any)?._id,
    })

    if (result) return res.status(409).json({ code: 'DUPLICATEDATA', message: 'Variation already exists!!' })

    if (posPdf) {
      const result = await uploadFile(posPdf as any, posFolder)
      if (result.error) return res.status(400).json({ message: result.error })
      posPath = result.fileData
    } else posPath = null

    const variationQuery = {
      ...(req.fields || {}),
      company: (req?.user?.company as any)?._id,
      posPdf: posPath,
    }

    const variation = new Variation(variationQuery)

    variation.save(async (error: any, result: any) => {
      if (error) return res.status(400).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })

      // Generate notification number if posPdf is uploaded during creation
      if (posPdf && result.posPdf && !result.notificationNumber) {
        try {
          const preRegistration = await require('../model/preregistration').default.findById(result.preregistration)
          const companyId = preRegistration.company
          const productId = preRegistration.product
          const countryId = preRegistration.country
          const notificationNumber = await NotificationService.generateNotificationNumber(
            companyId,
            productId,
            countryId
          )
          await Variation.findByIdAndUpdate(result._id, { notificationNumber })
          // Update preregistration with the same notification number
          await require('../model/preregistration').default.findByIdAndUpdate(result.preregistration, {
            notificationNumber,
          })
        } catch (genError) {
          console.error('Error generating notification number for variation:', genError)
        }
      }

      const variationData = await Variation.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(result?._id),
            company: new Types.ObjectId((req?.user?.company as any)?._id),
          },
        },
        {
          $lookup: {
            from: 'preRegistration',
            localField: 'preregistration',
            foreignField: '_id',
            pipeline: [
              { $match: { active: true } },
              {
                $lookup: {
                  from: 'products',
                  localField: 'product',
                  foreignField: '_id',
                  pipeline: [{ $match: { active: true } }, { $project: { title: 1 } }],
                  as: 'product',
                },
              },
              {
                $lookup: {
                  from: 'countries',
                  localField: 'country',
                  foreignField: '_id',
                  pipeline: [{ $project: { title: 1 } }],
                  as: 'country',
                },
              },
              {
                $unwind: {
                  path: '$product',
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $unwind: {
                  path: '$country',
                  preserveNullAndEmptyArrays: false,
                },
              },
            ],
            as: 'preregistration',
          },
        },
        {
          $unwind: {
            path: '$preregistration',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            title: 1,
            category: 1,
            expApprovalDate: 1,
            submissionDate: 1,
            product: '$preregistration.product',
            country: '$preregistration.country',
          },
        },
      ])

      const subject = `Variation Added for product ${variationData[0].product.title}`
      const data = `<p>Variation <b style="color:blue;">'${variationData[0].title}'</b> has been added for product
            <b style="color:blue;">'${variationData[0].product.title}'</b> in <b style="color:blue;">
            '${variationData[0].country.title}' .</b><p>
                            <p><b>Below are the details about new added variation:</b></p> <ul>
                            <p ><li>Product Name: <b style="color:blue;" >${variationData[0].product.title}</b></p></li>
                            <p ><li>Variation Name: <b style="color:blue;">${variationData[0].title}</b></p></li>
                            <p ><li>Variation Category: <b style="color:blue;">${variationData[0].category}</b></p></li>
                            <p ><li>Variation Submission Date: <b style="color:blue;">${variationData[0].submissionDate}</b></p></li>
                            <p ><li>Variation Expected Approval Date: <b style="color:blue;">${variationData[0].expApprovalDate}</b></p></li>
                            </ul>`

      emailSend(
        (req?.user?.company as ICompany)?.email || '',
        (req?.user?.company as ICompany)?.secondaryEmail || '',
        subject,
        data
      )

      return res.status(200).json({ code: 'CREATED', message: 'Variation created successfully!!' })
    })
    return res.status(200).json({ code: 'CREATED', message: 'Variation created successfully!!' })
  },

  //-------------------------Submit API of variation---------------------//
  submitVariation: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      if ((req.user!.role as any).slug == 'superadmin') {
        return res.status(400).json({
          code: 'ERROROCCURED',
          data: 'SUPER-ADMIN CAN NOT SUBMIT A VARIATION',
        })
      } else {
        const submitvariation = await Variation.updateOne(
          { _id: req.body.id, company: req.user?.company },
          { $set: { ...req.body } }
        )
        if (submitvariation) {
          return res.status(200).json({
            code: 'UPDATED',
            data: submitvariation,
          })
        } else {
          return res.status(200).json({
            code: 'NOT_UPDATED',
            data: 'Update failed',
          })
        }
      }
    } catch (error: any) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        data: error,
      })
    }
  },

  //--------------------Update API of variation-----------------------------//
  updateVariation: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const id = req.params?.id
      const posPdf = req?.files?.posPdf
      const approvalPdf = req?.files?.approvalPdf
      const posFolder = process.env.FOLDER + `/POS/${(req?.user?.company as any)?.title}`
      const approvalFolder = process.env.FOLDER + `/Approval/${(req?.user?.company as any)?.title}`
      const variationPdfExists = await Variation.findOne({ _id: id, status: true }, { posPdf: 1, approvalPdf: 1 })
      let posPath: any = {}
      let approvalPath: any = {}

      if (posPdf) {
        variationPdfExists?.posPdf?.key ? deleteFile(variationPdfExists?.posPdf) : null
        const result = await uploadFile(posPdf as any, posFolder)
        if (result.error) return res.status(400).json({ message: result.error })
        posPath = result.fileData
      } else posPath = variationPdfExists?.posPdf?.key ? variationPdfExists?.posPdf : null

      if (approvalPdf) {
        variationPdfExists?.approvalPdf?.key ? deleteFile(variationPdfExists?.approvalPdf) : null
        const result = await uploadFile(approvalPdf as any, approvalFolder)
        if (result.error) return res.status(400).json({ message: result.error })
        approvalPath = result.fileData
      } else approvalPath = variationPdfExists?.approvalPdf?.key ? variationPdfExists?.approvalPdf : null

      const updatedVariation = await Variation.findByIdAndUpdate(
        { _id: id, company: (req?.user?.company as any)?._id },
        {
          $set: {
            ...(req.fields || {}),
            approvalPdf: approvalPath,
            posPdf: posPath,
          },
        },
        { new: true }
      )
      if (!updatedVariation) return res.status(400).json({ code: 'NOT_UPDATED', message: 'Variation not updated' })

      // Generate notification number if posPdf is uploaded (new or changed) and no existing number
      if (posPdf && updatedVariation.posPdf && !updatedVariation.notificationNumber) {
        try {
          const preRegistration = await require('../model/preregistration').default.findById(
            updatedVariation.preregistration
          )
          const companyId = preRegistration.company
          const productId = preRegistration.product
          const countryId = preRegistration.country
          const notificationNumber = await NotificationService.generateNotificationNumber(
            companyId,
            productId,
            countryId
          )
          await Variation.findByIdAndUpdate(id, { notificationNumber })
          // Update preregistration with the same notification number
          await require('../model/preregistration').default.findByIdAndUpdate(updatedVariation.preregistration, {
            notificationNumber,
          })
        } catch (error) {
          console.error('Error generating notification number for variation:', error)
        }
      }

      const variationData = await Variation.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(updatedVariation?._id),
            company: new Types.ObjectId((req?.user?.company as any)?._id),
          },
        },
        {
          $lookup: {
            from: 'preRegistration',
            localField: 'preregistration',
            foreignField: '_id',
            pipeline: [
              { $match: { active: true } },
              {
                $lookup: {
                  from: 'products',
                  localField: 'product',
                  foreignField: '_id',
                  pipeline: [{ $match: { active: true } }, { $project: { title: 1 } }],
                  as: 'product',
                },
              },
              {
                $lookup: {
                  from: 'countries',
                  localField: 'country',
                  foreignField: '_id',
                  pipeline: [{ $project: { title: 1 } }],
                  as: 'country',
                },
              },
              {
                $unwind: {
                  path: '$product',
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $unwind: {
                  path: '$country',
                  preserveNullAndEmptyArrays: false,
                },
              },
            ],
            as: 'preregistration',
          },
        },
        {
          $unwind: {
            path: '$preregistration',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            title: 1,
            category: 1,
            expApprovalDate: 1,
            submissionDate: 1,
            approvalDate: 1,
            approval: 1,
            product: '$preregistration.product',
            country: '$preregistration.country',
          },
        },
      ])

      if (
        variationData.length > 0 &&
        (variationData[0]?.approval == 'rejected' || variationData[0]?.approval == 'received')
      ) {
        const subject = `Variation Updated for product ${variationData[0].product.title}`
        const data = `<p>Variation <b style="color:blue;">'${variationData[0].title}'</b> has been updated for product
                    <b style="color:blue;">'${variationData[0].product.title}'</b> in <b style="color:blue;">
                    '${variationData[0].country.title}' .</b><p>
                        <p><b>Below are the details about new updated variation:</b></p><ul>
                        <p ><li>Product Name: <b style="color:blue;" >${variationData[0].product.title}</b></p></li>
                        <p ><li>Variation Name: <b style="color:blue;">${variationData[0].title}</b></p></li>
                        <p ><li>Variation Category: <b style="color:blue;">${variationData[0].category}</b></p></li>
                        <p ><li>Variation Submission Date: <b style="color:blue;">${variationData[0].submissionDate}</b></p></li>
                        <p ><li>Variation Approval status: <b style="color:blue;">${variationData[0].approval}</b></p></li>
                        <p ><li>Variation Expected Approval Date: <b style="color:blue;">${variationData[0].expApprovalDate}</b></p></li>
                        <p ><li>Variation Approval Date: <b style="color:blue;">${variationData[0].approvalDate}</b></p></li>
                        </ul>`

        emailSend(
          (req?.user?.company as ICompany)?.email || '',
          (req?.user?.company as ICompany)?.secondaryEmail || '',
          subject,
          data
        )
      }

      return res.status(200).json({ code: 'UPDATED', message: 'Variation has been updated !!' })
    } catch (error) {
      return res.status(400).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },

  //------------------------Delete API of variation-------------------------//
  deleteVariation: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const id = req.params?.id

      // Find the variation to check if it belongs to the user's company
      const variationToDelete = await Variation.findOne({
        _id: id,
        company: (req?.user?.company as any)?._id,
      })

      if (!variationToDelete) {
        return res.status(400).json({ code: 'NOT DELETED', message: 'Variation not found' })
      }

      const deletedVariation = await Variation.findByIdAndDelete(id)

      if (deletedVariation) return res.status(200).json({ code: 'DELETED', message: 'Variation has been deleted !!' })
      else return res.status(400).json({ code: 'NOT DELETED', message: 'Variation not deleted' })
    } catch (error) {
      return res.status(400).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },

  //-----------------------------GET all variation data API---------------------------------//
  getallVariation: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const {
        searchTitle,
        search,
        page,
        limit,
        sort,
        order,
        isDownload,
        filetype,
        selectedFields,
        startDate,
        endDate,
      } = req.query
      const fieldsToExport = selectedFields ? JSON.parse(selectedFields as string) : []
      let match: any = { $match: {} }
      let title = 'title'
      let sortTitle: string = sort ? (sort as string) : 'createdAt'
      const pageNum = page ? parseInt(page as string) : 1
      const limitNum = limit ? parseInt(limit as string) : 10

      const sortOrder = order === 'ascending' ? 1 : -1

      if (sort === 'product') sortTitle = 'product.title'
      else if (sort === 'country') sortTitle = 'country.title'
      else sortTitle = sort ? (sort as string) : 'createdAt'

      if (searchTitle === 'product') title = 'product.title'
      else if (searchTitle === 'country') title = 'country.title'
      else title = searchTitle ? (searchTitle as string) : 'title'

      if ((req.user!.role as any).slug == 'superadmin') match = { $match: { status: true } }
      else {
        match = {
          $match: {
            company: new Types.ObjectId((req?.user?.company as any)?._id),
            status: true,
          },
        }
      }

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
        } else if (['approvalDate'].includes(title)) {
          return { 'product.title': { $regex: search || '', $options: 'si' } }
        } else {
          return { [title]: { $regex: search || '', $options: 'si' } }
        }
      }

      const searchCondition = getSearch()

      const result = await Variation.aggregate([
        match,
        {
          $lookup: {
            from: 'preRegistration',
            localField: 'preregistration',
            foreignField: '_id',
            pipeline: [
              { $match: { active: true } },
              {
                $lookup: {
                  from: 'products',
                  localField: 'product',
                  foreignField: '_id',
                  pipeline: [{ $match: { active: true } }, { $project: { title: 1 } }],
                  as: 'product',
                },
              },
              {
                $lookup: {
                  from: 'countries',
                  localField: 'country',
                  foreignField: '_id',
                  pipeline: [{ $project: { title: 1 } }],
                  as: 'country',
                },
              },
              {
                $unwind: {
                  path: '$product',
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $unwind: {
                  path: '$country',
                  preserveNullAndEmptyArrays: false,
                },
              },
            ],
            as: 'preregistration',
          },
        },
        {
          $unwind: {
            path: '$preregistration',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            apiName: '$preregistration.apiName',
            localPartner: '$preregistration.localPartner',
            product: '$preregistration.product',
            country: '$preregistration.country',
            title: 1,
            category: 1,
            approval: 1,
            POS: 1,
            approvalDate: 1,
            createdAt: 1,
            notificationNumber: 1,
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

      if (result && Array.isArray(result) && result.length > 0) {
        if (isDownload === 'true') {
          if (filetype === 'xlsx') {
            const xlsxBuffer = exportSelectedFieldsXLSX(result[0]?.data || [], fieldsToExport)
            res.setHeader('Content-Type', 'application/vnd/openxmlformats-officedocument.spreadsheetml.sheet')
            res.setHeader('Content-Disposition', 'attachment: filename=VariationData.xlsx')
            return res.status(200).send(xlsxBuffer)
          }

          if (filetype === 'pdf') {
            const { ok, fileBuffer, error } = await generatingEjsWithFieldToExportAndTitle(
              'exportSelectedFields',
              result[0]?.data || [],
              fieldsToExport,
              'Variation',
              true
            )

            if (error) return res.status(400).json({ message: 'Something Broken!!' })

            res.set('Content-Type', 'application/pdf')
            return res.status(200).send(fileBuffer)
          }

          return res.status(400).json({ message: 'Please provide proper file ' })
        }

        return res.status(200).json({ code: 'FETCHED', data: result[0] || {} })
      } else {
        return res.status(200).json({ code: 'FETCHED', data: {} })
      }
    } catch (error) {
      console.log('Error in getallVariation API: ' + error)
      return res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  //-----------------------------GET all variation data API by product Id---------------------------------//
  getVariationByProductId: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { searchTitle, search, page, limit, sort, order, isDownload, filetype, selectedFields } = req.query
      const fieldsToExport = selectedFields ? JSON.parse(selectedFields as string) : []
      const id = req.params?.productId
      let match: any = { $match: {} }
      let title = 'title'
      let sortTitle: string = sort ? (sort as string) : 'createdAt'
      const pageNum = page ? parseInt(page as string) : 1
      const limitNum = limit ? parseInt(limit as string) : 10

      const sortOrder = order === 'ascending' ? 1 : -1

      if (sort === 'product') sortTitle = 'product.title'
      else if (sort === 'country') sortTitle = 'country.title'
      else sortTitle = sort ? (sort as string) : 'createdAt'

      if (searchTitle === 'product') title = 'product.title'
      else if (searchTitle === 'country') title = 'country.title'
      else title = searchTitle ? (searchTitle as string) : 'title'

      if ((req.user!.role as any).slug == 'superadmin')
        match = {
          $match: { preregistration: new Types.ObjectId(id), status: true },
        }
      else {
        match = {
          $match: {
            preregistration: new Types.ObjectId(id),
            company: new Types.ObjectId((req?.user?.company as any)?._id),
            status: true,
          },
        }
      }

      const result = await Variation.aggregate([
        match,
        {
          $lookup: {
            from: 'preRegistration',
            localField: 'preregistration',
            foreignField: '_id',
            pipeline: [
              { $match: { active: true } },
              {
                $lookup: {
                  from: 'products',
                  localField: 'product',
                  foreignField: '_id',
                  pipeline: [{ $match: { active: true } }, { $project: { title: 1 } }],
                  as: 'product',
                },
              },
              {
                $lookup: {
                  from: 'countries',
                  localField: 'country',
                  foreignField: '_id',
                  pipeline: [{ $project: { title: 1 } }],
                  as: 'country',
                },
              },
              {
                $unwind: {
                  path: '$product',
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $unwind: {
                  path: '$country',
                  preserveNullAndEmptyArrays: false,
                },
              },
            ],
            as: 'preregistration',
          },
        },
        {
          $unwind: {
            path: '$preregistration',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            stage: 1,
            product: '$preregistration.product',
            country: '$preregistration.country',
            title: 1,
            category: 1,
            expApprovalDate: 1,
            submissionDate: 1,
            remark: 1,
            POS: 1,
            approvalPdf: 1,
            posPdf: 1,
            approvalDate: 1,
            approval: 1,
            createdAt: 1,
            notificationNumber: 1,
          },
        },
        { $match: { [title]: { $regex: search || '', $options: 'si' } } },
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

      if (result && Array.isArray(result) && result.length > 0) {
        if (isDownload === 'true') {
          if (filetype === 'xlsx') {
            const xlsxBuffer = exportSelectedFieldsXLSX(result[0]?.data || [], fieldsToExport)
            res.setHeader('Content-Type', 'application/vnd/openxmlformats-officedocument.spreadsheetml.sheet')
            res.setHeader('Content-Disposition', 'attachment: filename=VariationData.xlsx')
            return res.status(200).send(xlsxBuffer)
          }

          if (filetype === 'pdf') {
            const { ok, fileBuffer, error } = await generatingEjsWithFieldToExportAndTitle(
              'exportSelectedFields',
              result[0]?.data || [],
              fieldsToExport,
              'Variation',
              true
            )
            if (error) return res.status(400).json({ message: 'Something Broken!!' })

            res.set('Content-Type', 'application/pdf')
            return res.status(200).send(fileBuffer)
          }

          return res.status(400).json({ message: 'Please provide proper file ' })
        }

        return res.status(200).json({ code: 'FETCHED', data: result[0] || {} })
      } else {
        return res.status(200).json({ code: 'FETCHED', data: {} })
      }
    } catch (error) {
      console.log('Error: ' + error)
      return res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  //---------------------------Calculate Variation stats API-------------------------------//
  calculate: async (req: RequestWithUser, res: Response): Promise<Response> => {
    let data: any
    if ((req.user!.role as any).slug == 'superadmin') {
      data = Variation.find({ status: true })
    } else {
      data = Variation.find({
        company: (req?.user?.company as any)?._id,
        status: true,
      })
    }
    data.exec((err: any, variation: any) => {
      if (variation) {
        let pending = 0
        let approved = 0
        let rejected = 0
        for (let i = 0; i < variation.length; i++) {
          if (variation[i].approval == 'not-received') pending++
          else if (variation[i].approval == 'received') approved++
          else if (variation[i].approval == 'rejected') rejected++
        }
        return res.status(200).json({
          code: 'FETCHED',
          data: {
            all: variation.length,
            pending: pending,
            approved: approved,
            rejected: rejected,
          },
        })
      } else {
        return res.status(400).json({
          code: 'ERROROCCURED',
          data: err,
        })
      }
    })
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Unexpected end of function' })
  },
}

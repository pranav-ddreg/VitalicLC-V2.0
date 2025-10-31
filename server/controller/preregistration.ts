import PreRegistration from '../model/preregistration'
import Product from '../model/product'
import Renewal from '../model/renewal'
import Country from '../model/country'
import { emailSend } from '../services/email'
import { Types } from 'mongoose'
import { deleteFile, uploadFile } from '../services/uploadsFiles'
import { generatingEjsWithFieldToExportAndTitle, generatingEjsToFile } from '../services/ejsToPdf'
import { exportSelectedFieldsXLSX } from '../utils/exportSelectedFieldsCSV'
import NotificationService from '../services/notificationService'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import s3 from '../config/s3client'
import fs from 'fs'
import path from 'path'
import { Request, Response, RequestWithUser } from '../types/interfaces'

export default {
  //-------------------Update the Pre-registration data-----------------------------//
  updatePreRegistration: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const slug = (req.user!.role as any).slug
      if (slug == 'superadmin')
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'SUPER ADMIN CAN NOT UPDATE ANY DATA !!',
        })
      const id = req.params?.id

      const api = req?.fields?.api ? JSON.parse(req?.fields?.api as string) : []
      const localPartner = req?.fields?.localPartner ? JSON.parse(req?.fields?.localPartner as string) : []

      const { stage } = req.fields || {}

      let batchFormula = req?.files?.batchFormula
      // Normalize company title whether company is stored as string or object
      const companyTitle =
        typeof req.user?.company === 'string'
          ? (req.user?.company as any)?.title
          : (req.user?.company as any)?.title || ''

      let batchFormulaPath = process.env.FOLDER + `/BatchFormula/${companyTitle}`

      let registeredArtworkPIL = req?.files?.registeredArtworkPIL
      let registeredArtworkPILPath = process.env.FOLDER + `/RegisteredArtworkPIL/${companyTitle}`

      const pdfFile = req?.files?.rc
      const apiFolder = process.env.FOLDER + `/RegistrationCertificate/${companyTitle}`
      let pdfPath: any = {}

      console.log('apiFolder: ', apiFolder)

      const pdfExists = await PreRegistration.findOne(
        { _id: id },
        {
          rc: 1,
          batchFormula: 1,
          registeredArtworkPIL: 1,
          registrationNo: 1,
          notificationNumber: 1,
        }
      )

      if (pdfFile) {
        pdfExists?.rc?.key ? deleteFile(pdfExists?.rc) : null
        const result = await uploadFile(pdfFile as any, apiFolder)
        if (result.error) return res.status(400).json({ message: result.error })
        pdfPath = result.fileData
      } else pdfPath = pdfExists?.rc ? pdfExists.rc : null

      if (batchFormula) {
        pdfExists?.batchFormula?.key ? deleteFile(pdfExists?.batchFormula) : null
        const result = await uploadFile(batchFormula as any, batchFormulaPath)
        if (result.error) return res.status(400).json({ message: result.error })
        batchFormula = result.fileData
      } else batchFormula = pdfExists?.batchFormula ? pdfExists.batchFormula : null

      if (registeredArtworkPIL) {
        pdfExists?.registeredArtworkPIL?.key ? deleteFile(pdfExists?.registeredArtworkPIL) : null
        const result = await uploadFile(registeredArtworkPIL as any, registeredArtworkPILPath)
        if (result.error) return res.status(400).json({ message: result.error })
        registeredArtworkPIL = result.fileData
      } else registeredArtworkPIL = pdfExists?.registeredArtworkPIL ? pdfExists.registeredArtworkPIL : null

      const updatedPreRegistration = await PreRegistration.findOneAndUpdate(
        {
          _id: id,
          company: new Types.ObjectId((req?.user?.company as any)?._id),
        },
        {
          ...(req.fields || {}),
          api,
          localPartner,
          rc: pdfPath,
          batchFormula,
          registeredArtworkPIL,
        },
        { new: true }
      ).populate('country')

      if (stage == 'under-registration' || stage == 'under-process') {
        return res.status(200).json({
          code: 'UPDATED',
          message: 'Pre registration Updated successfully!!',
        })
      }

      if (updatedPreRegistration?.registrationNo) {
        // Generate notification number if registrationNo is being updated AND no notification exists
        if (
          pdfExists &&
          !pdfExists?.notificationNumber &&
          req.fields?.registrationNo &&
          pdfExists.registrationNo !== req.fields.registrationNo
        ) {
          try {
            const companyId = (req?.user?.company as any)?._id
            const productId = updatedPreRegistration?.product
            const countryId = updatedPreRegistration?.country
            const notificationNumber = await NotificationService.generateNotificationNumber(
              companyId?.toString(),
              productId?.toString(),
              countryId?.toString()
            )
            await PreRegistration.findByIdAndUpdate(id, { notificationNumber })
            updatedPreRegistration.notificationNumber = notificationNumber // Update local copy
          } catch (genError) {
            console.error('Error generating notification number for preregistration:', genError)
          }
        }

        const updatedProduct = await Product.findOne({
          _id: updatedPreRegistration?.product,
        })
        if (updatedProduct) {
          let subject = `${updatedProduct?.title} Registration Updates`
          let emailData = ` <h4>Congratulations !!</h4>
             <p>Your Product '<b style="color:blue;">${updatedProduct?.title}</b>' has been registered in
             '<b style="color:blue;">${(updatedPreRegistration?.country as any)?.title}</b>'.</p>
             <p>Registration Number : <b style="color:blue;">${updatedPreRegistration?.registrationNo}</b></p>
             <p>Registration Date : <b style="color:blue;">${updatedPreRegistration?.registrationDate}</b></p>`

          const companyObj = req?.user?.company as any
          emailSend(companyObj?.email as string, companyObj?.secondaryEmail, subject, emailData)
          const checkRenewal = await Renewal.exists({
            preregistration: new Types.ObjectId(id),
            company: companyObj?._id,
          })
          if (!checkRenewal) {
            await Renewal.create({
              preregistration: id,
              renewDate: req.fields?.renewalDate,
              expInitiateDate: req.fields?.expInitiateDate,
              expSubmitDate: req.fields?.expSubmitDate,
              company: (req?.user?.company as any)?._id,
            })
          }
          return res.status(200).json({
            code: 'UPDATED',
            message: 'Pre Registration updated successfully!!',
          })
        }
      }

      return res.status(400).json({
        code: 'ERROROCCURED',
        message: 'Pre Registration not updated.',
      })
    } catch (error) {
      return res.status(500).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },

  //------------------Get All data from Pre Registration--------------------//
  generatePresignedUrl: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { id, fileType } = req.params
      // TODO: Implement AWS S3 presigned URL generation
      return res.status(200).json({
        code: 'NOT_IMPLEMENTED',
        message: 'generatePresignedUrl method not implemented yet',
      })
    } catch (error: any) {
      return res.status(500).json({
        code: 'ERROROCCURED',
        message: error.message,
      })
    }
  },

  getallPreRegistration: async (req: RequestWithUser, res: Response): Promise<void> => {
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
      let title = 'product.title'
      let match: any = { $match: {} }
      let sortTitle = 'createdAt'
      const sortOrder = order === 'ascending' ? 1 : -1
      const pageNum = page ? parseInt(page as string) : 1
      const limitNum = limit ? parseInt(limit as string) : 10

      if (sort === 'product') sortTitle = 'product.title'
      else if (sort === 'country') sortTitle = 'country.title'
      else sortTitle = sort ? (sort as string) : 'createdAt'

      if (searchTitle === 'product') title = 'product.title'
      else if (searchTitle === 'country') title = 'country.title'
      else title = searchTitle ? (searchTitle as string) : 'product.title'

      const roleSlug = (req?.user?.role as any)?.slug
      if (roleSlug == 'superadmin') match = { $match: { active: true } }
      else {
        match = {
          $match: {
            company: new Types.ObjectId((req?.user?.company as any)?._id),
            active: true,
          },
        }
      }

      const getSearch = (): any => {
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
        } else if (['submissionDate', 'registrationDate', 'renewalDate'].includes(title)) {
          return { 'product.title': { $regex: search || '', $options: 'si' } }
        } else {
          return { [title]: { $regex: search || '', $options: 'si' } }
        }
      }

      const searchCondition = getSearch()

      const data = PreRegistration.aggregate([
        match,
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            pipeline: [
              {
                $match: {
                  active: true,
                },
              },
              {
                $project: {
                  title: 1,
                  slug: 1,
                },
              },
            ],
            as: 'product',
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
                  slug: 1,
                },
              },
            ],
            as: 'country',
          },
        },
        { $unwind: { path: '$country', preserveNullAndEmptyArrays: false } },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
        {
          $project: {
            stage: 1,
            product: 1,
            country: 1,
            renewalDate: 1,
            apiName: 1,
            localPartner: 1,
            api: { apiSourceName: 1 },
            registrationDate: 1,
            registrationNo: 1,
            notificationNumber: 1,
            submissionDate: 1,
            dossier: 1,
            rc: 1,
            sample: 1,
            expApprovalDate: 1,
            expLaunchDate: 1,
            approvalDate: 1,
            remark: 1,
            createdAt: 1,
          },
        },
        { $match: searchCondition },
        {
          $facet: {
            data:
              isDownload === 'true'
                ? [{ $sort: { [sortTitle]: sortOrder } }]
                : limit
                  ? [{ $sort: { [sortTitle]: sortOrder } }, { $skip: (pageNum - 1) * limitNum }, { $limit: limitNum }]
                  : [{ $sort: { [sortTitle]: sortOrder } }],
            count: [{ $count: 'totalCount' }],
          },
        },
        { $unwind: { path: '$count', preserveNullAndEmptyArrays: false } },
        { $set: { count: '$count.totalCount' } },
      ])

      data.exec(async (error: any, result: any) => {
        if (result) {
          if (result.length === 0) res.status(200).json({ code: 'FETCHED', data: {} })
          else if (isDownload === 'true') {
            if (filetype === 'xlsx') {
              const xlsxBuffer = await exportSelectedFieldsXLSX(result[0]?.data, fieldsToExport)
              res.setHeader('Content-Type', 'application/vnd/openxmlformats-officedocument.spreadsheetml.sheet')
              res.setHeader('Content-Disposition', 'attachment: filename=PreregistrationData.xlsx')
              res.status(200).send(xlsxBuffer)
            } else if (filetype === 'pdf') {
              const { ok, fileBuffer, error } = await generatingEjsWithFieldToExportAndTitle(
                'exportSelectedFields',
                result[0]?.data,
                fieldsToExport,
                'Registration',
                true
              )

              if (error) res.status(400).json({ message: 'Something Broken!!' })
              else {
                res.set('Content-Type', 'application/pdf')
                res.status(200).send(fileBuffer)
              }
            } else {
              res.status(400).json({ message: 'Please provide proper file ' })
            }
          } else {
            res.status(200).json({ code: 'FETCHED', data: result[0] || {} })
          }
        } else res.status(400).json({ code: 'ERROROCCURED', message: error })
      })
    } catch (error) {
      console.log('Error: ' + error)
      res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  getSinglePreRegistration: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const id = req.params?.id

      let match: any
      if ((req.user!.role as any).slug == 'superadmin')
        match = { $match: { _id: new Types.ObjectId(id), active: true } }
      else {
        match = {
          $match: {
            _id: new Types.ObjectId(id),
            company: new Types.ObjectId((req?.user?.company as any)?._id),
            active: true,
          },
        }
      }

      const data = PreRegistration.aggregate([
        match,
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            pipeline: [{ $match: { active: true } }, { $project: { title: 1, slug: 1 } }],
            as: 'product',
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
                  slug: 1,
                  approvalDays: 1,
                  launchDays: 1,
                  IA: 1,
                  IB: 1,
                  minor: 1,
                  major: 1,
                  submitDays: 1,
                  initiateDays: 1,
                },
              },
            ],
            as: 'country',
          },
        },
        { $unwind: { path: '$country', preserveNullAndEmptyArrays: false } },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
        {
          $project: {
            deletedBy: 0,
            active: 0,
            company: 0,
            createdAt: 0,
            updatedAt: 0,
            __v: 0,
          },
        },
      ])

      data.exec(async (error: any, result: any) => {
        if (result) {
          return res.status(200).json({ code: 'FETCHED', data: result[0] || {} })
        } else {
          return res.status(400).json({ code: 'ERROROCCURED', message: error })
        }
      })

      return res.status(200).end() // For consistency with other async functions
    } catch (error) {
      console.log('Error: ' + error)
      return res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  addPreRegistration: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      if ((req.user!.role as any).slug == 'superadmin')
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'SUPER ADMIN CAN NOT UPDATE ANY DATA !!',
        })

      const { product, country } = req.body
      const company = (req?.user?.company as any)?._id

      const preRegistrationExists = await PreRegistration.exists({
        product: product,
        country: country,
      })

      if (preRegistrationExists)
        return res.status(409).json({
          code: 'DUPLICATE_REGISTRATION',
          message: 'Pre Registration already exists',
        })

      const PreRegistrationQuery = {
        ...req.body,
        company: company,
      }

      const createPreRegistration = await PreRegistration.create(PreRegistrationQuery)

      if (!createPreRegistration)
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'Pre registration not created',
        })

      return res.status(200).json({
        code: 'CREATED',
        message: ' Pre registration created successfully !!',
      })
    } catch (error) {
      console.log('ERROR: ' + 'Something Broken!!')
      return res.status(500).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },

  deletePreRegistration: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      if ((req.user!.role as any).slug == 'superadmin')
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'SUPER ADMIN CAN NOT DELETE ANY DATA !!',
        })

      const id = req.params?.id

      const deletePreRegistration = await PreRegistration.findOneAndUpdate(
        { _id: id, company: (req?.user?.company as any)?._id },
        {
          active: false,
          deletedBy: { userId: req?.user?._id, time: new Date() },
        },
        { new: true }
      )

      if (!deletePreRegistration) return res.status(400).json({ message: 'Pre registration not deleted.' })

      return res.status(200).json({
        code: 'DELETED',
        message: 'Pre registration has been deleted successfully!!',
      })
    } catch (error) {
      console.log('ERROR: ' + 'Something Broken!!')
      return res.status(500).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },

  getPreRegistrationByProductId: async (req: RequestWithUser, res: Response): Promise<Response> => {
    var data: any
    if (req.user && req.user.role && (req.user.role as any).slug == 'superadmin') {
      data = PreRegistration.findOne({
        product: req.params.productID,
        status: true,
      }).populate({
        path: 'product',
        populate: {
          path: 'country',
          model: 'Country',
        },
      })
    } else {
      data = PreRegistration.findOne({
        product: req.params.productID,
        company: req.user?.company,
        status: true,
      }).populate({
        path: 'product',
        populate: {
          path: 'country',
          model: 'Country',
        },
      })
    }
    data.exec(async (error: any, result: any) => {
      if (result) {
        return res.status(200).json({
          code: 'FETCHED',
          data: result,
        })
      } else {
        return res.status(400).json({
          code: 'ERROROCCURED',
          data: error,
        })
      }
    })
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Unexpected end of function' })
  },

  calculate: async (req: RequestWithUser, res: Response): Promise<Response> => {
    var data: any
    if (req.user && req.user.role && (req.user!.role as any).slug == 'superadmin') {
      data = PreRegistration.find({ status: true }).populate('product')
    } else {
      data = PreRegistration.find({
        company: req.user?.company,
        status: true,
      }).populate('product')
    }
    data.exec(async (err: any, Preregistration: any) => {
      if (Preregistration) {
        let registered = 0
        let underprocess = 0
        let underregister = 0
        for (let i = 0; i < Preregistration.length; i++) {
          if (Preregistration[i].stage == 'registered') registered++
          else if (Preregistration[i].stage == 'under-process') underprocess++
          else if (Preregistration[i].stage == 'under-registration') underregister++
        }
        return res.status(200).json({
          code: 'FETCHED',
          data: {
            Preregistration: Preregistration.length,
            registered: registered,
            underprocess: underprocess,
            underregister: underregister,
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

  expAvp: async (req: RequestWithUser, res: Response): Promise<Response> => {
    let matchObj: any = {}
    if (req.user && req.user.role && (req.user!.role as any).slug == 'superadmin') {
      matchObj['approvalDateyear'] = { $ne: [null] }
      matchObj['status'] = true
    } else {
      matchObj['approvalDateyear'] = { $ne: [null] }
      matchObj['status'] = true
      matchObj['status'] = true
      matchObj['company'] = (req?.user?.company as any)?._id
    }
    PreRegistration.aggregate([
      {
        $project: {
          year: { $substr: ['$approvalDate', 0, 4] },
          product: 1,
          expApprovalDate: 1,
          submissionDate: 1,
          dossier: 1,
          sample: 1,
          expLaunchDate: 1,
          localPartner: 1,
          remark: 1,
          approvalDate: 1,
          stage: 1,
          company: 1,
          status: 1,
        },
      },
      {
        $match: matchObj,
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'product.country',
          foreignField: '_id',
          as: 'country',
        },
      },
    ]).exec(async (err: any, Preregistration: any) => {
      if (err) {
        return res.status(200).json({
          code: 'ERROROCCURED',
          data: err,
        })
      } else {
        let expData: any[] = []
        for (var item of Preregistration) {
          if (item.stage == 'registered') {
            const date1 = new Date(item.submissionDate)
            const date2 = new Date(item.expApprovalDate)
            const diffTime = Math.abs(date2.getTime() - date1.getTime())
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
            const date3 = new Date(item.submissionDate)
            const date4 = new Date(item.approvalDate)
            const diff2Time = Math.abs(date4.getTime() - date3.getTime())
            const diff2Days = Math.round(diff2Time / (1000 * 60 * 60 * 24))
            expData.push({
              Country: item.country && item.country[0] && item.country[0] && item.country[0].title,
              ExpectedDays: diffDays,
              ActualDays: diff2Days,
              product: item && item.product && item.product[0] && item.product[0].title,
              expdates: item.expApprovalDate,
              actualdates: item && item.approvalDate,
            })
          }
        }
        return res.status(200).json({
          code: 'FETCHED',
          data: expData,
        })
      }
    })
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Unexpected end of function' })
  },

  getYear: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      let data: any
      if (req.user && req.user.role && (req.user!.role as any).slug == 'superadmin') {
        data = await PreRegistration.find({ status: true, approvalDate: { $ne: null } }, { _id: 0, approvalDate: 1 })
      } else {
        data = await PreRegistration.find(
          {
            company: req.user?.company,
            status: true,
            approvalDate: { $ne: null },
          },
          { _id: 0, approvalDate: 1 }
        )
      }
      const years =
        data &&
        data.map((item: any) => {
          return new Date(item.approvalDate).getFullYear()
        })

      let uniqueYears = [...new Set(years)].sort()
      return res.status(200).json({
        code: 'FETCHED',
        data: uniqueYears,
      })
    } catch (error) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        data: 'Something Broken!!',
      })
    }
  },

  exportSinglePreregistration: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { id } = req.params
      const preregistration = await PreRegistration.findById(id)
      if (!preregistration) return res.status(404).json({ message: 'Preregistration not found' })

      // Generate presigned URLs using AWS SDK v3 with proper client
      const generatePresigned = async (file: any) => {
        if (file && file.key) {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.key,
          })
          return await getSignedUrl(s3, command, { expiresIn: 86400 })
        }
        return null
      }

      const rcPresigned = await generatePresigned(preregistration.rc)
      const batchFormulaPresigned = await generatePresigned(preregistration.batchFormula)
      const registeredArtworkPILPresigned = await generatePresigned(preregistration.registeredArtworkPIL)

      // Generate direct S3 URIs
      const generateS3Uri = (file: any) => {
        if (file && file.key) {
          return `https://s3.ap-south-1.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${file.key}`
        }
        return null
      }

      const rcS3Uri = generateS3Uri(preregistration.rc)
      const batchFormulaS3Uri = generateS3Uri(preregistration.batchFormula)
      const registeredArtworkPILS3Uri = generateS3Uri(preregistration.registeredArtworkPIL)

      // Logo as base64 (using black logo from utils/media)
      const logoPath = path.join(__dirname, '../utils/media/logo-black.png')
      let logo = ''
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath)
        logo = `data:image/png;base64,${logoBuffer.toString('base64')}`
      }

      const data = preregistration.toObject()
      data.rcPresigned = rcPresigned
      data.batchFormulaPresigned = batchFormulaPresigned
      data.registeredArtworkPILPresigned = registeredArtworkPILPresigned
      data.rcS3Uri = rcS3Uri
      data.batchFormulaS3Uri = batchFormulaS3Uri
      data.registeredArtworkPILS3Uri = registeredArtworkPILS3Uri
      data.logo = logo

      const { ok, fileBuffer, error } = await generatingEjsToFile('singlePreregistration', data, [], '', false)

      if (error) return res.status(400).json({ message: error })

      res.set('Content-Type', 'application/pdf')
      res.set('Content-Disposition', 'attachment; filename=preregistration-details.pdf')
      return res.status(200).send(fileBuffer)
    } catch (error) {
      return res.status(500).json({ message: 'Error exporting PDF' })
    }
  },

  getCountryPreRegistration: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { searchTitle, search, page, limit, sort, order } = req.query
      let title = searchTitle ? (searchTitle as string) : 'country.title'
      let sortTitle = sort === 'title' ? 'country.title' : sort ? (sort as string) : 'createdAt'
      const sortOrder = order === 'ascending' ? 1 : -1
      const id = req.params?.productId
      let match: any = {}

      if ((req?.user?.role as any)?.slug == 'superadmin')
        match = { $match: { product: new Types.ObjectId(id), active: true } }
      else {
        match = {
          $match: {
            product: new Types.ObjectId(id),
            company: new Types.ObjectId((req?.user?.company as any)?._id),
            active: true,
          },
        }
      }

      const getCountry = await PreRegistration.aggregate([
        match,
        {
          $lookup: {
            from: 'countries',
            localField: 'country',
            foreignField: '_id',
            pipeline: [{ $project: { title: 1 } }],
            as: 'country',
          },
        },
        { $unwind: { path: '$country', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            product: 1,
            country: 1,
            registrationDate: 1,
            stage: 1,
            createdAt: 1,
          },
        },
        { $match: { [title]: { $regex: search || '', $options: 'si' } } },
        {
          $facet: {
            product: [
              { $group: { _id: '$product' } },
              {
                $lookup: {
                  from: 'products',
                  localField: '_id',
                  foreignField: '_id',
                  pipeline: [{ $project: { title: 1, slug: 1 } }],
                  as: 'product',
                },
              },
              {
                $unwind: {
                  path: '$product',
                  preserveNullAndEmptyArrays: false,
                },
              },
              { $project: { productData: '$product', _id: 0 } },
            ],
            data: limit
              ? [
                  {
                    $project: {
                      country: 1,
                      registrationDate: 1,
                      stage: 1,
                      createdAt: 1,
                    },
                  },
                  { $sort: { [sortTitle]: sortOrder } },
                  {
                    $skip: (parseInt(page as string) - 1) * parseInt(limit as string) || 0,
                  },
                  { $limit: parseInt(limit as string) || 10 },
                ]
              : [{ $sort: { [sortTitle]: sortOrder } }],
            count: [{ $count: 'totalCount' }],
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
        { $unwind: { path: '$count', preserveNullAndEmptyArrays: false } },
        { $set: { product: '$product.productData' } },
        { $set: { count: '$count.totalCount' } },
      ])

      return res.status(200).json({ code: 'FETCHED', data: getCountry[0] || {} })
    } catch (error) {
      console.log('ERROR: ' + error)
      return res.status(500).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },

  getProductPreRegistration: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { searchTitle, search, page, limit, sort, order } = req.query
      let title = searchTitle ? (searchTitle as string) : 'product.title'
      let sortTitle = sort === 'title' ? 'product.title' : sort ? (sort as string) : 'createdAt'
      const sortOrder = order === 'ascending' ? 1 : -1
      const id = req.params?.countryId
      let match: any = {}

      if ((req.user!.role as any).slug == 'superadmin')
        match = { $match: { country: new Types.ObjectId(id), active: true } }
      else {
        match = {
          $match: {
            country: new Types.ObjectId(id),
            company: new Types.ObjectId((req?.user?.company as any)?._id),
            active: true,
          },
        }
      }

      const getProduct = await PreRegistration.aggregate([
        match,
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            pipeline: [{ $match: { active: true } }, { $project: { title: 1 } }],
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
        {
          $project: {
            product: 1,
            country: 1,
            registrationDate: 1,
            stage: 1,
            createdAt: 1,
          },
        },
        { $match: { [title]: { $regex: search || '', $options: 'si' } } },
        {
          $facet: {
            country: [
              { $group: { _id: '$country' } },
              {
                $lookup: {
                  from: 'countries',
                  localField: '_id',
                  foreignField: '_id',
                  pipeline: [{ $project: { title: 1 } }],
                  as: 'country',
                },
              },
              {
                $unwind: {
                  path: '$country',
                  preserveNullAndEmptyArrays: false,
                },
              },
              { $project: { countryData: '$country', _id: 0 } },
            ],
            data: limit
              ? [
                  {
                    $project: {
                      product: 1,
                      registrationDate: 1,
                      stage: 1,
                      createdAt: 1,
                    },
                  },
                  { $sort: { [sortTitle]: sortOrder } },
                  {
                    $skip: (parseInt(page as string) - 1) * parseInt(limit as string) || 0,
                  },
                  { $limit: parseInt(limit as string) || 10 },
                ]
              : [{ $sort: { [sortTitle]: sortOrder } }],
            count: [{ $count: 'totalCount' }],
          },
        },
        { $unwind: { path: '$country', preserveNullAndEmptyArrays: false } },
        { $unwind: { path: '$count', preserveNullAndEmptyArrays: false } },
        { $set: { country: '$country.countryData' } },
        { $set: { count: '$count.totalCount' } },
      ])

      return res.status(200).json({ code: 'FETCHED', data: getProduct[0] || {} })
    } catch (error) {
      console.log('ERROR: ' + error)
      return res.status(500).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },
}

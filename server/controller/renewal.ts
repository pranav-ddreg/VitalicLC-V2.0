import Renewal from '../model/renewal'
import Country from '../model/country'
import { emailSend } from '../services/email'
import cron from 'node-cron'
import { Types } from 'mongoose'
import { deleteFile, uploadFile } from '../services/uploadsFiles'
import { generatingEjsWithFieldToExportAndTitle } from '../services/ejsToPdf'
import { exportSelectedFieldsXLSX } from '../utils/exportSelectedFieldsCSV'
import NotificationService from '../services/notificationService'
import { Response, RequestWithUser, ICompany } from '../types/interfaces'

//------------------Running cron-job fro sending email every 3rd month----------------------//
cron.schedule('0 0 1 */3 *', () => {
  cronJob()
})

//-------------------------Logic of sending Emails--------------------------------------//
function cronJob() {
  try {
    Renewal.aggregate([
      {
        $project: {
          product: 1,
          expRenewDate: 1,
          company: 1,
          country: 1,
        },
      },
      {
        $match: {
          renewDate: null,
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'countries',
          localField: 'product.country',
          foreignField: '_id',
          as: 'country',
        },
      },
      { $unwind: '$country' },
      {
        $lookup: {
          from: 'companies',
          localField: 'product.company',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
    ]).exec((error: any, result: any) => {
      if (result) {
        let mapData = result
          .map((data: any) => {
            var expRenewDate = new Date(data.expRenewDate)
            var present_date = new Date()
            var Difference_In_Time = expRenewDate.getTime() - present_date.getTime()
            var Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24))
            if (Difference_In_Days <= 90) {
              return {
                Product: data.product.title,
                Country: data.country.title,
                Company: data.company.title,
                Email: data.company.email,
                Days: Difference_In_Days < 0 ? 'Expired' : Difference_In_Days,
              }
            }
            return null
          })
          .filter((data: any) => {
            return data != undefined
          })
        const uniqueEmails = [...new Set(mapData.map((item: any) => item.Email as string))] as string[]
        const subject = 'Product Expiring'
        var finalString = ''
        for (let i = 0; i < uniqueEmails.length; i++) {
          for (let j = 0; j < mapData.length; j++) {
            if (mapData[j].Email == uniqueEmails[i]) {
              finalString += `<p>Product <b style="color:blue;">'${mapData[j].Product}'</b> is going to expire in <b style="color:blue;">'${mapData[j].Country}'.</b></p>
                            <p><b>Below are the details about the product:</b></p>
                            <ul>
                            <p ><li>Company Name: <b style="color:blue;" >${mapData[j].Company}</b></p></li>
                            <p ><li>Product Name: <b style="color:blue;" >${mapData[j].Product}</b></p></li>
                            <p ><li>Country Name: <b style="color:blue;">${mapData[j].Country}</b></p></li>
                            <p ><li>Days Remaining: <b style="color:blue;">${mapData[j].Days}</b></p></li></ul>`
            }
          }
          // Note: emailSend is missing req parameter here, but keeping original logic
          emailSend(uniqueEmails[i], uniqueEmails[i], subject, finalString)
        }
      } else {
        console.log(error)
      }
    })
  } catch (error) {
    console.log(error)
  }
}

export default {
  //---------------------------------Delete Renewal of a Product API---------------------//
  deleteRenewal: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const id = req.params?.id

      const deleteRenewal = await Renewal.deleteOne({ _id: id })

      if (!deleteRenewal) return res.status(400).json({ code: 'ERROROCCURED', message: 'Renewal not deleted' })

      return res.status(200).json({ code: 'DELETED', message: 'Renewal deleted successfully!!' })
    } catch (error) {
      return res.status(500).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },

  //---------------------------------Add new Renewal of a Product API---------------------//
  addRenewal: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      if ((req.user!.role as any).slug == 'superadmin')
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'SUPER-ADMIN CAN NOT ADD NEW RENEWAL!!',
        })
      const { preregistration, expRenewDate, expSubmitDate, expInitiateDate } = req.body

      if (!preregistration)
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'Pre-registration id is required',
        })
      if (!expRenewDate) return res.status(400).json({ code: 'ERROROCCURED', message: 'ExpRenewDate is required' })
      if (!expSubmitDate) return res.status(400).json({ code: 'ERROROCCURED', message: 'ExpSubmitDate is required' })
      if (!expInitiateDate)
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'ExpInitiateDate is required',
        })

      const renewalQuery = {
        ...req.body,
        company: (req?.user?.company as any)?._id,
      }

      const renewal = await Renewal.create(renewalQuery)
      if (!renewal) return res.status(400).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })

      return res.status(200).json({ code: 'CREATED', message: 'Renewal created successfully!!' })
    } catch (error) {
      console.log('ERROR: ', 'Something Broken!!')
      return res.status(500).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },

  //-----------------------------GET all renewal data API---------------------------//
  getallRenewal: async (req: RequestWithUser, res: Response): Promise<Response> => {
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
      let title = 'product.title'
      let sortTitle: string = sort ? (sort as string) : 'createdAt'
      const pageNum = page ? parseInt(page as string) : 1
      const limitNum = limit ? parseInt(limit as string) : 10
      const sortOrder = order === 'ascending' ? 1 : -1

      if (sort === 'product') sortTitle = 'product.title'
      else if (sort === 'country') sortTitle = 'country.title'
      else sortTitle = sort ? (sort as string) : 'createdAt'

      if (searchTitle === 'product') title = 'product.title'
      else if (searchTitle === 'country') title = 'country.title'
      else title = searchTitle ? (searchTitle as string) : 'product.title'

      if ((req.user!.role as any).slug == 'superadmin') {
        match = { $match: { status: true, stage: { $ne: 'registered' } } }
      } else {
        match = {
          $match: {
            company: new Types.ObjectId((req?.user?.company as any)?._id),
            status: true,
            stage: { $ne: 'registered' },
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
        } else if (['renewDate'].includes(title)) {
          return { 'product.title': { $regex: search || '', $options: 'si' } }
        } else {
          return { [title]: { $regex: search || '', $options: 'si' } }
        }
      }

      const searchCondition = getSearch()

      const data = Renewal.aggregate([
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
            renewDate: 1,
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

      data.exec(async (error: any, result: any) => {
        if (result) {
          if (result.length === 0) return res.status(200).json({ code: 'FETCHED', data: {} })
          if (isDownload === 'true') {
            if (filetype === 'xlsx') {
              const xlsxBuffer = await exportSelectedFieldsXLSX(result[0]?.data, fieldsToExport)
              res.setHeader('Content-Type', 'application/vnd/openxmlformats-officedocument.spreadsheetml.sheet')
              res.setHeader('Content-Disposition', 'attachment: filename=RenewalData.xlsx')
              return res.status(200).send(xlsxBuffer)
            }

            if (filetype === 'pdf') {
              const { ok, fileBuffer, error } = await generatingEjsWithFieldToExportAndTitle(
                'exportSelectedFields',
                result[0]?.data,
                fieldsToExport,
                'Renewal',
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
    } catch (error) {
      console.log('Error: ' + error)
      return res.status(500).json({ message: 'Something Broken!!' })
    }
    return res
  },

  //---------------------------Get renewal data by product ID API--------------------------------//
  getRenewalByPreregistrationId: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { searchTitle, search, page, limit, sort, order, isDownload, filetype, selectedFields } = req.query
      const fieldsToExport = selectedFields ? JSON.parse(selectedFields as string) : []
      const id = req.params.productId
      let match: any = { $match: {} }
      let title = 'product.title'
      let sortTitle: string = sort ? (sort as string) : 'createdAt'
      const pageNum = page ? parseInt(page as string) : 1
      const limitNum = limit ? parseInt(limit as string) : 10
      const sortOrder = order === 'ascending' ? 1 : -1

      if (sort === 'product') sortTitle = 'product.title'
      else if (sort === 'country') sortTitle = 'country.title'
      else sortTitle = sort ? (sort as string) : 'createdAt'

      if (searchTitle === 'product') title = 'product.title'
      else if (searchTitle === 'country') title = 'country.title'
      else title = searchTitle ? (searchTitle as string) : 'product.title'

      if ((req.user!.role as any).slug == 'superadmin') {
        match = {
          $match: { preregistration: new Types.ObjectId(id), status: true },
        }
      } else {
        match = {
          $match: {
            preregistration: new Types.ObjectId(id),
            company: new Types.ObjectId((req?.user?.company as any)?._id),
            status: true,
          },
        }
      }

      const data = Renewal.aggregate([
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
            expRenewDate: 1,
            expSubmitDate: 1,
            expInitiateDate: 1,
            renewDate: 1,
            submitDate: 1,
            initiateDate: 1,
            createdAt: 1,
            approvalPdf: 1,
            posPdf: 1,
            remark: 1,
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

      data.exec(async (error: any, result: any) => {
        // return res.json(result)
        if (result) {
          if (result.length === 0) return res.status(200).json({ code: 'FETCHED', data: {} })

          if (isDownload === 'true') {
            if (filetype === 'xlsx') {
              const xlsxBuffer = await exportSelectedFieldsXLSX(result[0]?.data, fieldsToExport)
              res.setHeader('Content-Type', 'application/vnd/openxmlformats-officedocument.spreadsheetml.sheet')
              res.setHeader('Content-Disposition', 'attachment: filename=RenewalData.xlsx')
              return res.status(200).send(xlsxBuffer)
            }

            if (filetype === 'pdf') {
              const { ok, fileBuffer, error } = await generatingEjsWithFieldToExportAndTitle(
                'exportSelectedFields',
                result[0]?.data,
                fieldsToExport,
                'Renewal',
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
    } catch (error) {
      console.log('Error: ' + error)
      return res.status(500).json({ message: 'Something Broken!!' })
    }
    return res
  },

  //-------------------Update Renewal API-----------------------//
  updateRenewal: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      if ((req.user!.role as any).slug == 'superadmin')
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'SUPER-ADMIN CAN NOT UPDATE RENEWAL!!',
        })
      const id = req.params.id
      const posPdf = req?.files?.posPdf
      const approvalPdf = req?.files?.approvalPdf
      const posFolder = process.env.FOLDER + `/POS/${(req?.user?.company as ICompany)?.title}`
      const approvalFolder = process.env.FOLDER + `/Approval/${(req?.user?.company as ICompany)?.title}`
      const renewalPdfExists = await Renewal.findOne(
        { _id: id, company: (req?.user?.company as any)?._id },
        { posPdf: 1, approvalPdf: 1 }
      )
      let posPath = {}
      let approvalPath = {}

      if (posPdf) {
        renewalPdfExists?.posPdf?.key ? deleteFile(renewalPdfExists?.posPdf) : null
        const result = await uploadFile(posPdf as any, posFolder)
        if (result.error) return res.status(400).json({ message: result.error })
        posPath = result.fileData
      } else posPath = renewalPdfExists?.posPdf?.key ? renewalPdfExists?.posPdf : null

      if (approvalPdf) {
        renewalPdfExists?.approvalPdf?.key ? deleteFile(renewalPdfExists?.approvalPdf) : null
        const result = await uploadFile(approvalPdf as any, approvalFolder)
        if (result.error) return res.status(400).json({ message: result.error })
        approvalPath = result.fileData
      } else approvalPath = renewalPdfExists?.approvalPdf?.key ? renewalPdfExists?.approvalPdf : null

      const updatedRenew = await Renewal.findByIdAndUpdate(
        { _id: id, company: (req?.user?.company as any)?._id },
        { $set: { ...req.fields, posPdf: posPath, approvalPdf: approvalPath } },
        { new: true }
      )

      if (!updatedRenew) return res.status(400).json({ code: 'ERROROCCURED', message: 'Renewal not updated.' })

      // Generate notification number if posPdf is uploaded (new or changed) and no existing number
      if (posPdf && updatedRenew.posPdf && !updatedRenew.notificationNumber) {
        try {
          const PreRegistration = require('../model/preregistration').default
          const preRegistration = await PreRegistration.findById(updatedRenew.preregistration)
          const companyId = preRegistration.company
          const productId = preRegistration.product
          const countryId = preRegistration.country
          const notificationNumber = await NotificationService.generateNotificationNumber(
            companyId,
            productId,
            countryId
          )
          await Renewal.findByIdAndUpdate(id, { notificationNumber })
          // Update preregistration with the same notification number
          await PreRegistration.findByIdAndUpdate(updatedRenew.preregistration, { notificationNumber })
        } catch (error) {
          console.error('Error generating notification number for renewal:', error)
        }
      }

      if (updatedRenew && updatedRenew?.approvalPdf?.key && updatedRenew?.stage == 'renew' && updatedRenew?.renewDate) {
        const checkRenew = await Renewal.aggregate([
          { $match: { _id: new Types.ObjectId(id) } },
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
                    pipeline: [{ $match: { active: true }, $project: { title: 1 } }],
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
                { $unwind: '$product' },
                { $unwind: '$country' },
                { $project: { country: 1, product: 1 } },
              ],
              as: 'preregistration',
            },
          },
          {
            $unwind: {
              path: '$preregistration',
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $project: {
              country: '$preregistration.country',
              product: '$preregistration.product',
            },
          },
        ])

        const countryDetails = await Country.findOne({
          _id: checkRenew[0]?.country?._id,
        })
        if (countryDetails) {
          const initiate = countryDetails?.initiateDays
          const submit = countryDetails?.submitDays
          const renew = countryDetails?.renewDays
          const expRenewDate = new Date(new Date(updatedRenew?.renewDate).getTime() + renew * 24 * 60 * 60 * 1000)
            .toISOString()
            .substring(0, 10)
          const expInitiateDate = new Date(new Date(updatedRenew?.renewDate).getTime() + initiate * 24 * 60 * 60 * 1000)
            .toISOString()
            .substring(0, 10)
          const expSubmitDate = new Date(new Date(updatedRenew?.renewDate).getTime() + submit * 24 * 60 * 60 * 1000)
            .toISOString()
            .substring(0, 10)

          const createRenew = await Renewal.create({
            preregistration: updatedRenew.preregistration,
            expRenewDate: expRenewDate,
            expInitiateDate: expInitiateDate,
            expSubmitDate: expSubmitDate,
            company: (req?.user?.company as any)?._id,
          })
          if (createRenew) {
            let subject = `Product ${checkRenew[0]?.product.title} renewed in '${checkRenew[0]?.country.title}'`
            let data = `<p>Product <b style="color:blue;">'${checkRenew[0]?.product.title}'</b>
                             has been renewed in <b style="color:blue;">'${checkRenew[0]?.country.title}'.</b><p>
                    <p><b>Below are the details about the renewed product:</b></p> <ul>
                    <p ><li>Product Name: <b style="color:blue;" >${checkRenew[0]?.product.title}</b></p></li>
                    <p ><li>Country Name: <b style="color:blue;">${checkRenew[0]?.country.title}</b></p></li>
                    <p ><li>Renewed Date: <b style="color:blue;">${updatedRenew?.renewDate}</b></p></li></ul>`

            emailSend(
              (req?.user?.company as ICompany)?.email || '',
              (req?.user?.company as ICompany)?.secondaryEmail || '',
              subject,
              data
            )
            return res.status(200).json({
              code: 'RENEWED UPDATED',
              message: 'Renew updated successfully!!',
            })
          }
        }
      }

      return res.status(200).json({ code: 'UPDATED', message: 'Renewal updated successfully!!' })
    } catch (error) {
      console.log('Error: ' + 'Something Broken!!')
      return res.status(400).json({
        code: 'ERROROCCURED',
        message: 'Something Broken!!',
      })
    }
  },

  //--------------------Iniatiate a Renewal API--------------------------------//
  initiate: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      if ((req.user!.role as any).slug == 'superadmin') {
        return res.status(400).json({
          code: 'ERROROCCURED',
          data: 'SUPER-ADMIN CAN NOT INITIATE RENEWAL!!',
        })
      } else {
        const updateRenewal = await Renewal.findByIdAndUpdate(
          {
            _id: req.body.id,
            company: (req?.user?.company as any)?._id,
            status: true,
          },
          { $set: { ...req.body } }
        )
        if (updateRenewal) {
          return res.status(200).json({
            code: 'UPDATED',
            data: updateRenewal,
          })
        } else {
          return res.status(200).json({
            code: 'NOT UPDATED',
            data: 'THIS RENEWAL ID DOES NOT EXIST IN OUR DATABSE',
          })
        }
      }
    } catch (error) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        data: error,
      })
    }
  },

  //---------------------------Submit Renewal API-------------------------//
  submit: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      if ((req.user!.role as any).slug == 'superadmin') {
        return res.status(400).json({
          code: 'ERROROCCURED',
          data: 'SUPER-ADMIN CAN NOT SUBMIT RENEWAL!!',
        })
      } else {
        const submitRenewal = await Renewal.findByIdAndUpdate(
          { _id: req.body.id, company: (req?.user?.company as any)?._id },
          { $set: { ...req.body } }
        )

        if (submitRenewal) {
          return res.status(200).json({
            code: 'UPDATED',
            data: submitRenewal,
          })
        } else {
          return res.status(200).json({
            code: 'NOT UPDATED',
            data: 'THIS RENEWAL ID DOES NOT EXIST IN OUR DATABSE',
          })
        }
      }
    } catch (error) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        data: error,
      })
    }
  },

  //-----------------------GET renewal stats API-------------------------------//
  calculate: async (req: RequestWithUser, res: Response): Promise<Response> => {
    let data: any
    if ((req.user!.role as any).slug == 'superadmin') {
      data = Renewal.find({ status: true }).populate({
        path: 'product',
      })
    } else {
      data = Renewal.find({
        company: (req?.user?.company as any)?._id,
        status: true,
      }).populate({
        path: 'product',
      })
    }
    data.exec((err: any, Renewals: any) => {
      if (Renewals) {
        let initial = 0
        let submit = 0
        let renewal = 0
        for (let i = 0; i < Renewals.length; i++) {
          if (Renewals[i].stage == 'initiate') initial++
          else if (Renewals[i].stage == 'submit') submit++
          else if (Renewals[i].stage == 'renew') renewal++
        }
        return res.status(200).json({
          code: 'FETCHED',
          data: {
            all: initial + submit + renewal,
            initial: initial,
            submit: submit,
            renewal: renewal,
          },
        })
      } else {
        return res.status(400).json({
          code: 'ERROROCCURED',
          data: err,
        })
      }
    })
    return res
  },

  //----------------------GET all distict renew years--------------------------------//
  getRenewYears: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      let data
      if ((req.user!.role as any).slug == 'superadmin') {
        data = await Renewal.find({ status: true }, { _id: 0, expRenewDate: 1 })
      } else {
        data = await Renewal.find({ company: req.user?.company, status: true }, { _id: 0, expRenewDate: 1 })
      }
      const years =
        data &&
        data.map((item: any) => {
          return new Date(item.expRenewDate).getFullYear()
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

  alertRenewal: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const renewYear = req.body.renewYear
      let matchObj: any = {}
      if ((req.user!.role as any).slug == 'superadmin') {
        matchObj['year'] = renewYear
        matchObj['status'] = true
      } else {
        matchObj['year'] = renewYear
        matchObj['company'] = (req.user!.company as any)._id
        matchObj['status'] = true
      }
      Renewal.aggregate([
        {
          $project: {
            year: { $substr: ['$expRenewDate', 0, 4] },
            product: 1,
            expRenewDate: 1,
            expInitiateDate: 1,
            expSubmitDate: 1,
            renewDate: 1,
            initiateDate: 1,
            submitDate: 1,
            stage: 1,
            status: 1,
            company: 1,
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
      ]).exec((err: any, result: any) => {
        if (err) {
          console.log(err)
          return res.status(400).json({
            code: 'ERROROCCURED',
            data: err,
          })
        } else {
          return res.status(200).json({
            code: 'FETCHED',
            data: result,
          })
        }
      })
    } catch (error) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        data: 'Something Broken!!',
      })
    }
    return res
  },

  renewed: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      if ((req.user!.role as any).slug == 'superadmin') {
        return res.status(400).json({
          code: 'ERROROCCURED',
          data: 'SUPER-ADMIN CAN NOT RENEWED RENEWAL!!',
        })
      } else {
        const renewed = await Renewal.findByIdAndUpdate(
          { _id: req.body.id, company: (req.user!.company as any)._id },
          {
            $set: {
              renewDate: req.body.renewDate,
              stage: req.body.stage,
              posPdf: req.files?.posPdf
                ? '/pos/' + (req.user!.company as any).title + '/' + (req.files as any).posPdf[0].filename
                : '',
              approvalPdf: req.files?.approvalPdf
                ? '/approval/' + (req.user!.company as any).title + '/' + (req.files as any).approvalPdf[0].filename
                : '',
            },
          },
          { new: true }
        )

        if (renewed) {
          const renewData = await Renewal.findOne({
            _id: req.body.id,
            company: (req.user!.company as any)._id,
          }).populate({
            path: 'product',
            populate: {
              path: 'country',
              model: 'Country',
            },
          })
          const countryDetails = await Country.findById((req.body as any).countryID)
          if (countryDetails) {
            const intiate = countryDetails.initiateDays
            const submit = countryDetails.submitDays
            const renew = countryDetails.renewDays
            const expRenewDate = new Date(new Date(req.body.renewDate).getTime() + renew * 24 * 60 * 60 * 1000)
              .toISOString()
              .toString()
              .substring(0, 10)
            const expInitiateDate = new Date(new Date(req.body.renewDate).getTime() + intiate * 24 * 60 * 60 * 1000)
              .toISOString()
              .toString()
              .substring(0, 10)
            const expSubmitDate = new Date(new Date(req.body.renewDate).getTime() + submit * 24 * 60 * 60 * 1000)
              .toISOString()
              .toString()
              .substring(0, 10)

            const createRenew = await Renewal.create({
              product: (renewed as any).product,
              expRenewDate: expRenewDate,
              expInitiateDate: expInitiateDate,
              expSubmitDate: expSubmitDate,
              company: (req.user!.company as any)._id,
            })
            if (createRenew) {
              if ((renewData as any)?.stage == 'renew') {
                let subject = `Product ${
                  (renewData as any)?.product.title
                } renewed in '${(renewData as any)?.product.country.title}'`
                let data = `<p>Product <b style="color:blue;">'${(renewData as any)?.product.title}'</b>
                         has been renewed in <b style="color:blue;">'${
                           (renewData as any)?.product.country.title
                         }'.</b><p>
                <p><b>Below are the details about the renewed product:</b></p> <ul>
                <p ><li>Product Name: <b style="color:blue;" >${(renewData as any)?.product.title}</b></p></li>
                <p ><li>Country Name: <b style="color:blue;">${(renewData as any)?.product.country.title}</b></p></li>
                <p ><li>Renewed Date: <b style="color:blue;">${(renewData as any)?.renewDate}</b></p></li></ul>`

                emailSend(
                  (req.user!.company as any).email || '',
                  (req.user!.company as any).secondaryEmail || '',
                  subject,
                  data
                )
              }

              return res.status(200).json({
                code: 'RENEWED UPDATED',
                data: createRenew,
              })
            } else {
              return res.status(200).json({
                code: 'RENEW NOT UPDATED',
                data: 'RENEWED HAS BEEN UPDATED BUT NEW RENEWED COULD NOT BE CREATED !!',
              })
            }
          } else {
            return res.status(400).json({
              code: 'ERROROCCURED',
              data: 'Country details not found',
            })
          }
        } else {
          return res.status(200).json({
            code: 'NOT RENEWED',
            data: 'THIS RENEW ID DOES NOT EXISTS !!',
          })
        }
      }
    } catch (error) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        data: 'Something Broken!!',
      })
    }
  },
}

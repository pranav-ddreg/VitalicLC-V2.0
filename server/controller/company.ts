import Company from '../model/company'
import Pricing from '../model/pricing'
import AWS from 'aws-sdk'
import { generatingEjsWithFieldToExportAndTitle } from '../services/ejsToPdf'
import { exportSelectedFieldsXLSX } from '../utils/exportSelectedFieldsCSV'
import { awsImageStorage, deleteFile } from '../services/uploadsFiles'
import { Request, Response, RequestWithUser } from '../types/interfaces'

require('dotenv').config()

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_KEY!,
  region: process.env.AWS_REGION!,
  apiVersion: '2010-12-01',
}
const SES = new AWS.SES(awsConfig)

export default {
  addCompany: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const { title, email, secondaryEmail, plan, purchasedOn, countryIds } = req.fields!
      const file = req.files?.logo
      if (!title) {
        res.status(400).json({ code: 'INVALID_INPUT', message: 'Title is required' })
        return
      }
      if (!email) {
        res.status(400).json({ code: 'INVALID_INPUT', message: 'Email is required' })
        return
      }
      if (!plan) {
        res.status(400).json({ code: 'INVALID_INPUT', message: 'Plan Id is required' })
        return
      }
      if (!purchasedOn) {
        res.status(400).json({ code: 'INVALID_INPUT', message: 'Purchased on date is required' })
        return
      }

      if (!file) {
        res.status(400).json({ code: 'INVALID_INPUT', message: 'company logo is required' })
        return
      }
      if (JSON.parse(countryIds).length < 0) {
        res.status(400).json({ code: 'INVALID_INPUT', message: 'CountryIds is required' })
        return
      }
      if (typeof file !== 'object') {
        res.status(400).json({ code: 'INVALID_FILE', message: 'Company logo should be valid' })
        return
      }

      const emailExists = await Company.exists({ email: email })
      const params = { EmailAddress: email }
      SES.verifyEmailIdentity(params)
        .promise()
        .then((data) => {})
        .catch((error) => {
          console.log('error', error)
        })
      if (emailExists) {
        res.status(409).json({ code: 'DUPLICATEDATA', message: 'Email already exists in company' })
        return
      }

      const priceDuration = await Pricing.findOne({ _id: plan }, { duration: 1 })
      if (!priceDuration) {
        res.status(400).json({ code: 'ERRORUCCURED', message: 'Pricing plan not found' })
        return
      }

      const { error, companyLogo } = await awsImageStorage(file, process.env.FOLDER + '/Logo')
      if (error) {
        res.status(500).json({ code: 'ERROR', message: 'Something Broken!!' })
        return
      }
      const duration = priceDuration?.duration
      const expiredOn = new Date(new Date(purchasedOn).getTime() + duration * 24 * 60 * 60 * 1000)
        .toISOString()
        .toString()
        .substring(0, 10)

      const companyQuery = {
        title: title,
        email: email,
        secondaryEmail: secondaryEmail,
        logo: companyLogo,
        plan: plan,
        purchasedOn: purchasedOn,
        expiredOn: expiredOn,
        countryIds: JSON.parse(countryIds),
      }

      const companyCreate = await Company.create(companyQuery)

      if (!companyCreate) {
        res.status(400).json({ message: 'Some error occurred creating company' })
        return
      }

      res.status(200).json({ message: 'Company created successfully !!' })
    } catch (error: any) {
      console.log('ERROR: ' + error)
      res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  getallCompany: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const { searchTitle, search, page, limit, sort, order, isDownload, filetype, listLess, selectedFields } =
        req.query
      const fieldsToExport = selectedFields ? JSON.parse(selectedFields as string) : []

      // Field mapping for frontend selectedFields to backend data field names
      const fieldMappings: { [key: string]: string } = {
        company: 'title', // Frontend asks for "company", backend has "title"
        plan: 'plan', // Plans need special handling for nested objects
        email: 'email',
        secondaryEmail: 'secondaryEmail',
        purchasedOn: 'purchasedOn',
        expiredOn: 'expiredOn',
      }

      // Map frontend selectedFields to backend field names
      const mappedSelectedFields = fieldsToExport.map((field: string) => fieldMappings[field] || field)
      let effectiveListLess = isDownload === 'true' ? 'false' : listLess // For exports, always use full projection
      let title = 'title'
      let sortTitle = 'createdAt'
      const sortOrder = order === 'ascending' ? 1 : -1

      if (sort === 'plan') sortTitle = 'plan.plan'
      else if (effectiveListLess === 'true') sortTitle = 'title'
      else sortTitle = sort ? (sort as string) : 'createdAt'

      if (searchTitle === 'plan') title = 'plan.plan'
      else title = searchTitle ? (searchTitle as string) : 'title'

      const companyData = Company.aggregate([
        {
          $lookup: {
            from: 'pricing',
            localField: 'plan',
            foreignField: '_id',
            pipeline: [
              {
                $project: { plan: 1 },
              },
            ],
            as: 'plan',
          },
        },
        {
          $lookup: {
            from: 'countries',
            let: { id: '$countryIds' },
            pipeline: [{ $match: { $expr: { $in: ['$_id', '$$id'] } } }, { $project: { title: 1 } }],
            as: 'country',
          },
        },
        { $unwind: { path: '$plan', preserveNullAndEmptyArrays: false } },
        {
          $project:
            effectiveListLess === 'true'
              ? {
                  title: 1,
                  createdAt: 1,
                }
              : {
                  title: 1,
                  email: 1,
                  plan: 1,
                  purchasedOn: 1,
                  expiredOn: 1,
                  logo: 1,
                  country: 1,
                  createdAt: 1,
                },
        },
        { $match: { [title]: { $regex: search || '', $options: 'si' } } },
        {
          $facet: {
            data:
              isDownload === 'true'
                ? [{ $sort: { [sortTitle]: sortOrder } }]
                : limit
                  ? [
                      { $sort: { [sortTitle]: sortOrder } },
                      { $skip: (+(page as string) - 1) * +(limit as string) || 0 },
                      { $limit: +limit || 10 },
                    ]
                  : [{ $sort: { [sortTitle]: sortOrder } }],
            count: [{ $count: 'totalCount' }],
          },
        },
        { $unwind: { path: '$count', preserveNullAndEmptyArrays: false } },
        { $set: { count: '$count.totalCount' } },
      ])

      companyData.exec(async (error, result) => {
        if (result) {
          if (result.length === 0) {
            res.status(200).json({ code: 'FETCHED', data: {} })
            return
          }
          if (isDownload === 'true') {
            if (filetype === 'xlsx') {
              const xlsxBuffer = await exportSelectedFieldsXLSX(result[0]?.data, mappedSelectedFields)
              res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
              res.setHeader('Content-Disposition', 'attachment: filename=CompanyData.xlsx')
              res.status(200).send(xlsxBuffer)
              return
            }

            if (filetype === 'pdf') {
              const { ok, fileBuffer, error } = await generatingEjsWithFieldToExportAndTitle(
                'exportSelectedFields',
                result[0]?.data,
                mappedSelectedFields,
                'Companies',
                true
              )

              if (error) {
                res.status(400).json({ message: 'Something Broken!!' })
                return
              }

              res.set('Content-Type', 'application/pdf')
              res.status(200).send(fileBuffer)
              return
            }

            res.status(400).json({ message: 'Please provide proper file type' })
            return
          }

          res.status(200).json({ code: 'FETCHED', data: result[0] || {} })
        } else {
          res.status(400).json({ code: 'ERROROCCURED', message: error })
        }
      })
    } catch (error: any) {
      console.log('ERROR: ' + error)
      res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  updateCompany: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const id = req.params.id
      const { title, email, secondaryEmail, plan, countryIds } = req.fields!
      const file = req.files?.logo
      let companyImage

      if (JSON.parse(countryIds).length < 0) {
        res.status(400).json({ code: 'INVALID_INPUT', message: 'CountryIds is required' })
        return
      }

      const emailExists = await Company.findOne({ email: email }, { email: email })
      const params = { EmailAddress: email }
      SES.verifyEmailIdentity(params)
        .promise()
        .then((data) => {})
        .catch((error) => {
          console.log('error', error)
        })

      if (emailExists && emailExists._id.toString() !== id) {
        res.status(409).json({ code: 'DUPLICATEDATA', message: 'Email already exists' })
        return
      }

      const data = await Company.findOne({ _id: id }, { logo: 1 })
      if (file) {
        deleteFile(data?.logo)
        const { error, companyLogo } = await awsImageStorage(file, process.env.FOLDER + '/Logo')
        if (error) {
          res.status(400).json({ code: 'ERROR', message: 'Something Broken!!' })
          return
        }
        companyImage = companyLogo
      } else companyImage = data?.logo

      const companyQuery = {
        title: title,
        email: email,
        secondaryEmail: secondaryEmail,
        logo: companyImage,
        plan: plan,
        countryIds: countryIds && JSON.parse(countryIds),
      }
      const updateCompanyData = await Company.findOneAndUpdate({ _id: id }, companyQuery, { new: true })

      if (!updateCompanyData) {
        res.status(400).json({ message: 'company not updated.' })
        return
      }

      res.status(200).json({ message: 'company updated successfully!!' })
    } catch (error: any) {
      console.log('ERROR: ' + error)
      res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  deleteCompany: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params?.id
      const deleteCompanyData = await Company.findOneAndDelete({ _id: id })

      if (!deleteCompanyData) {
        res.status(400).json({ code: 'ERROROCCOURED', message: 'Company not deleted.' })
        return
      }
      deleteFile(deleteCompanyData?.logo)

      res.status(200).json({ code: 'DELETED', message: 'Company deleted successfully!!' })
    } catch (error: any) {
      console.log('ERROR: ' + error)
      res.status(500).json({ message: 'Something Broken!!' })
    }
  },
}

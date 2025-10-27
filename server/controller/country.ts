import Country from '../model/country'
import Company from '../model/company'
import ExcelJS from 'exceljs'
import { Types } from 'mongoose'
import slugify from 'slugify'
import { generatingEjsWithFieldToExportAndTitle } from '../services/ejsToPdf'
import { exportSelectedFieldsXLSX } from '../utils/exportSelectedFieldsCSV'
import { Request, Response, RequestWithUser } from '../types/interfaces'

export default {
  addCountry: (req: RequestWithUser, res: Response) => {
    try {
      const { title, approvalDays, launchDays, initiateDays, submitDays, renewDays, IA, IB, major, minor } = req.body

      Country.exists({ slug: slugify(title, { lower: true }) }, (error, result) => {
        if (result) res.status(409).json({ code: 'DUPLICATEDATA', message: 'Country already exists!!' })
        else if (!result) {
          const countryQuery = {
            title: title,
            slug: slugify(title, { lower: true }),
            approvalDays: approvalDays,
            launchDays: launchDays,
            initiateDays: initiateDays,
            submitDays: submitDays,
            renewDays: renewDays,
            IA: IA,
            IB: IB,
            major: major,
            minor: minor,
            company: (req?.user?.company as any)?._id,
          }
          const country = new Country(countryQuery)

          country.save((error, result) => {
            if (result) return res.status(200).json({ code: 'CREATED', message: 'Country created successfully !!' })
            else return res.status(400).json({ code: 'ERROROCCURED', message: error })
          })
        } else return res.status(200).json({ code: 'SOMTHINGWRONG', message: error })
      })
    } catch (error) {
      console.log('ERROR: ' + error)
      return res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  getallCountry: async (req: RequestWithUser, res: Response): Promise<Response | void> => {
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
        companyId,
        listLess,
        selectedFields,
      } = req.query
      const fieldsToExport = selectedFields ? JSON.parse(selectedFields as string) : []
      let title: string = searchTitle ? (searchTitle as string) : 'title'
      let sortTitle = sort ? sort : 'title'
      const sortOrder = order === 'ascending' ? 1 : -1
      let effectiveListLess = isDownload === 'true' ? 'false' : listLess // For exports, always use full projection
      let countryData

      let lookup: any = {
        $lookup: {
          from: 'countries',
          let: { id: '$countryIds' },
          pipeline: [
            {
              $addFields: {
                approvalDays: { $toString: '$approvalDays' },
                launchDays: { $toString: '$launchDays' },
                initiateDays: { $toString: '$initiateDays' },
                submitDays: { $toString: '$submitDays' },
                renewDays: { $toString: '$renewDays' },
                IA: { $toString: '$IA' },
                IB: { $toString: '$IB' },
                major: { $toString: '$major' },
                minor: { $toString: '$minor' },
              },
            },
            {
              $match: {
                $expr: { $in: ['$_id', '$$id'] },
                [title]: { $regex: search || '', $options: 'si' },
              },
            },
            {
              $lookup: {
                from: 'preRegistration',
                localField: '_id',
                foreignField: 'country',
                pipeline: [
                  {
                    $match:
                      req?.roleData?.slug == 'superadmin'
                        ? { active: true }
                        : { active: true, company: new Types.ObjectId((req?.user?.company as any)?._id) },
                  },
                  {
                    $group: {
                      _id: null,
                      productSize: { $addToSet: '$product' },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      productSize: { $size: '$productSize' },
                    },
                  },
                ],
                as: 'product',
              },
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
              $project:
                effectiveListLess === 'true'
                  ? {
                      title: 1,
                      product: { $cond: ['$product', '$product.productSize', 0] },
                      createdAt: 1,
                    }
                  : {
                      title: 1,
                      slug: 1,
                      approvalDays: { $toInt: '$approvalDays' },
                      launchDays: { $toInt: '$launchDays' },
                      initiateDays: { $toInt: '$initiateDays' },
                      submitDays: { $toInt: '$submitDays' },
                      renewDays: { $toInt: '$renewDays' },
                      IA: { $toInt: '$IA' },
                      IB: { $toInt: '$IB' },
                      major: { $toInt: '$major' },
                      minor: { $toInt: '$minor' },
                      product: { $cond: ['$product', '$product.productSize', 0] },
                      createdAt: 1,
                    },
            },
            {
              $facet: {
                data:
                  isDownload === 'true'
                    ? [{ $sort: { [sortTitle as any]: sortOrder } }]
                    : limit
                      ? [
                          { $sort: { [sortTitle as any]: sortOrder } },
                          { $skip: (+(page as string) - 1) * +(limit as string) || 0 },
                          { $limit: +limit || 10 },
                        ]
                      : [{ $sort: { [sortTitle as any]: sortOrder } }],
                count: [{ $count: 'totalCount' }],
              },
            },
            { $unwind: { path: '$count', preserveNullAndEmptyArrays: false } },
            { $set: { count: '$count.totalCount' } },
          ],
          as: 'data',
        },
      }

      let unwind = { $unwind: { path: '$data', preserveNullAndEmptyArrays: false } }
      let project = {
        $project: {
          _id: 0,
          data: '$data.data',
          count: '$data.count',
        },
      }

      if (req.roleData!.slug == 'superadmin') {
        if (companyId) {
          countryData = Company.aggregate(
            [{ $match: { _id: new Types.ObjectId(companyId as string) } }, lookup, unwind, project],
            { collation: { locale: 'en' } }
          )
        } else {
          countryData = Country.aggregate(
            [
              {
                $addFields: {
                  approvalDays: { $toString: '$approvalDays' },
                  launchDays: { $toString: '$launchDays' },
                  initiateDays: { $toString: '$initiateDays' },
                  submitDays: { $toString: '$submitDays' },
                  renewDays: { $toString: '$renewDays' },
                  IA: { $toString: '$IA' },
                  IB: { $toString: '$IB' },
                  major: { $toString: '$major' },
                  minor: { $toString: '$minor' },
                },
              },
              {
                $lookup: {
                  from: 'preRegistration',
                  localField: '_id',
                  foreignField: 'country',
                  pipeline: [
                    {
                      $match:
                        req?.roleData?.slug == 'superadmin'
                          ? { active: true }
                          : { active: true, company: new Types.ObjectId((req?.user?.company as any)?._id) },
                    },
                    { $group: { _id: null, productSize: { $addToSet: '$product' } } },
                    { $project: { _id: 0, productSize: { $size: '$productSize' } } },
                  ],
                  as: 'product',
                },
              },
              { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
              {
                $match: {
                  [title]: { $regex: search || '', $options: 'si' },
                },
              },
              {
                $project:
                  effectiveListLess === 'true'
                    ? {
                        title: 1,
                        product: { $cond: ['$product', '$product.productSize', 0] },
                      }
                    : {
                        title: 1,
                        slug: 1,
                        approvalDays: { $toInt: '$approvalDays' },
                        launchDays: { $toInt: '$launchDays' },
                        initiateDays: { $toInt: '$initiateDays' },
                        submitDays: { $toInt: '$submitDays' },
                        renewDays: { $toInt: '$renewDays' },
                        IA: { $toInt: '$IA' },
                        IB: { $toInt: '$IB' },
                        major: { $toInt: '$major' },
                        minor: { $toInt: '$minor' },
                        product: { $cond: ['$product', '$product.productSize', 0] },
                      },
              },
              {
                $facet: {
                  data:
                    isDownload === 'true'
                      ? [{ $sort: { [sortTitle as any]: sortOrder } }]
                      : limit
                        ? [
                            { $sort: { [sortTitle as any]: sortOrder } },
                            { $skip: (+(page as string) - 1) * +(limit as string) || 0 },
                            { $limit: +limit || 10 },
                          ]
                        : [{ $sort: { [sortTitle as any]: sortOrder } }],
                  count: [{ $count: 'totalCount' }],
                },
              },
              { $unwind: { path: '$count', preserveNullAndEmptyArrays: false } },
              { $set: { count: '$count.totalCount' } },
            ],
            { collation: { locale: 'en' } }
          )
        }
      } else {
        countryData = Company.aggregate(
          [{ $match: { _id: new Types.ObjectId((req?.user?.company as any)?._id) } }, lookup, unwind, project],
          { collation: { locale: 'en' } }
        )
      }

      countryData.exec(async (error, result) => {
        if (result) {
          if (result.length === 0) return res.status(200).json({ code: 'FETCHED', data: {} })
          if (isDownload === 'true') {
            if (filetype === 'xlsx') {
              const xlsxBuffer = await exportSelectedFieldsXLSX(result[0]?.data, fieldsToExport)
              res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
              res.setHeader('Content-Disposition', 'attachment: filename=countryData.xlsx')
              return res.status(200).send(xlsxBuffer)
            }

            if (filetype === 'pdf') {
              const { ok, fileBuffer, error } = await generatingEjsWithFieldToExportAndTitle(
                'exportSelectedFields',
                result[0]?.data,
                fieldsToExport,
                'Countries',
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
      console.log('ERROR: ' + error)
      return res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  getProductCountry: async (req: RequestWithUser, res: Response) => {
    try {
      const { searchTitle, search, page, limit, sort, order } = req.query
      let title: string = searchTitle ? (searchTitle as string) : 'title'
      let sortTitle = sort ? sort : 'title'
      const sortOrder = order === 'ascending' ? 1 : -1
      let match = { $match: { active: true, company: (req?.user?.company as any)?._id } }
      if (req.roleData!.slug == 'superadmin') match = { $match: { active: true, company: { $exists: true } } }
      console.log(match)

      const countryData = Country.aggregate([
        {
          $addFields: {
            approvalDays: { $toString: '$approvalDays' },
            launchDays: { $toString: '$launchDays' },
            initiateDays: { $toString: '$initiateDays' },
            submitDays: { $toString: '$submitDays' },
            renewDays: { $toString: '$renewDays' },
            IA: { $toString: '$IA' },
            IB: { $toString: '$IB' },
            major: { $toString: '$major' },
            minor: { $toString: '$minor' },
          },
        },
        { $match: { [title as any]: { $regex: search || '', $options: 'si' } } },
        {
          $lookup: {
            from: 'preRegistration',
            localField: '_id',
            foreignField: 'country',
            pipeline: [
              match,
              {
                $group: {
                  _id: null,
                  productSize: { $addToSet: '$product' },
                },
              },
              {
                $project: {
                  _id: 0,
                  productSize: { $size: '$productSize' },
                },
              },
            ],
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1,
            slug: 1,
            product: { $cond: ['$product', '$product.productSize', 0] },
          },
        },
        {
          $facet: {
            data: limit
              ? [
                  { $sort: { [sortTitle as any]: sortOrder } },
                  { $skip: (+(page as string) - 1) * +(limit as string) || 0 },
                  { $limit: +limit || 10 },
                ]
              : [{ $sort: { [sortTitle as any]: sortOrder } }],
            count: [{ $count: 'totalCount' }],
          },
        },
        { $unwind: { path: '$count', preserveNullAndEmptyArrays: false } },
        { $set: { count: '$count.totalCount' } },
      ])

      countryData.exec(async (error, result) => {
        if (result) {
          res.status(200).json({ code: 'FETCHED', data: result[0] || {} })
        } else {
          res.status(400).json({ code: 'ERROROCCURED', message: error })
        }
      })
    } catch (error) {
      console.log('ERROR: ' + error)
      res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  importCountry: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      if (req.files) {
        const filePath = req.files?.excelFile?.path
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.readFile(filePath)
        let data: any[] = []

        // Get the first worksheet
        const worksheet = workbook.worksheets[0]
        if (!worksheet) {
          res.status(400).json({ code: 'ERROROCCURED', message: 'No worksheets found in Excel file' })
          return
        }

        // Get header row
        const headerRow = worksheet.getRow(1)
        const headers: string[] = []

        headerRow.eachCell((cell, colNumber) => {
          headers[colNumber - 1] = ((cell.value as string) || '').toLowerCase().trim()
        })

        // Process data rows
        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
          const row = worksheet.getRow(rowNumber)
          const rowData: any = {}

          row.eachCell((cell, colNumber) => {
            const headerName = headers[colNumber - 1]
            if (headerName) {
              let cellValue = cell.value
              // Parse formula objects from string format like '{"formula": "365+180", "result": 545}'
              if (typeof cellValue === 'string' && cellValue.startsWith('{') && cellValue.includes('result')) {
                try {
                  const parsedObj = JSON.parse(cellValue)
                  if (parsedObj && typeof parsedObj.result !== 'undefined') {
                    cellValue = parsedObj.result
                  }
                } catch (e) {
                  // Not valid JSON, keep as is
                }
              }
              rowData[headerName] = cellValue
            }
          })

          if (rowData.title) {
            rowData.slug = slugify(rowData.title, { lower: true })

            // Map header names from Excel to database field names and assign values
            rowData.major = rowData.major || rowData.MAJOR || rowData.major
            rowData.minor = rowData.minor || rowData.MINOR || rowData.minor
            rowData.approvalDays =
              rowData.approvaldays ||
              rowData.approvalDays ||
              rowData.APPROVALDAYS ||
              rowData['approval days'] ||
              rowData['Approval Days']
            rowData.launchDays =
              rowData.launchdays ||
              rowData.launchDays ||
              rowData.LAUNCHDAYS ||
              rowData['launch days'] ||
              rowData['Launch Days']
            rowData.initiateDays =
              rowData.initiatedays ||
              rowData.initiateDays ||
              rowData.INITIATEDAYS ||
              rowData['initiate days'] ||
              rowData['Initiate Days']
            rowData.submitDays =
              rowData.submitdays ||
              rowData.submitDays ||
              rowData.SUBMITDAYS ||
              rowData['submit days'] ||
              rowData['Submit Days']
            rowData.renewDays =
              rowData.renewdays ||
              rowData.renewDays ||
              rowData.RENEWDAYS ||
              rowData['renew days'] ||
              rowData['Renew Days']
            rowData.IA = rowData.ia || rowData.IA || rowData.IA || rowData.ia
            rowData.IB = rowData.ib || rowData.IB || rowData.IB || rowData.ib

            // Ensure all required fields are numbers or default to 0
            ;[
              'major',
              'minor',
              'approvalDays',
              'launchDays',
              'initiateDays',
              'submitDays',
              'renewDays',
              'IA',
              'IB',
            ].forEach((field) => {
              if (rowData[field] && typeof rowData[field] !== 'number') {
                rowData[field] = parseInt(rowData[field]) || 0
              } else if (rowData[field] === null || rowData[field] === undefined) {
                rowData[field] = 0
              }
            })

            data.push(rowData)
          }
        }

        try {
          let insertCount = 0
          let updateCount = 0
          const companyId = (req?.user?.company as any)?._id

          for (const rowData of data) {
            const slug = slugify(rowData.title || '', { lower: true })

            // Include company in the data
            rowData.company = companyId
            const existingCountry = await Country.exists({ slug })

            if (existingCountry) {
              await Country.findOneAndUpdate({ slug }, { $set: rowData })
              updateCount++
            } else {
              await Country.create(rowData)
              insertCount++
            }
          }

          // fs.unlinkSync(filePath);
          res.status(200).json({
            code: 'INSERTED',
            message: 'File uploaded successfully!!',
            data: { insertedData: insertCount, updatedData: updateCount },
          })
        } catch (error) {
          console.error('Database error:', error)
          res.status(400).json({ code: 'ERROROCCURED', message: 'Database operation failed' })
        }
      } else {
        res.status(400).json({ code: 'ERROROCCURED', message: 'File must be uploaded' })
      }
    } catch (error) {
      console.error('Excel processing error:', error)
      res.status(500).json({ code: 'ERROROCCURED', message: 'File processing failed' })
    }
  },

  updateCountry: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = req.params?.id
      const { title, approvalDays, launchDays, initiateDays, submitDays, renewDays, IA, IB, major, minor } = req.body

      const countryExists = await Country.findOne({ slug: slugify(title, { lower: true }) }, { _id: 1 })

      if (countryExists && countryExists?._id?.toString() !== id)
        return res.status(403).json({ code: 'DUPLICATEDATA', message: 'Country already exists' })

      const countryQuery = {
        title: title,
        slug: slugify(title, { lower: true }),
        approvalDays: approvalDays,
        launchDays: launchDays,
        initiateDays: initiateDays,
        submitDays: submitDays,
        renewDays: renewDays,
        IA: IA,
        IB: IB,
        major: major,
        minor: minor,
      }
      const countryUpdate = await Country.findOneAndUpdate({ _id: id }, countryQuery, { new: true })

      if (!countryUpdate) return res.status(400).json({ code: 'ERROROCCOURED', message: 'Country not updated.' })

      return res.status(200).json({ code: 'UPDATED', message: 'Country updated successfully!!' })
    } catch (error) {
      console.log('ERROR: ' + 'Something Broken!!')
      return res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  deleteCountry: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = req.params?.id

      const deleteCountry = await Country.findOneAndDelete({ _id: id })

      if (!deleteCountry) return res.status(400).json({ code: 'ERROROCCOURED', message: 'Country not deleted.' })

      return res.status(200).json({ code: 'DELETED', message: 'Country deleted successfully!!' })
    } catch (error) {
      console.log('ERROR:' + 'Something Broken!!')
      return res.status(500).json({ message: 'Something Broken!!' })
    }
  },
}

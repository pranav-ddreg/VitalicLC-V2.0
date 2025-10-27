import Product from '../model/product'
import PreRegistration from '../model/preregistration'
import Renewal from '../model/renewal'
import Variation from '../model/variation'
import Country from '../model/country'
import mongoose from 'mongoose'
import { Types } from 'mongoose'
import slugify from 'slugify'
import { Request, Response, RequestWithUser } from '../types/interfaces'

export default {
  //----------------------Add New Product API-------------------//
  //Tested
  addProducts: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      if ((req.user!.role as any).slug == 'superadmin')
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'SUPER-ADMIN CAN NOT ADD ANY PRODUCT',
        })

      const { title } = req.body
      if (!title) return res.status(400).json({ code: 'INVALID_INPUT', message: 'Title is required' })
      if (title && typeof title !== 'string')
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Title should be string' })

      const company = (req?.user?.company as any)?._id
      const slug = slugify(title, { lower: true })

      const product = await Product.findOne({ slug: slug }, { active: 1 })

      console.log('PRODUCT: ', product)
      if (product) {
        return res.status(409).json({
          code: 'DUPLICATEDATA',
          message: product.active ? 'Product already exists' : 'Product exists in recycle bin',
        })
      }

      const productQuery = {
        title: title,
        slug: slug,
        company: company,
      }

      const success = await Product.create(productQuery)
      console.log(success)
      if (success) {
        return res.status(200).json({
          code: 'CREATED',
          message: 'Product created successfully!!',
          id: success?._id,
        })
      } else {
        return res.status(400).json({ code: 'ERROROCCURED', message: 'Product not created.' })
      }
    } catch (error) {
      console.log('ERROR: ', 'Something Broken!!')
      return res.status(500).json({ code: 'ERROROCCURED', message: 'Something Broken!!' })
    }
  },

  //----------------------Update a Product API--------------------//
  //Tested
  updateProduct: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      if ((req.user!.role as any).slug == 'superadmin')
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'SUPER-ADMIN CAN NOT UPDATE ANY PRODUCT!!',
        })
      const { title } = req.body
      if (!title) return res.status(400).json({ code: 'INVALID_TITLE', message: 'Title is required' })
      if (title && typeof title !== 'string')
        return res.status(400).json({ code: 'INVALID_TITLE', message: 'Title should be string' })

      const id = req?.params?.id

      const productExists = await Product.findOne({ slug: slugify(title) }, { active: 1 })

      if (productExists)
        return res.status(400).json({
          message: productExists?.active
            ? 'Same name product already exists.'
            : 'Same name product already exists in recycle bin.',
        })

      const updatedProduct = await Product.findByIdAndUpdate(
        { _id: id, company: (req?.user?.company as any)?._id },
        {
          title: title,
          slug: title && slugify(title),
        },
        { new: true }
      )

      if (updatedProduct) {
        return res.status(200).json({ code: 'UPDATED', message: 'Product has been updated !!' })
      } else return res.status(400).json({ code: 'NOT UPDATED', message: 'Product not updated.' })
    } catch (error) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        message: 'Something Broken!!',
      })
    }
  },

  //-------------------------Delete a Product-----------------------//
  //Tested
  deleteProduct: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      if ((req.user!.role as any).slug == 'superadmin')
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'SUPER-ADMIN CAN NOT DELETE ANY PRODUCT !!',
        })

      const id = req?.params?.id
      const deletedProduct = await Product.findByIdAndUpdate(
        {
          _id: id,
          company: (req?.user?.company as any)?._id,
        },
        {
          $set: {
            active: false,
            deletedBy: { userId: req?.user?._id, time: new Date() },
          },
        },
        { new: true }
      )

      return res.status(200).json({ code: 'DELETED', message: 'Product has been deleted !!' })
    } catch (error) {
      return res.status(400).json({ code: 'ERROROCCURED', message: error })
    }
  },

  //--------------Get All Products-----------------------//
  getAllProduct: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { searchTitle, search, page, limit, sort, order } = req.query
      let title: string = searchTitle ? (searchTitle as string) : 'title'
      let sortTitle: string = sort ? (sort as string) : 'createdAt'
      const sortOrder = order === 'ascending' ? 1 : -1
      const pageNum = page ? parseInt(page as string) : 1
      const limitNum = limit ? parseInt(limit as string) : 10
      let match: any = { $match: { status: true } }

      if (req?.roleData?.slug == 'superadmin') {
        match = {
          $match: {
            active: true,
          },
        }
      } else {
        match = {
          $match: {
            company: new Types.ObjectId((req?.user?.company as any)?._id),
            active: true,
          },
        }
      }

      const products = Product.aggregate([
        { $set: { title: { $toLower: '$title' } } },
        match,
        { $match: { [title]: { $regex: search || '', $options: 'si' } } },
        {
          $lookup: {
            from: 'preRegistration',
            localField: '_id',
            foreignField: 'product',
            pipeline: [
              match,
              {
                $group: {
                  _id: null,
                  countrySize: { $addToSet: '$country' },
                },
              },
              {
                $project: {
                  _id: 0,
                  countrySize: { $size: '$countrySize' },
                },
              },
            ],
            as: 'country',
          },
        },
        { $unwind: { path: '$country', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1,
            slug: 1,
            active: 1,
            country: { $cond: ['$country', '$country.countrySize', 0] },
            createdAt: 1,
          },
        },
        {
          $facet: {
            data: limitNum
              ? [{ $sort: { [sortTitle]: sortOrder } }, { $skip: (pageNum - 1) * limitNum }, { $limit: limitNum }]
              : [{ $sort: { [sortTitle]: sortOrder } }],
            count: [{ $count: 'totalCount' }],
          },
        },
        { $unwind: { path: '$count', preserveNullAndEmptyArrays: false } },
        { $set: { count: '$count.totalCount' } },
      ])

      products.exec(async (error, result) => {
        if (result) return res.status(200).json({ code: 'FETCHED', data: result[0] || {} })
        else return res.status(400).json({ code: 'ERROROCCURED', message: error })
      })

      return res.status(200).end()
    } catch (error) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        data: error,
      })
    }
  },

  //-------------------------Country Map Data to show on 5 country graph-------------------//
  //Tested
  countrymap: (req: RequestWithUser, res: Response): void => {
    let geoData: any[] = []
    let productArray: any[] = []
    let data
    if (req.user && req.user.role && (req.user!.role as any).slug == 'superadmin') {
      data = Product.find({ active: true }).populate('country')
    } else {
      data = Product.find({
        company: req.user!.company,
        active: true,
      }).populate('country')
    }
    data.exec((error, result) => {
      if (result) {
        result.map(async (item: any, index: number, arr: any[]) => {
          await geoData.push({
            country: item.country && item.country.slug,
            product: arr
              .filter((x: any) => item.country.title == x.country.title)
              .map((item: any) => {
                return { title: item.title }
              }),
          })
        })

        const filtered = geoData.filter(
          (tag: any, index: number, array) => array.findIndex((t: any) => t.country == tag.country) == index
        )

        let pieData: any[] = []
        let pieValue: any[] = []
        let total = 0
        for (let i = 0; i <= filtered.length - 1; i++) {
          pieData.push({
            name: filtered[i].country.toUpperCase(),
            value: filtered[i].product.length,
          })
          pieValue.push({ total: (total += filtered[i].product.length) })
        }

        pieData.sort((a, b) => b.value - a.value)
        return res.status(200).json({
          code: 'FETCHED',
          data: pieData.slice(0, 5),
          total: total,
        })
      } else {
        return res.status(400).json({
          code: 'ERROROCCURED',
          data: error,
        })
      }
    })
  },

  //-----------------------Get data to show on dashboard -------------------//
  //Tested
  totalRegisteredProducts: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      var registeredProducts, preRegistration, currentVariation, nonRenewed
      let productFileter: any = {}
      productFileter['registrationNo'] = { $ne: null }
      productFileter['active'] = true
      let PreRegistrationFileter: any = {}
      PreRegistrationFileter['stage'] = { $ne: 'registered' }
      PreRegistrationFileter['active'] = true
      let VariationFileter: any = {}
      VariationFileter['approval'] = 'not-received'
      VariationFileter['status'] = true
      let RenewalFileter: any = {}
      RenewalFileter['stage'] = { $nin: ['renew', 'registered'] }
      RenewalFileter['status'] = true

      if (req.user && req.user.role && (req.user!.role as any).slug !== 'superadmin') {
        productFileter['company'] = req.user.company
        PreRegistrationFileter['company'] = req.user.company
        VariationFileter['company'] = req.user.company
        RenewalFileter['company'] = req.user.company
      }

      registeredProducts = await Product.find(productFileter).countDocuments()
      preRegistration = await PreRegistration.find(PreRegistrationFileter).countDocuments()
      currentVariation = await Variation.find(VariationFileter).countDocuments()
      nonRenewed = await Renewal.find(RenewalFileter).countDocuments()
      let data = {
        totalProducts: registeredProducts,
        totalPreRegistration: preRegistration,
        totalVariation: currentVariation,
        totalNonRenewed: nonRenewed,
      }
      return res.status(200).json({
        code: 'FETCHED',
        data,
      })
    } catch (error) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        data: 'Something Broken!!',
      })
    }
  },

  //---------------------------------Get All data to show on world Map-------------------------//
  //Tested
  countryWiseData: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      var data
      if (req.user && req.user.role && (req.user!.role as any).slug == 'superadmin') {
        data = await Product.find({ active: true }).populate('country')
        let countryId = data.map((items: any) => {
          return items.country._id
        })
        var uniqueCountryID = [...new Set(countryId)]
        var responseData = []
        for (var value1 of uniqueCountryID) {
          var countries = await Country.find({ _id: value1 })
          var title = countries[0].title
          var registeredProducts = await Product.find({
            registrationNo: { $ne: null },
            country: value1,
            active: true,
          })
          var totalProducts = registeredProducts.length
          var preRegistration = await Product.find({
            registrationNo: { $eq: null },
            country: value1._id,
            active: true,
          })
          var totalPreRegistration = preRegistration.length
          var totalVariation = 0
          var totalNonRenewed = 0
          for (var value of registeredProducts) {
            var currentVariation = await Variation.find({
              approval: 'not-received',
              product: value._id,
              status: true,
            })
            var nonRenewed = await Renewal.find({
              stage: { $nin: ['renew', 'registered'] },
              product: value._id,
              status: true,
            })
            totalNonRenewed = nonRenewed.length
            totalVariation = currentVariation.length
          }
          responseData.push({
            country: title,
            totalProducts,
            totalPreRegistration,
            totalVariation,
            totalNonRenewed,
          })
        }
      } else {
        data = await Product.find({
          company: req.user!.company,
          active: true,
        }).populate('country')
        let countryId = data.map((items: any) => {
          return items.country._id
        })
        var uniqueCountryID = [...new Set(countryId)]
        var responseData = []
        for (var value1 of uniqueCountryID) {
          var countries = await Country.find({ _id: value1 })
          var title = countries[0].title
          var registeredProducts = await Product.find({
            company: req.user!.company,
            registrationNo: { $ne: null },
            country: value1,
            active: true,
          })
          var totalProducts = registeredProducts.length
          var preRegistration = await Product.find({
            company: req.user!.company,
            registrationNo: { $eq: null },
            country: value1._id,
            active: true,
          })
          var totalPreRegistration = preRegistration.length
          var totalVariation = 0
          var totalNonRenewed = 0
          for (var value of registeredProducts) {
            var currentVariation = await Variation.find({
              company: req.user!.company,
              approval: 'not-received',
              product: value._id,
              status: true,
            })
            var nonRenewed = await Renewal.find({
              company: req.user!.company,
              stage: { $nin: ['renew', 'registered'] },
              product: value._id,
              status: true,
            })

            totalNonRenewed = nonRenewed.length
            totalVariation = currentVariation.length
          }
          responseData.push({
            country: title,
            totalProducts,
            totalPreRegistration,
            totalVariation,
            totalNonRenewed,
          })
        }
      }

      return res.status(200).json({
        code: 'FETCHED',
        data: responseData,
      })
    } catch (error) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        data: 'Something Broken!!',
      })
    }
  },

  countryMapData: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const country =
        req.user && req.user.role && (req.user!.role as any).slug == 'superadmin'
          ? await Product.find({ active: true }).distinct('country')
          : await Product.find({
              company: req.user!.company,
              active: true,
            }).distinct('country')

      var myPromise = country.map(async (item) => {
        return new Promise(async (resolve, reject) => {
          const countryDoc = await Country.findById({ _id: item })
          const registered =
            req.user && req.user.role && (req.user!.role as any).slug == 'superadmin'
              ? await Product.count({
                  registrationNo: { $ne: null },
                  country: item,
                  active: true,
                })
              : await Product.count({
                  company: req.user!.company,
                  registrationNo: { $ne: null },
                  country: item,
                  active: true,
                })
          const pre =
            req.user && req.user.role && (req.user!.role as any).slug == 'superadmin'
              ? await Product.count({
                  registrationNo: { $eq: null },
                  country: item,
                  active: true,
                })
              : await Product.count({
                  company: req.user!.company,
                  registrationNo: { $eq: null },
                  country: item,
                  active: true,
                })
          const variation = await Variation.aggregate([
            {
              $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'country',
              },
            },
            { $unwind: '$country' },
            req.user && req.user.role && (req.user!.role as any).slug == 'superadmin'
              ? {
                  $match: {
                    'country.country': new mongoose.Types.ObjectId(item),
                    approval: 'not-received',
                    status: true,
                  },
                }
              : {
                  $match: {
                    company: req.user!.company,
                    'country.country': new mongoose.Types.ObjectId(item),
                    approval: 'not-received',
                    status: true,
                  },
                },
          ])

          const renewal = await Renewal.aggregate([
            {
              $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'country',
              },
            },
            { $unwind: '$country' },
            req.user && req.user.role && (req.user!.role as any).slug == 'superadmin'
              ? {
                  $match: {
                    stage: { $nin: ['renew', 'registered'] },
                    'country.country': new mongoose.Types.ObjectId(item),
                    status: true,
                  },
                }
              : {
                  $match: {
                    company: req.user!.company,
                    stage: { $nin: ['renew', 'registered'] },
                    'country.country': new mongoose.Types.ObjectId(item),
                    status: true,
                  },
                },
          ])
          resolve({
            totalProducts: registered,
            totalPreRegistration: pre,
            totalVariation: variation && variation.length,
            totalNonRenewed: renewal && renewal.length,
            country: countryDoc && countryDoc.title,
          })
        })
      })
      Promise.all(myPromise)
        .then((result) => {
          return res.status(200).json({
            code: 'FETCHED',
            data: result.sort((a: any, b: any) => a.country.localeCompare(b.country)),
          })
        })
        .catch((error) => {
          return res.status(400).json({
            code: 'ERROROCCURED',
            data: 'Something Broken!!',
          })
        })
      return res.status(200).end()
    } catch (err: any) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        data: err.message,
      })
    }
  },

  //-------------------------------Get distinct Product Name----------------------------//
  //Tested
  getUniqueProductNames: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      let UniqueProducts
      if (req.user && req.user.role && (req.user!.role as any).slug == 'superadmin') {
        UniqueProducts = await Product.find({ active: true }).sort({ slug: 1 }).distinct('slug')
      } else {
        UniqueProducts = await Product.find({
          company: req.user!.company,
          active: true,
        })
          .sort({ slug: 1 })
          .distinct('slug')
      }

      if (UniqueProducts) {
        return res.status(200).json({
          code: 'FETCHED',
          data: UniqueProducts,
        })
      } else {
        return res.status(200).json({
          code: 'FETCHED',
          data: [],
        })
      }
    } catch (error) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        data: 'Something Broken!!',
      })
    }
  },

  //---------------------Get All products of same name from each country by product Name--------------------//
  //Tested
  getProductsByProductNames: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      let data
      if (req.user && req.user.role && (req.user!.role as any).slug == 'superadmin') {
        data = await Product.aggregate([
          {
            $project: {
              _id: 1,
              title: 1,
              slug: 1,
              result: 1,
              registrationNo: 1,
              registrationDate: 1,
              company: 1,
              remark: 1,
              active: 1,
              country: 1,
            },
          },
          {
            $lookup: {
              from: 'countries',
              localField: 'country',
              foreignField: '_id',
              as: 'country',
            },
          },
          {
            $match: {
              active: true,
              slug: req.params.slug,
            },
          },
          { $sort: { 'country.title': 1 } },
        ])
      } else {
        data = await Product.aggregate([
          {
            $project: {
              _id: 1,
              title: 1,
              slug: 1,
              result: 1,
              registrationNo: 1,
              registrationDate: 1,
              company: 1,
              remark: 1,
              active: 1,
              country: 1,
            },
          },
          {
            $lookup: {
              from: 'countries',
              localField: 'country',
              foreignField: '_id',
              as: 'country',
            },
          },

          {
            $match: {
              active: true,
              slug: req.params.slug,
            },
          },
          {
            $sort: { 'country.title': 1 },
          },
        ])
      }

      return res.status(200).json({
        code: 'FETCHED',
        data: data,
      })
    } catch (error) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        data: error,
      })
    }
  },

  //-----------------------------Get All Products from a Particular Country by country Name(Slug)---------------//
  //Tested
  getProductDetailsByCountry: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      let country
      let productDetails
      if (req.user && req.user.role && (req.user!.role as any).slug == 'superadmin') {
        country = await Country.find({ slug: req.body.slug })
        if (country) {
          productDetails = await Product.find({
            country: country[0]._id,
            active: true,
          }).sort({ title: 1 })
        }
      } else {
        country = await Country.find({
          slug: req.body.slug,
        })
        if (country) {
          productDetails = await Product.find({
            country: country[0]._id,
            company: req.user!.company,
            active: true,
          }).sort({ title: 1 })
        }
      }
      return res.status(200).json({
        code: 'FETCHED',
        data: productDetails,
      })
    } catch (error) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        data: error,
      })
    }
  },
}

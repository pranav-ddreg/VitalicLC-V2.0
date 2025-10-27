import { Types } from 'mongoose'
import PreRegistration from '../model/preregistration'
import Renewal from '../model/renewal'
import { Request, Response, RequestWithUser } from '../types/interfaces'

export default {
  renewedYear: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const renewalYear = await Renewal.aggregate([
        {
          $lookup: {
            from: 'preRegistration',
            localField: 'preregistration',
            foreignField: '_id',
            as: 'preregistrationData',
          },
        },
        { $match: { 'preregistrationData.active': true, status: true } },
        {
          $group: {
            _id: null,
            year: {
              $addToSet: { $year: '$renewDate' },
            },
          },
        },
        { $unwind: '$year' },
        {
          $sort: { year: 1 },
        },
        { $unset: '_id' },
        { $project: { year: '$year' } },
      ])

      return res.status(200).json({
        message: 'Year fetched successfully!!',
        data: renewalYear || {},
      })
    } catch (error) {
      console.log('Error: ' + 'Something Broken!!')
      return res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  preRegistrationYear: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const preRegistrationYear = await PreRegistration.aggregate([
        { $match: { active: true, registrationDate: { $ne: null } } },
        { $sort: { registrationDate: 1 } },
        {
          $group: {
            _id: null,
            year: {
              $addToSet: { $year: '$registrationDate' },
            },
          },
        },
        { $unwind: '$year' },
        {
          $sort: { year: 1 },
        },
        { $unset: '_id' },
        { $project: { year: '$year' } },
      ])

      return res.status(200).json({
        message: 'preRegistration year fetched successfully!!',
        data: preRegistrationYear || {},
      })
    } catch (error) {
      console.log('Error: ' + 'Something Broken!!')
      return res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  alertReport: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { year } = req.query

      let reportMatch: any = {
        status: true,
        company: new Types.ObjectId((req?.user?.company as any)?._id),
      }
      if (req?.roleData?.slug == 'superadmin') reportMatch = { status: true }
      if (year) reportMatch.year = year

      const reportData = await Renewal.aggregate([
        { $set: { year: { $substr: ['$renewDate', 0, 4] } } },
        { $match: reportMatch },
        {
          $lookup: {
            from: 'preRegistration',
            localField: 'preregistration',
            foreignField: '_id',
            pipeline: [
              { $match: { active: true, stage: { $nin: ['not-retained', 'discontinued'] } } },
              {
                $lookup: {
                  from: 'products',
                  localField: 'product',
                  foreignField: '_id',
                  pipeline: [
                    { $match: { active: true } },
                    {
                      $project: { title: 1 },
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
                  pipeline: [{ $project: { title: 1 } }],
                  as: 'country',
                },
              },
              {
                $unwind: { path: '$product', preserveNullAndEmptyArrays: true },
              },
              {
                $unwind: { path: '$country', preserveNullAndEmptyArrays: true },
              },
              {
                $project: {
                  _id: 0,
                  product: '$product.title',
                  country: '$country.title',
                  renewalDate: 1,
                },
              },
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
            product: '$preregistration.product',
            country: '$preregistration.country',
            renewalDate: '$preregistration.renewalDate',
            year: 1,
            stage: 1,
            expSubmitDate: 1,
            expInitiateDate: 1,
            renewDate: 1,
            initiateDate: 1,
            submitDate: 1,
          },
        },
      ])

      return res.status(200).json({
        message: 'alert report data fetched successfully!!',
        data: reportData,
      })
    } catch (error) {
      console.log('ERROR: ' + 'Something Broken!!')
      return res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  expectedActual: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { year, country } = req.query

      let actExpMatch: any = {
        $match: {
          active: true,
          registrationDate: { $ne: null },
          expApprovalDate: { $exists: true },
          company: new Types.ObjectId((req?.user?.company as any)?._id),
        },
      }
      if ((req.user!.role as any).slug == 'superadmin')
        actExpMatch = {
          $match: {
            active: true,
            registrationDate: { $ne: null },
            expApprovalDate: { $exists: true },
          },
        }

      let expvpMatch: any = {}
      if (year) expvpMatch.year = year
      if (country) expvpMatch.country = country

      const expavp = await PreRegistration.aggregate([
        actExpMatch,
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
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$country', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            year: { $substr: ['$registrationDate', 0, 4] },
            product: '$product.title',
            country: '$country.title',
            ExpectedDays: {
              $ceil: {
                $divide: [
                  {
                    $abs: {
                      $subtract: ['$expApprovalDate', '$submissionDate'],
                    },
                  },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
            ActualDays: {
              $ceil: {
                $divide: [
                  {
                    $abs: {
                      $subtract: ['$registrationDate', '$submissionDate'],
                    },
                  },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
            expDate: '$expApprovalDate',
            actualDate: '$registrationDate',
          },
        },
        { $match: expvpMatch },
      ])

      return res.status(200).json({
        message: 'Actual and expected data fetched successfully!!',
        data: expavp || {},
      })
    } catch (error) {
      console.log('Error: ' + 'Something Broken!!')
      return res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  dashboard: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      let match: any = {
        $match: { active: true, company: new Types.ObjectId((req?.user?.company as any)?._id) },
      }
      if (req.roleData!.slug == 'superadmin') match = { $match: { active: true } }

      let currDate = new Date()

      let renewalVariationMatch: any = {
        status: true,
        company: new Types.ObjectId((req?.user?.company as any)?._id),
      }
      if (req.roleData?.slug == 'superadmin') renewalVariationMatch = { status: true }

      let headlineMatch: any = {
        status: true,
        company: new Types.ObjectId((req?.user?.company as any)?._id),
        year: `${new Date().getFullYear()}`,
      }
      if (req?.roleData?.slug == 'superadmin') headlineMatch = { status: true, year: `${new Date().getFullYear()}` }

      const dashboardData = await PreRegistration.aggregate([
        match,
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'productData',
          },
        },
        {
          $match: {
            'productData.active': true,
          },
        },
        {
          $project: {
            product: 1,
            country: 1,
            company: 1,
            active: 1,
            registrationNo: 1,
            createdAt: 1,
            stage: 1,
            approvalDate: 1,
            expApprovalDate: 1,
            submissionDate: 1,
          },
        },
        {
          $facet: {
            topCountry:
              req?.roleData?.slug == 'superadmin'
                ? [
                    {
                      $lookup: {
                        from: 'countries',
                        localField: 'country',
                        foreignField: '_id',
                        pipeline: [{ $project: { title: 1 } }],
                        as: 'country',
                      },
                    },
                    { $unwind: '$country' },
                    { $project: { product: 1, country: 1 } },
                    {
                      $group: {
                        _id: '$country.title',
                        product: { $addToSet: '$product' },
                      },
                    },
                    {
                      $project: {
                        _id: 0,
                        country: '$_id',
                        product: { $size: '$product' },
                      },
                    },
                    { $sort: { product: -1 } },
                    { $limit: 5 },
                  ]
                : [
                    { $group: { _id: null } },
                    {
                      $lookup: {
                        from: 'companies',
                        pipeline: [
                          {
                            $match: {
                              _id: new Types.ObjectId((req?.user?.company as any)?._id),
                            },
                          },
                          {
                            $lookup: {
                              from: 'countries',
                              let: { id: '$countryIds' },
                              pipeline: [
                                {
                                  $addFields: {
                                    approvalDays: {
                                      $toString: '$approvalDays',
                                    },
                                    launchDays: { $toString: '$launchDays' },
                                    initiateDays: {
                                      $toString: '$initiateDays',
                                    },
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
                                            : {
                                                active: true,
                                                company: new Types.ObjectId((req?.user?.company as any)?._id),
                                              },
                                      },
                                      {
                                        $group: {
                                          _id: null,
                                          productSize: {
                                            $addToSet: '$product',
                                          },
                                        },
                                      },
                                      {
                                        $project: {
                                          _id: 0,
                                          productSize: {
                                            $size: '$productSize',
                                          },
                                        },
                                      },
                                    ],
                                    as: 'product',
                                  },
                                },
                                {
                                  $unwind: {
                                    path: '$product',
                                    preserveNullAndEmptyArrays: true,
                                  },
                                },
                                {
                                  $project: {
                                    _id: 0,
                                    country: '$title',
                                    product: {
                                      $cond: ['$product', '$product.productSize', 0],
                                    },
                                  },
                                },
                                { $sort: { product: -1 } },
                                { $limit: 5 },
                              ],
                              as: 'data',
                            },
                          },
                          { $unwind: '$data' },
                          {
                            $project: { _id: 0, data: 1 },
                          },
                        ],
                        as: 'variation',
                      },
                    },
                    { $unwind: '$variation' },
                    { $project: { _id: 0, variation: '$variation.data' } },
                  ],
            approval: [{ $match: { active: true, registrationNo: { $ne: null } } }],
            preRegistration: [{ $match: { stage: { $ne: 'registered' }, active: true } }],
            totalPreRegistration: [{ $match: { active: true, stage: { $ne: ['not-retained', 'discontinued'] } } }],
            registeredPreRegistration: [{ $match: { stage: 'registered', active: true } }],
            underProcessPreRegistration: [{ $match: { stage: 'under-process', active: true } }],
            underRegisterPreRegistration: [{ $match: { stage: 'under-registration', active: true } }],
            latestPreRegistration: [
              { $sort: { createdAt: -1 } },
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
                $unwind: {
                  path: '$product',
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  product: 1,
                  approvalDate: 1,
                  expApprovalDate: 1,
                  stage: 1,
                },
              },
              { $limit: 5 },
            ],
            totalVariation: [
              { $group: { _id: null } },
              {
                $lookup: {
                  from: 'variation',
                  pipeline: [{ $match: renewalVariationMatch }],
                  as: 'variation',
                },
              },
              { $project: { _id: 0, variation: { $size: '$variation' } } },
            ],
            approvedVariation: [
              { $group: { _id: null } },
              {
                $lookup: {
                  from: 'variation',
                  pipeline: [{ $match: renewalVariationMatch }, { $match: { approval: 'approved' } }],
                  as: 'variation',
                },
              },
              { $project: { _id: 0, variation: { $size: '$variation' } } },
            ],
            rejectedVariation: [
              { $group: { _id: null } },
              {
                $lookup: {
                  from: 'variation',
                  pipeline: [{ $match: renewalVariationMatch }, { $match: { approval: 'rejected' } }],
                  as: 'variation',
                },
              },
              { $project: { _id: 0, variation: { $size: '$variation' } } },
            ],
            latestVariation: [
              { $group: { _id: null } },
              {
                $lookup: {
                  from: 'variation',
                  pipeline: [
                    { $match: renewalVariationMatch },
                    { $sort: { createdAt: -1 } },
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
                            $unwind: {
                              path: '$product',
                              preserveNullAndEmptyArrays: true,
                            },
                          },
                          { $project: { product: 1 } },
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
                        preregistration: 1,
                        title: 1,
                        stage: 1,
                        approvalDate: 1,
                        expApprovalDate: 1,
                        approval: 1,
                      },
                    },
                  ],
                  as: 'variation',
                },
              },
              { $project: { variation: 1 } },
              { $limit: 5 },
            ],
            totalRenewal: [
              { $group: { _id: null } },
              {
                $lookup: {
                  from: 'renewal',
                  pipeline: [
                    { $match: renewalVariationMatch },
                    {
                      $lookup: {
                        from: 'preRegistration',
                        localField: 'preregistration',
                        foreignField: '_id',
                        as: 'preregistrationData',
                      },
                    },
                    {
                      $match: {
                        'preregistrationData.active': true,
                        status: true,
                      },
                    },
                  ],
                  as: 'renewal',
                },
              },
              { $project: { _id: 0, renewal: { $size: '$renewal' } } },
            ],
            renewal: [
              { $group: { _id: null } },
              {
                $lookup: {
                  from: 'renewal',
                  pipeline: [
                    {
                      $lookup: {
                        from: 'preRegistration',
                        localField: 'preregistration',
                        foreignField: '_id',
                        as: 'preregistrationData',
                      },
                    },
                    {
                      $match: {
                        'preregistrationData.active': true,
                        ...renewalVariationMatch,
                      },
                    },
                    { $match: { stage: 'renew' } },
                  ],
                  as: 'renewal',
                },
              },
              { $project: { _id: 0, renewal: { $size: '$renewal' } } },
            ],
            submittedRenewal: [
              { $group: { _id: null } },
              {
                $lookup: {
                  from: 'renewal',
                  pipeline: [
                    {
                      $lookup: {
                        from: 'preRegistration',
                        localField: 'preregistration',
                        foreignField: '_id',
                        as: 'preregistrationData',
                      },
                    },
                    {
                      $match: {
                        'preregistrationData.active': true,
                        ...renewalVariationMatch,
                      },
                    },
                    {
                      $match: {
                        $or: [{ stage: 'registered' }, { stage: 'submit' }],
                      },
                    },
                  ],
                  as: 'renewal',
                },
              },
              { $project: { _id: 0, renewal: { $size: '$renewal' } } },
            ],
            latestRenewal: [
              { $group: { _id: null } },
              {
                $lookup: {
                  from: 'renewal',
                  pipeline: [
                    { $match: renewalVariationMatch },
                    { $sort: { createdAt: -1 } },
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
                              pipeline: [
                                { $match: { active: true } },
                                {
                                  $project: { title: 1 },
                                },
                              ],
                              as: 'product',
                            },
                          },
                          {
                            $unwind: {
                              path: '$product',
                              preserveNullAndEmptyArrays: true,
                            },
                          },
                          { $project: { product: 1 } },
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
                      $match: {
                        preregistration: { $exists: true },
                      },
                    },
                    {
                      $project: {
                        preregistration: 1,
                        stage: 1,
                        renewDate: 1,
                        initiateDate: 1,
                        submitDate: 1,
                      },
                    },
                  ],
                  as: 'renewal',
                },
              },
              { $project: { renewal: 1 } },
              { $limit: 5 },
            ],
            headlineRenewal: [
              { $group: { _id: null } },
              {
                $lookup: {
                  from: 'renewal',
                  pipeline: [
                    { $set: { year: { $substr: ['$createdAt', 0, 4] } } },
                    { $match: headlineMatch },
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
                              pipeline: [
                                { $match: { active: true } },
                                {
                                  $project: { title: 1 },
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
                              pipeline: [{ $project: { title: 1 } }],
                              as: 'country',
                            },
                          },
                          {
                            $unwind: {
                              path: '$product',
                              preserveNullAndEmptyArrays: true,
                            },
                          },
                          {
                            $unwind: {
                              path: '$country',
                              preserveNullAndEmptyArrays: true,
                            },
                          },
                          {
                            $project: {
                              _id: 0,
                              product: '$product.title',
                              country: '$country.title',
                            },
                          },
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
                        product: '$preregistration.product',
                        country: '$preregistration.country',
                        year: 1,
                        stage: 1,
                        createdAt: 1,
                      },
                    },
                    { $limit: 2 },
                  ],
                  as: 'renewal',
                },
              },
              {
                $lookup: {
                  from: 'variation',
                  pipeline: [
                    { $set: { year: { $substr: ['$createdAt', 0, 4] } } },
                    { $match: headlineMatch },
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
                              pipeline: [
                                { $match: { active: true } },
                                {
                                  $project: { title: 1 },
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
                              pipeline: [{ $project: { title: 1 } }],
                              as: 'country',
                            },
                          },
                          {
                            $unwind: {
                              path: '$product',
                              preserveNullAndEmptyArrays: true,
                            },
                          },
                          {
                            $unwind: {
                              path: '$country',
                              preserveNullAndEmptyArrays: true,
                            },
                          },
                          {
                            $project: {
                              _id: 0,
                              product: '$product.title',
                              country: '$country.title',
                            },
                          },
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
                    { $match: { approvalDate: { $ne: null } } },
                    {
                      $project: {
                        product: '$preregistration.product',
                        country: '$preregistration.country',
                        year: 1,
                        stage: 1,
                        approvalDate: 1,
                      },
                    },
                    { $limit: 2 },
                  ],
                  as: 'variation',
                },
              },
            ],
            expireHeadline: [
              { $group: { _id: null } },
              {
                $lookup: {
                  from: 'renewal',
                  pipeline: [
                    { $set: { year: { $substr: ['$renewDate', 0, 4] } } },
                    { $match: { ...renewalVariationMatch, renewDate: { $gte: currDate } } },
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
                              preserveNullAndEmptyArrays: true,
                            },
                          },
                          {
                            $unwind: {
                              path: '$country',
                              preserveNullAndEmptyArrays: true,
                            },
                          },
                          {
                            $project: {
                              _id: 0,
                              product: '$product.title',
                              country: '$country.title',
                            },
                          },
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
                      $addFields: {
                        currentDate: '$$NOW',
                      },
                    },
                    {
                      $project: {
                        product: '$preregistration.product',
                        country: '$preregistration.country',
                        stage: 1,
                        expireDays: {
                          $ceil: {
                            $divide: [
                              {
                                $abs: {
                                  $subtract: ['$renewDate', '$currentDate'],
                                },
                              },
                              1000 * 60 * 60 * 24,
                            ],
                          },
                        },
                      },
                    },
                    {
                      $match: {
                        $and: [{ expireDays: { $ne: null } }, { expireDays: { $lt: 90 } }, { expireDays: { $gt: 0 } }],
                      },
                    },
                  ],
                  as: 'renewal',
                },
              },
            ],
            countryMap: [
              { $group: { _id: null } },
              {
                $lookup: {
                  from: 'countries',
                  pipeline: [
                    { $project: { title: 1 } },
                    {
                      $lookup: {
                        from: 'preRegistration',
                        localField: '_id',
                        foreignField: 'country',
                        pipeline: [
                          {
                            $match:
                              req?.roleData?.slug == 'superadmin'
                                ? {
                                    active: true,
                                    registrationNo: { $ne: null },
                                  }
                                : {
                                    active: true,
                                    company: new Types.ObjectId((req?.user?.company as any)?._id),
                                    registrationNo: { $ne: null },
                                  },
                          },
                        ],
                        as: 'approval',
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
                                : {
                                    active: true,
                                    company: new Types.ObjectId((req?.user?.company as any)?._id),
                                  },
                          },
                          {
                            $project: {
                              product: 1,
                              country: 1,
                              registrationNo: 1,
                            },
                          },
                        ],
                        as: 'preregistration',
                      },
                    },
                    {
                      $lookup: {
                        from: 'variation',
                        localField: 'preregistration._id',
                        foreignField: 'preregistration',
                        pipeline: [
                          {
                            $match:
                              req?.roleData?.slug == 'superadmin'
                                ? { status: true }
                                : {
                                    status: true,
                                    company: new Types.ObjectId((req?.user?.company as any)?._id),
                                  },
                          },
                          { $project: { title: 1 } },
                        ],
                        as: 'variation',
                      },
                    },
                    {
                      $lookup: {
                        from: 'renewal',
                        localField: 'preregistration._id',
                        foreignField: 'preregistration',
                        pipeline: [
                          {
                            $match:
                              req?.roleData?.slug == 'superadmin'
                                ? { status: true }
                                : {
                                    status: true,
                                    company: new Types.ObjectId((req?.user?.company as any)?._id),
                                  },
                          },
                          { $project: { _id: 1 } },
                        ],
                        as: 'renewal',
                      },
                    },
                    { $match: { preregistration: { $ne: [] } } },
                    {
                      $project: {
                        title: 1,
                        approval: { $size: '$approval' },
                        preRegistration: { $size: '$preregistration' },
                        variations: { $size: '$variation' },
                        renewals: { $size: '$renewal' },
                      },
                    },
                  ],
                  as: 'country',
                },
              },
            ],
          },
        },
        { $unwind: '$totalVariation' },
        { $unwind: '$approvedVariation' },
        { $unwind: '$rejectedVariation' },
        { $unwind: '$latestVariation' },
        { $unwind: '$totalRenewal' },
        { $unwind: '$renewal' },
        { $unwind: '$submittedRenewal' },
        { $unwind: '$latestRenewal' },
        { $unwind: '$headlineRenewal' },
        { $unwind: '$expireHeadline' },
        { $unwind: '$countryMap' },
        {
          $project: {
            approval: { $size: '$approval' },
            preRegistration: { $size: '$preRegistration' },
            totalPreRegistration: { $size: '$totalPreRegistration' },
            registeredPreRegistration: { $size: '$registeredPreRegistration' },
            underProcessPreRegistration: {
              $size: '$underProcessPreRegistration',
            },
            underRegisterPreRegistration: {
              $size: '$underRegisterPreRegistration',
            },
            latestPreRegistration: 1,

            totalVariation: '$totalVariation.variation',
            approvedVariation: '$approvedVariation.variation',
            rejectedVariation: '$rejectedVariation.variation',
            latestVariation: '$latestVariation.variation',

            totalRenewal: '$totalRenewal.renewal',
            renewal: '$renewal.renewal',
            submittedRenewal: '$submittedRenewal.renewal',
            latestRenewal: '$latestRenewal.renewal',
            topCountry: req.roleData!.slug == 'superadmin' ? 1 : '$topCountry.variation',

            headlineRenewal: '$headlineRenewal',
            expireHeadline: '$expireHeadline.renewal',
            countryMap: '$countryMap.country',
          },
        },
      ])

      return res.status(200).json({ code: 'FETCHED', data: dashboardData[0] })
    } catch (error) {
      console.log('Error: ', 'Something Broken!!')
      console.log(error)
      return res.status(500).json({ code: 'ERROR', message: 'Something Broken!!' })
    }
  },

  search: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { search, page, limit } = req.query
      let match: any = {}
      if (req.roleData!.slug == 'superadmin') match = { active: true }
      else
        match = {
          active: true,
          company: new Types.ObjectId((req?.user?.company as any)?._id),
        }
      let searchData
      if (search) {
        searchData = await PreRegistration.aggregate([
          { $match: match },
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
          { $unwind: { path: '$country', preserveNullAndEmptyArrays: false } },
          { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
          {
            $match: {
              $or: [
                { 'product.title': { $regex: search || '', $options: 'si' } },
                { 'country.title': { $regex: search || '', $options: 'si' } },
              ],
            },
          },
          {
            $project: {
              product: 1,
              country: 1,
            },
          },
          {
            $facet: {
              data: limit
                ? [
                    { $sort: { createdAt: -1 } },
                    { $skip: (+(page as string) - 1) * +(limit as string) || 0 },
                    { $limit: +limit || 10 },
                  ]
                : [{ $sort: { createdAt: -1 } }],
              count: [{ $count: 'totalCount' }],
            },
          },
          { $unwind: { path: '$count', preserveNullAndEmptyArrays: false } },
          { $set: { count: '$count.totalCount' } },
        ])
      } else searchData = []

      return res.status(200).json({
        message: 'data fetched successfully!!',
        data: searchData[0] || {},
      })
    } catch (error) {
      console.log('Error: ' + 'Something Broken!!')
      return res.status(500).json({ code: 'ERROR', message: 'Something Broken!!' })
    }
  },
}

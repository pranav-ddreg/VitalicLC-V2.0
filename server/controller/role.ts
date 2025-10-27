import Role from '../model/role'
import { Types } from 'mongoose'
import slugify from 'slugify'
import { generatingEjsWithFieldToExportAndTitle } from '../services/ejsToPdf'
import { exportSelectedFieldsXLSX } from '../utils/exportSelectedFieldsCSV'
import { Request, Response, RequestWithUser } from '../types/interfaces'

export default {
  addRole: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { title, company, permissions } = req.body
      const slug = slugify(title, { lower: true })
      const roleName = req?.roleData?.slug
      var roleExist

      if (slug.includes('super') || title.includes('super')) {
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'Title does not include super keyword !!',
        })
      }
      if (permissions.includes('root') && roleName !== 'superadmin') {
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'Permissions does not include root keyword !!',
        })
      }

      if (roleName === 'superadmin' && req?.roleData?.permissions.includes('root')) {
        roleExist = await Role.findOne({ slug: slug, company: company })
      } else {
        roleExist = await Role.findOne({
          slug: slug,
          company: (req?.user?.company as any)?._id,
        })
      }

      if (roleExist)
        return res.status(409).json({
          code: 'ERROROCCURED',
          message: 'This role exist already !!',
        })

      const roleQuery = {
        title: title,
        slug: slug,
        company: company,
        permissions: permissions,
      }

      const role = new Role(roleQuery)
      role.save((error: any, result) => {
        if (result) return res.status(200).json({ code: 'CREATED', message: 'Role created successfully!!' })
        else return res.status(400).json({ code: 'ERROROCCURED', message: error })
      })
    } catch (error) {
      console.log('ERROR:', error)
      return res.status(500).send({ message: 'Something Broken!!' })
    }
    return res
  },

  getallRole: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { search, page, limit, sort, order, isDownload, filetype, listLess, selectedFields } = req.query
      const fieldsToExport = selectedFields ? JSON.parse(selectedFields as string) : []
      // Field mapping for frontend selectedFields to backend data field names
      const fieldMappings: { [key: string]: string } = {
        role: 'title',
        permissions: 'permissions',
        company: 'company',
      }
      // Map frontend selectedFields to backend field names
      const mappedSelectedFields = fieldsToExport.map((field: string) => fieldMappings[field] || field)
      const { slug, permissions } = req?.roleData!
      const companyId = (req?.user?.company as any)?._id
      let effectiveListLess = isDownload === 'true' ? 'false' : listLess // For exports, always use full projection
      let match: any = { $match: {} }
      let sortTitle: string = sort ? (sort as string) : 'createdAt'
      const pageNum = page ? parseInt(page as string) : 1
      const limitNum = limit ? parseInt(limit as string) : 10
      const sortOrder = order === 'ascending' ? 1 : -1
      if (sort === 'company') sortTitle = 'company.title'
      else sortTitle = sort ? (sort as string) : 'createdAt'
      if (slug === 'superadmin' && permissions?.includes('root')) {
        match = {
          $match: {
            slug: { $ne: 'superadmin' },
          },
        }
      } else {
        match = {
          $match: {
            slug: { $ne: 'superadmin' },
            permissions: { $ne: 'root' },
            company: new Types.ObjectId(companyId as string),
          },
        }
      }
      const rolesList = Role.aggregate([
        match,
        {
          $lookup: {
            from: 'companies',
            localField: 'company',
            foreignField: '_id',
            pipeline: [{ $project: { title: 1 } }],
            as: 'company',
          },
        },
        { $unwind: { path: '$company', preserveNullAndEmptyArrays: false } },
        {
          $match: {
            $or: [
              { title: { $regex: search || '', $options: 'si' } },
              { 'company.title': { $regex: search || '', $options: 'si' } },
            ],
          },
        },
        {
          $project:
            effectiveListLess === 'true'
              ? {
                  title: 1,
                  createdAt: 1,
                }
              : {
                  title: 1,
                  slug: 1,
                  permissions: 1,
                  company: 1,
                  createdAt: 1,
                  updatedAt: 1,
                },
        },
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
      await new Promise<Response>((resolve) => {
        rolesList.exec(async (error, result) => {
          if (result) {
            if (result.length === 0) return resolve(res.status(200).json({ code: 'FETCHED', data: {} }))
            if (isDownload === 'true') {
              if (filetype === 'xlsx') {
                const xlsxBuffer = await exportSelectedFieldsXLSX(result[0]?.data, mappedSelectedFields)
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                res.setHeader('Content-Disposition', 'attachment: filename=RoleData.xlsx')
                return resolve(res.status(200).send(xlsxBuffer))
              }
              if (filetype === 'pdf') {
                const { ok, fileBuffer, error } = await generatingEjsWithFieldToExportAndTitle(
                  'exportSelectedFields',
                  result[0]?.data,
                  mappedSelectedFields,
                  'Roles',
                  true
                )
                if (error) return resolve(res.status(400).json({ message: 'Something Broken!!' }))
                res.set('Content-Type', 'application/pdf')
                return resolve(res.status(200).send(fileBuffer))
              }
              return resolve(res.status(400).json({ message: 'Please provide proper file ' }))
            }
            return resolve(res.status(200).json({ code: 'FETCHED', data: result[0] || {} }))
          } else return resolve(res.status(400).json({ code: 'ERROROCCURED', message: error }))
        })
      })
      return res
    } catch (error) {
      console.log('Error: ' + error)
      return res.status(500).json({ message: 'Something Broke!' })
    }
  },

  getCompanyRole: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const id = req.params?.companyId

      const roleData = await Role.find({ company: id, slug: { $ne: 'superadmin' } }, { title: 1 })

      return res.status(200).json({ code: 'FETCHED', data: roleData })
    } catch (error) {
      console.log('Error: ' + 'Something Broken!!')
      return res.status(500).json({ message: 'Something Broken!!' })
    }
  },

  updateRole: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const id = req.params?.id
      const { title, company, permissions } = req.body
      const slug = title && slugify(title, { lower: true })

      const roleName = req?.roleData?.slug
      let roleExist

      if (roleName === 'superadmin' && req?.roleData?.permissions.includes('root')) {
        roleExist = await Role.findOne({ slug: slug, company: company })
      } else {
        roleExist = await Role.findOne({
          slug: slug,
          company: (req?.user?.company as any)?._id,
        })
      }

      if (roleExist && roleExist._id?.toString() !== id) {
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'This role exist already !!',
        })
      }
      if (slug.includes('super') || title.includes('super')) {
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'Title does not include super keyword !!',
        })
      }
      if (permissions.includes('root') && roleName !== 'superadmin') {
        return res.status(400).json({
          code: 'ERROROCCURED',
          message: 'Permissions does not include root keyword !!',
        })
      }

      const updateQuery: any = {
        company: company,
        permissions: permissions,
      }

      if (title) {
        updateQuery.title = title
        updateQuery.slug = slugify(title, { lower: true })
      }

      const updateRole = await Role.findOneAndUpdate({ _id: id }, { $set: updateQuery }, { new: true })

      if (!updateRole) return res.status(400).json({ code: 'NOT UPDATED', message: 'Role not updated.' })

      return res.status(200).json({ code: 'UPDATE', message: 'Role updated successfully!' })
    } catch (error) {
      console.log('ERROR: ' + 'Something Broken!!')
      return res.status(500).json({ code: 'ERROROCCURED', message: error })
    }
  },

  deleteRole: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = req.params?.id

      const deleteRole = await Role.findByIdAndDelete({ _id: id })
      if (!deleteRole) return res.status(400).json({ code: 'NOT DELETED', message: 'Role not deleted.' })

      return res.status(200).json({ code: 'DELETED', message: 'Role deleted Successfully!' })
    } catch (error) {
      console.log('Error: ' + error)
      return res.status(500).json({
        code: 'ERROROCCURED',
        message: error,
      })
    }
  },
}

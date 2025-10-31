import User from '../model/user'
import { hash, compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import Role from '../model/role'
import * as AWS from 'aws-sdk'
import { Types } from 'mongoose'
import * as Joi from 'joi'
import { generatingEjsWithFieldToExportAndTitle } from '../services/ejsToPdf'
import { loginNotificationEmail, sendOtpEmail } from '../utils/sendEmail'
import { exportSelectedFieldsXLSX } from '../utils/exportSelectedFieldsCSV'
import {
  Request,
  Response,
  RequestWithUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ApiResponse,
  GetAllUsersQuery,
} from '../types/interfaces'

require('dotenv').config()

// Log constants for AWS SES
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_KEY!,
  region: process.env.AWS_REGION!,
  apiVersion: '2010-12-01',
}

const SES = new AWS.SES(awsConfig)

// Helper function to create validation result object compatible with express-validator
const createValidationResult = (errors: Joi.ValidationError | null) => ({
  isEmpty: () => !errors,
  array: () => (errors ? errors.details.map((err) => ({ msg: err.message })) : []),
})

// Validation middleware factory - currently no validation (returns no errors)
const validationResult = (req: any) => createValidationResult(null)

// Note: Missing exportSelectedFieldsXLSX function - will be addressed in utils conversion

export default {
  // ------------Register-------------------------
  register: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ code: 'INVALID_INPUT', message: errors?.array()[0].msg })
        return
      } else {
        const { firstName, lastName, email, password, company, role }: RegisterRequest = req.body
        const { permissions, slug } = req?.roleData!

        const checkRole = await Role.findOne({ _id: role }, { permissions: 1 })

        if (checkRole?.permissions?.includes('root') && slug !== 'superadmin') {
          res.status(400).json({
            code: 'ERROROCCURED',
            message: "You don't have permission to add user",
          })
          return
        }

        const user = await User.findOne({ email: email }, { email: 1 })

        if (user) {
          res.status(409).json({ code: 'DUPLICATEDATA', message: 'Email already exist' })
          return
        }

        const hashedPassword = await hash(password, 10)

        if (hashedPassword) {
          const user = await User.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            company: company,
            role: role,
          })
          const params = { EmailAddress: email }

          try {
            await SES.verifyEmailIdentity(params).promise()
            console.log('Verification Email is sent')
          } catch (error) {
            console.log('Error while sending the verification email to user', error)
          }

          res.status(200).json({ code: 'CREATED', message: 'User added successfully!!' })
          return
        }
        res.status(500).json({ code: 'ERROROCCURED', message: 'Password hashing failed' })
        return
      }
    } catch (error: any) {
      console.log('Error :', error.message)
      res.status(500).json({ code: 'ERROROCCURED', message: error.message })
    }
  },

  //----------------Delete User-----------------------
  deleteUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params?.id

      const deletedUser = await User.findByIdAndDelete({ _id: id })

      if (!deletedUser) {
        res.status(400).json({ code: 'NOT DELETED', message: 'User not deleted.' })
        return
      }

      res.status(200).json({ code: 'DELETED', message: 'User has been deleted !!' })
    } catch (error: any) {
      res.status(400).json({
        code: 'ERROROCCURED',
        message: error.message,
      })
    }
  },

  //--------------------Update User-----------------
  updateUser: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ code: 'INVALID_INPUT', message: errors.array()[0].msg })
        return
      } else {
        const id = req.params?.id
        const { firstName, lastName, email, password, company, role } = req.body
        const { permissions, slug } = req?.roleData!

        if (!password) {
          res.status(400).json({ code: 'INVALID_INPUT', message: 'Password is required' })
          return
        }

        const checkRole = await Role.findOne({ _id: role }, { permissions: 1 })

        if (checkRole?.permissions?.includes('root') && slug !== 'superadmin') {
          res.status(400).json({
            code: 'ERROROCCURED',
            message: "You don't have permission to update user!!",
          })
          return
        }
        const user = await User.findOne({ email: email }, { email: 1, password: 1 })

        if (user && user?._id.toString() !== id) {
          res.status(409).json({ code: 'DUPLICATEDATA', message: 'Email already exist' })
          return
        }

        let updateQuery: any = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          company: company,
          role: role,
        }
        if (password) {
          const hashedPassword = await hash(password, 10)
          updateQuery.password = hashedPassword
        }

        const updatedUser = await User.findByIdAndUpdate({ _id: id }, { $set: updateQuery })
        if (!updatedUser) {
          res.status(400).json({ code: 'NOT UPDATED', message: 'User not updated' })
          return
        }

        res.status(200).json({ code: 'UPDATED', message: 'User has been updated !!' })
      }
    } catch (error: any) {
      res.status(400).json({
        code: 'ERROROCCURED',
        message: error.message,
      })
    }
  },

  //---------------------Login-----------------------------
  login: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ code: 'INVALID_INPUT', message: errors.array()[0].msg })
        return
      }

      const { email, password }: LoginRequest = req.body

      // Fetch user with company & plan in a single query
      const user = await User.findOne({ email })
        .populate({
          path: 'company',
          select: 'title email plan logo expiredOn',
          populate: {
            path: 'plan',
            select: 'plan slug price duration',
            model: 'Pricing',
          },
        })
        .lean()

      if (!user) {
        console.log('Login attempt with non-existent email:', email)
        res.status(404).json({ code: 'INVALID_EMAIL', message: 'User does not exist!' })
        return
      }

      // Check if account is locked
      if (user.isAccountLocked) {
        res.status(423).json({ code: 'ACCOUNT_LOCKED', message: 'Your account has been locked temporarily!' })
        return
      }

      // Verify password
      const isRightPassword = await compare(password, user.password)
      if (!isRightPassword) {
        const nextWrongAttempt = (user.wrongAttampt || 0) + 1
        const update: { wrongAttampt: number; isAccountLocked?: boolean } = { wrongAttampt: nextWrongAttempt }

        if (nextWrongAttempt >= 5) {
          update.isAccountLocked = true
        }

        await User.updateOne({ _id: user._id }, { $set: update as any })

        const leftAttempt = Math.max(0, 5 - nextWrongAttempt)

        // Fire-and-forget email
        loginNotificationEmail({
          firstName: user.firstName as string,
          lastName: user.lastName || 'User',
          recipientEmail: user.email,
        }).catch(() => {})

        if (nextWrongAttempt >= 5) {
          res.status(423).json({ code: 'ACCOUNT_LOCKED', message: 'Your account has been locked temporarily!' })
          return
        }

        res.status(400).json({
          code: 'UNAUTHORIZED',
          message: `Wrong password! Only ${leftAttempt} attempt(s) left!`,
        })
        return
      }

      // Reset wrong attempts on successful login
      await User.updateOne({ _id: user._id }, { $set: { wrongAttampt: 0, isAccountLocked: false } })

      // Check plan expiry
      const currentDate = new Date().toISOString().substring(0, 10)
      const expiredOn = (user.company as any)?.expiredOn
      if (expiredOn && expiredOn <= currentDate) {
        res.status(200).json({
          body: {
            code: 'PLANEXPIRED',
            verified: true,
          },
        })
        return
      }

      // Fetch role
      const roleData = await Role.findById(user.role, { title: 1, slug: 1, permissions: 1 }).lean()

      // Prepare company data based on permissions
      if (roleData) {
        let companyData = user.company ? JSON.parse(JSON.stringify(user.company)) : {}
        if (!roleData.permissions.includes('root')) {
          delete companyData.purchasedOn
          delete companyData.expiredOn
          delete companyData.plan
        }
        user.company = companyData
      }

      const payload: any = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        twoFactor: user.twoFactor,
        email: user.email,
        company: user.company,
        role: roleData,
      }

      // Issue token
      const token = sign(payload, process.env.TOKEN_KEY!, { expiresIn: '1d' })
      ;(req.session as any).token = token

      // Handle 2FA
      if (user.twoFactor) {
        const OTP = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')

        // Fire-and-forget OTP email
        User.updateOne({ _id: user._id }, { $set: { reset_otp: OTP } }).catch(() => {})
        sendOtpEmail({
          recipientEmail: email,
          firstName: user.firstName,
          otp: OTP,
          subject: 'Login OTP',
        }).catch((err) => console.log('OTP send error:', err))

        res.status(200).json({ code: 'OTP_SENT', message: 'OTP sent to your email' })
        return
      }

      res.status(200).json({ code: 'FETCHED', user: payload, token })
    } catch (error: any) {
      res.status(500).json({
        code: 'ERROROCCURED',
        message: error.message,
      })
    }
  },

  //------------------VerifyOtp-------------------------
  verifyOtp: async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(200).json({
          code: 'INVALID_INPUT',
          message: errors.array()[0].msg,
        })
        return
      } else {
        const { reset_otp } = req.body
        if (reset_otp != null) {
          const userExist = await User.findOne({ reset_otp: reset_otp }, { email: 1 })
          if (userExist) {
            res.status(200).json({
              code: 'OTP_VERIFIED',
              data: userExist?.email,
            })
            return
          } else {
            res.status(400).json({
              code: 'ERROROCCURED',
              message: 'Invalid OTP',
            })
            return
          }
        } else {
          res.status(400).json({
            code: 'ERROROCCURED',
            message: 'Please enter four digit OTP !!',
          })
          return
        }
      }
    } catch (error: any) {
      res.status(400).json({
        code: 'ERROROCCURED',
        message: error,
      })
    }
  },

  //---------------Update Password----------------
  updatePassword: async (req: Request, res: Response): Promise<void> => {
    const { email, password, otp } = req.body
    try {
      const hashedPassword = await hash(password, 10)
      const updatedUserPassword = await User.findOneAndUpdate(
        { email: email, otp: otp },
        { $set: { password: hashedPassword, reset_otp: null } }
      )
      if (updatedUserPassword) {
        res.status(200).json({
          code: 'UPDATED',
          data: 'Password reset successfully !!',
        })
        return
      } else {
        res.status(400).json({
          code: 'NOTUPDATED',
          data: 'User not exist !!',
        })
        return
      }
    } catch (error: any) {
      res.status(400).json({
        code: 'ERROROCCURED',
        message: error,
      })
    }
  },

  // --------- Get All uSer----------------------
  getAllUser: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const { searchTitle, search, page, limit, sort, order, isDownload, filetype, selectedFields }: GetAllUsersQuery =
        req.query
      const fieldsToExport = selectedFields ? JSON.parse(selectedFields) : []
      const { slug, permissions } = req?.roleData!
      let title = 'firstName'
      let match = { $match: {} }
      let roleMatch = { $match: {} }
      let sortTitle = 'createdAt'
      const sortOrder = order === 'ascending' ? 1 : -1

      if (sort === 'company') sortTitle = 'company.title'
      else if (sort === 'role') sortTitle = 'role.title'
      else sortTitle = sort ? sort : 'createdAt'

      if (searchTitle === 'company') title = 'company.title'
      else if (searchTitle === 'role') title = 'role.title'
      else title = searchTitle ? searchTitle : 'firstName'

      if (slug === 'superadmin' && permissions.includes('root')) match = { $match: {} }
      else match = { $match: { company: new Types.ObjectId((req?.user?.company as any)?._id) } }

      if (slug === 'superadmin' && permissions.includes('root')) roleMatch = { $match: { slug: { $ne: 'superadmin' } } }
      else
        roleMatch = {
          $match: {
            slug: { $ne: 'superadmin' },
            permissions: { $ne: 'root' },
            company: new Types.ObjectId((req?.user?.company as any)?._id),
          },
        }

      const usersData = User.aggregate([
        match,
        {
          $lookup: {
            from: 'companies',
            localField: 'company',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  title: 1,
                  email: 1,
                  logo: 1,
                },
              },
            ],
            as: 'company',
          },
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'role',
            foreignField: '_id',
            pipeline: [
              roleMatch,
              {
                $project: {
                  title: 1,
                  slug: 1,
                  permission: 1,
                },
              },
            ],
            as: 'role',
          },
        },
        { $unwind: { path: '$company', preserveNullAndEmptyArrays: false } },
        { $unwind: { path: '$role', preserveNullAndEmptyArrays: false } },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            email: 1,
            company: 1,
            role: 1,
            isAccountLocked: 1,
            reset_otp: 1,
            wrongAttampt: 1,
            createdAt: 1,
          },
        },
        {
          $match: {
            [title]: { $regex: search || '', $options: 'si' },
          },
        },
        {
          $facet: {
            data:
              isDownload === 'true'
                ? [{ $sort: { [sortTitle]: sortOrder } }]
                : limit
                  ? [
                      { $sort: { [sortTitle]: sortOrder } },
                      { $skip: (+(page || 1) - 1) * +limit || 0 },
                      { $limit: +limit || 10 },
                    ]
                  : [{ $sort: { [sortTitle]: sortOrder } }],
            count: [{ $count: 'totalCount' }],
          },
        },
        { $unwind: { path: '$count', preserveNullAndEmptyArrays: false } },
        { $set: { count: '$count.totalCount' } },
      ])

      usersData.exec(async (error, result) => {
        if (result) {
          if (result.length === 0) return res.status(200).json({ code: 'FETCHED', data: {} })
          if (isDownload === 'true') {
            // Flatten the nested role and company data for export
            const flattenedData =
              result[0]?.data?.map((user: any) => ({
                firstName: user.firstName || 'N/A',
                lastName: user.lastName || 'N/A',
                email: user.email || 'N/A',
                company: user.company?.title || 'N/A', // Extract title from company object
                role: user.role?.title || 'N/A', // Extract title from role object
                isAccountLocked: user.isAccountLocked ? 'Yes' : 'No',
                wrongAttampt: user.wrongAttampt || 0,
              })) || []

            if (filetype === 'pdf') {
              const { fileBuffer, error } = await generatingEjsWithFieldToExportAndTitle(
                'exportSelectedFields',
                flattenedData,
                fieldsToExport,
                'Users',
                true
              )

              if (error) return res.status(400).json({ message: error.message })

              res.set('Content-Type', 'application/pdf')
              return res.status(200).send(fileBuffer)
            } else if (filetype === 'xlsx') {
              try {
                // This will be fixed when utils are converted
                const xlsxBuffer = await exportSelectedFieldsXLSX(flattenedData, fieldsToExport)
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                res.setHeader('Content-Disposition', 'attachment: filename=usersData.xlsx')
                return res.status(200).send(xlsxBuffer)
              } catch (exportError) {
                console.error('Export error:', exportError)
                return res.status(500).json({ code: 'ERROROCCURED', message: 'Export failed' })
              }
            } else {
              return res.status(400).json({ message: 'Please provide proper file type' })
            }
          }

          return res.status(200).json({ code: 'FETCHED', data: result[0] || {} })
        } else return res.status(400).json({ code: 'ERROROCCURED', message: error })
      })
    } catch (error: any) {
      console.log('ERROR: ' + error)
      res.status(500).json({ message: error.message })
    }
  },

  //-------change Pasword------------------
  changePassword: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const { password, newPassword } = req.body

      if (!password) {
        res.status(403).send({ code: 'ERROROCCURED', message: 'Password must be specified!' })
        return
      }
      if (!newPassword) {
        res.status(403).send({ code: 'ERROROCCURED', message: 'New password must be specified!' })
        return
      }

      User.findOne({ _id: req?.user?._id }).exec((err, user) => {
        const passwordEnteredByUser = password
        const hashedPassword = user?.password

        compare(passwordEnteredByUser, hashedPassword!, function (err: any, isMatch: boolean) {
          if (err) {
            res.status(400).json({ code: ' ERROROCCURED', message: err })
            return
          } else if (!isMatch) {
            res.status(400).json({ code: 'PASSWORDISNOTMATCHED', message: 'Current password is incorrect' })
            return
          }

          hash(newPassword, 10, (err: any, hash: string) => {
            User.findOneAndUpdate({ _id: req.user?._id }, { password: hash }, null, function (err: any, result: any) {
              if (err) {
                res.status(200).json({ code: 'ERROROCCURED', message: err })
              } else {
                res.status(200).json({ code: 'UPDATED', message: 'Password has been updated successfully!!' })
              }
            })
          })
        })
      })
    } catch (error: any) {
      console.log('Error: ', error.message)
      res.status(500).send({ message: 'Something Broken!!' })
    }
  },

  logout: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      req.session!.destroy(() => {})
      res.clearCookie('connect.sid')

      res.status(200).json({
        code: 'LOGGED_OUT',
        message: 'Logged-out successfully!',
      })
    } catch (error: any) {
      res.status(400).json({
        code: 'ERROR',
        message: error.message,
      })
    }
  },

  logoutAsync: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      req.session!.destroy(() => {})
      res.clearCookie('connect.sid')

      res.status(200).json({
        code: 'LOGGED_OUT',
        message: 'Logged-out successfully!',
      })
    } catch (error: any) {
      res.status(400).json({
        code: 'ERROR',
        message: error.message,
      })
    }
  },

  unlockAccount: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      if ((req.user!.role as any).slug == 'superadmin') {
        const hashedPassword = await hash(req.body.password, 10)
        const unlockedAccount = await User.findByIdAndUpdate(
          { _id: req.body.user },
          {
            $set: {
              password: hashedPassword,
              isAccountLocked: false,
              wrongAttampt: 0,
            },
          }
        )
        res.status(200).json({
          code: 'success',
          message: 'Account unlocked successfully!',
          data: unlockedAccount,
        })
      } else {
        res.status(200).json({
          code: 'ERROROCCURED',
          message: 'Only superadmin can unlock an account!',
        })
      }
    } catch (error: any) {
      res.status(400).json({
        code: 'ERROR',
        message: error.message,
      })
    }
  },

  verifyLoginOtp: async (req: Request, res: Response): Promise<Response<ApiResponse>> => {
    try {
      const { email, otp } = req.body

      const isUserExist = await User.findOne({ email: email }).populate('company')
      if (!email || !otp) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email and OTP are required' })
      }
      const user = await User.findOne({ email, reset_otp: otp }).populate('company')

      if (!user) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid OTP or email' })
      }
      // Clear OTP after successful verification
      await User.updateOne({ _id: user._id }, { $unset: { reset_otp: '' } }).catch(() => {})

      const populatedUser = await User.findById(isUserExist!._id)
        .populate({
          path: 'company',
          select: 'title email plan logo expiredOn',
          populate: {
            path: 'plan',
            select: 'plan slug price duration',
            model: 'Pricing',
          },
        })
        .lean()

      if (!populatedUser) {
        return res.status(404).json({ code: 'USERNOTFOUND', message: 'User not found' })
      }

      // Plan expiry check
      const currentDate = new Date().toISOString().substring(0, 10)
      const companyObj = user.company as any
      const expiredOn = companyObj?.expiredOn
      if (expiredOn && expiredOn <= currentDate) {
        return res.status(200).json({
          body: {
            code: 'PLANEXPIRED',
            verified: true,
          },
        })
      }

      // Role info
      const roleData = await Role.findById({ _id: populatedUser.role }, { title: 1, slug: 1, permissions: 1 }).lean()

      // Prepare company data based on permissions
      if (roleData) {
        let companyData = populatedUser.company ? JSON.parse(JSON.stringify(populatedUser.company)) : {}
        if (!roleData.permissions.includes('root')) {
          delete companyData.purchasedOn
          delete companyData.expiredOn
          delete companyData.plan
        }
        populatedUser.company = companyData
      }

      const payload: any = {
        _id: populatedUser._id,
        firstName: populatedUser.firstName,
        lastName: populatedUser.lastName,
        twoFactor: populatedUser.twoFactor,
        email: populatedUser.email,
        company: populatedUser.company,
        role: roleData,
      }

      // Issue token
      const token = sign(payload, process.env.TOKEN_KEY!, { expiresIn: '1d' })
      ;(req.session as any).token = token

      return res.status(200).json({ code: 'OTP_VERIFIED', message: 'OTP verified successfully', user: payload, token })
    } catch (error: any) {
      return res.status(500).json({
        code: 'ERROROCCURED',
        message: error.message,
      })
    }
  },

  resendLoginOtp: async (req: Request, res: Response): Promise<Response<ApiResponse>> => {
    try {
      const { email } = req.body
      if (!email) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email is required' })
      }
      const user = await User.findOne({ email: email })
      if (!user) {
        return res.status(404).json({ code: 'USERNOTFOUND', message: 'User not found' })
      }
      if (user && user.twoFactor) {
        const OTP = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')

        // Fire-and-forget OTP email
        User.updateOne({ _id: user._id }, { $set: { reset_otp: OTP } }).catch(() => {})
        sendOtpEmail({
          recipientEmail: email,
          firstName: user.firstName,
          otp: OTP,
          subject: 'Login OTP',
        }).catch((err) => console.log('OTP send error:', err))

        return res.status(200).json({ code: 'OTP_SENT', message: 'OTP sent to your email' })
      }
      return res
        .status(200)
        .json({ code: 'ERROROCCURED', message: 'Two-factor authentication is not enabled for this user' })
    } catch (error: any) {
      return res.status(500).json({
        code: 'ERROROCCURED',
        message: error.message,
      })
    }
  },

  enableTwoFactorAuth: async (req: Request, res: Response): Promise<Response<ApiResponse>> => {
    try {
      const { twoFactor } = req.body
      const { id } = req.params
      if (typeof twoFactor !== 'boolean') {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'twoFactor must be a boolean value' })
      }
      const updatedUser = await User.findByIdAndUpdate({ _id: id }, { $set: { twoFactor: twoFactor } }, { new: true })
      if (!updatedUser) {
        return res.status(400).json({ code: 'NOT UPDATED', message: 'User not updated' })
      }
      return res.status(200).json({
        code: 'UPDATED',
        message: `Two-Factor Authentication has been ${twoFactor ? 'enabled' : 'disabled'} successfully!`,
      })
    } catch (error: any) {
      return res.status(400).json({
        code: 'ERROROCCURED',
        message: error.message,
      })
    }
  },

  otpSent: async (req: Request, res: Response): Promise<Response<ApiResponse>> => {
    try {
      const { email } = req.body
      if (!email) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email is required' })
      }
      const user = await User.findOne({ email: email })
      if (!user) {
        return res.status(404).json({ code: 'USERNOTFOUND', message: 'User not found' })
      }

      const OTP = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')

      // Fire-and-forget OTP email
      User.updateOne({ _id: user._id }, { $set: { reset_otp: OTP } }).catch(() => {})
      sendOtpEmail({
        recipientEmail: email,
        firstName: user.firstName,
        otp: OTP,
        subject: 'Login OTP',
      }).catch((err) => console.log('OTP send error:', err))

      return res.status(200).json({ code: 'OTP_SENT', message: 'OTP sent to your email' })
    } catch (error: any) {
      return res.status(500).json({
        code: 'ERROROCCURED',
        message: error.message,
      })
    }
  },

  forgetPasswordOtpVerify: async (req: Request, res: Response): Promise<Response<ApiResponse>> => {
    try {
      const { email, otp } = req.body

      console.log(email, otp)
      if (!email || !otp) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email and OTP are required' })
      }
      const user = await User.findOne({ email, reset_otp: otp })

      if (!user) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid OTP or email' })
      }
      // Clear OTP after successful verification
      await User.updateOne({ _id: user._id }, { $unset: { reset_otp: '' } }).catch(() => {})
      return res.status(200).json({ code: 'OTP_VERIFIED', message: 'OTP verified successfully' })
    } catch (error: any) {
      return res.status(500).json({
        code: 'ERROROCCURED',
        message: error.message,
      })
    }
  },

  forgetPassword: async (req: Request, res: Response): Promise<Response<ApiResponse>> => {
    const { email, newPassword } = req.body

    try {
      if (!email) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email is required' })
      }
      const hashedPassword = await hash(newPassword, 10)

      const updatedUserPassword = await User.findOneAndUpdate(
        { email: email },
        { $set: { password: hashedPassword, reset_otp: null } }
      )
      if (updatedUserPassword) {
        return res.status(200).json({
          code: 'UPDATED',
          data: 'Password reset successfully !!',
        })
      } else {
        return res.status(400).json({
          code: 'NOTUPDATED',
          data: 'User not exist !!',
        })
      }
    } catch (error: any) {
      console.log(error)
      return res.status(400).json({
        code: 'ERROROCCURED',
        message: error,
      })
    }
  },

  //-----------------Session Verification API-------------------
  session: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      // Check if user is authenticated via middleware
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized - No session found' })
        return
      }

      // Return user data if session is valid
      res.status(200).json({
        code: 'SESSION_VALID',
        user: req.user,
      })
    } catch (error: any) {
      res.status(500).json({
        code: 'ERROROCCURED',
        message: error.message,
      })
    }
  },
}

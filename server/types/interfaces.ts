// Type definitions and interfaces
import mongoose, { Document } from 'mongoose'
import { Request as ExpressRequest, Response as ExpressResponse } from 'express'

// Extend Express Request to include express-formidable properties
declare global {
  namespace Express {
    interface Request {
      fields?: { [key: string]: any }
      files?: { [key: string]: any }
      file?: { path: string }
    }
  }
}

// Re-export Express types for convenience
export type Request = ExpressRequest
export type Response<T = any> = ExpressResponse<T>
export type NextFunction = import('express').NextFunction

// ========================================
// MODEL INTERFACES - COMPLETE AND ACCURATE
// ========================================

// User Model Interface
export interface IUser extends Document {
  _id: string
  firstName?: string
  lastName?: string
  email: string
  company: mongoose.Types.ObjectId | ICompany
  password: string
  role: mongoose.Types.ObjectId | IRole
  reset_key?: {
    data: string
  }
  reset_otp?: string
  wrongAttampt: number
  isAccountLocked: boolean
  twoFactor: boolean
  createdAt: Date
  updatedAt: Date
}

// Company Model Interface
export interface ICompany extends Document {
  _id: string
  title: string
  email: string
  secondaryEmail?: string
  plan: mongoose.Types.ObjectId
  countryIds: mongoose.Types.ObjectId[]
  purchasedOn: Date
  expiredOn: Date
  logo: any
  deletedBy?: {
    userId: mongoose.Types.ObjectId
    time: Date
  }
  createdAt: Date
  updatedAt: Date
}

// Role Model Interface
export interface IRole extends Document {
  _id: string
  title: string
  slug: string
  permissions: string[]
  company: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Pricing Model Interface
export interface IPricing extends Document {
  _id: string
  plan: string
  slug: string
  price: number
  duration: number
  deletedBy?: {
    userId: mongoose.Types.ObjectId
    time: Date
  }
  createdAt: Date
  updatedAt: Date
}

// Country Model Interface
export interface ICountry extends Document {
  _id: string
  title: string
  slug: string
  approvalDays: number
  launchDays: number
  initiateDays: number
  submitDays: number
  renewDays: number
  IA: number
  IB: number
  major: number
  minor: number
  deletedBy?: {
    userId: mongoose.Types.ObjectId
    time: Date
  }
  createdAt: Date
  updatedAt: Date
}

// Product Model Interface
export interface IProduct extends Document {
  _id: string
  title: string
  slug: string
  company: mongoose.Types.ObjectId
  active: boolean
  deletedBy?: {
    userId: mongoose.Types.ObjectId
    time: Date
  }
  createdAt: Date
  updatedAt: Date
}

// Preregistration Model Interface (Complex)
export interface IPreregistration extends Document {
  _id: string
  product: mongoose.Types.ObjectId
  registrationDate?: Date
  registrationNo?: string
  notificationNumber?: string
  country: mongoose.Types.ObjectId
  expApprovalDate?: Date
  submissionDate?: Date
  dossier?: string
  sample?: string
  expLaunchDate?: Date
  renewalDate?: Date
  localPartner: Array<{
    partnerName: string
  }>
  remark?: string
  stage: string
  rc?: any
  company?: mongoose.Types.ObjectId
  active: boolean
  apiName: string
  brandName: string
  api: Array<{
    apiSourceName?: string
    apiSourceAddress?: string
    apiSourceMethod?: string
  }>
  modeOfRegistration?: string
  siteGMP?: string
  modeOfVersion?: string
  FPSpecificationNumber?: string
  shelfLife?: string
  batchSize?: string
  batchFormula?: any
  storageCondition?: string
  packSize?: string
  CIC?: string
  SKUCode?: string
  registeredPrice?: string
  registeredArtworkLabel?: string
  registeredArtworkCarton?: string
  registeredArtworkOuterCarton?: string
  registeredArtworkPackageInsert?: string
  registeredArtworkPIL?: any
  deletedBy?: {
    userId: mongoose.Types.ObjectId
    time: Date
  }
  createdAt: Date
  updatedAt: Date
}

// Renewal Model Interface
export interface IRenewal extends Document {
  _id: string
  preregistration: mongoose.Types.ObjectId
  expSubmitDate: Date
  expInitiateDate: Date
  company: mongoose.Types.ObjectId
  renewDate?: Date
  initiateDate?: Date
  submitDate?: Date
  stage: string
  posPdf?: any
  approvalPdf?: any
  status: boolean
  notificationNumber?: string
  remark?: string
  deletedBy?: {
    userId: mongoose.Types.ObjectId
    time: Date
  }
  createdAt: Date
  updatedAt: Date
}

// Variation Model Interface
export interface IVariation extends Document {
  _id: string
  preregistration: mongoose.Types.ObjectId
  title: string
  category: string // IA/IB/MINOR/MAJOR
  expApprovalDate: Date
  submissionDate: Date
  company: mongoose.Types.ObjectId
  approvalPdf?: any
  posPdf?: any
  POS: string // Received/Not-Received
  approval: string // approved/rejected/Not-Received
  approvalDate?: Date
  stage: string // Submitted/Not-submitted
  status: boolean
  notificationNumber?: string
  remark?: string
  deletedBy?: {
    userId: mongoose.Types.ObjectId
    time: Date
  }
  createdAt: Date
  updatedAt: Date
}

// File Model Interface
export interface IFile extends Document {
  _id: string
  originalName: string
  mimeType: string
  size: number
  path: string
  key: string
  url?: string
  uploadedBy: mongoose.Types.ObjectId
  folder?: mongoose.Types.ObjectId
  company: mongoose.Types.ObjectId
  isDeleted: boolean
  deletedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Folder Model Interface
export interface IFolder extends Document {
  _id: string
  name: string
  path: string
  parent?: mongoose.Types.ObjectId
  company: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  files: mongoose.Types.ObjectId[]
  isDeleted: boolean
  deletedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Token Model Interface
export interface IToken extends Document {
  _id: string
  user: mongoose.Types.ObjectId
  token: string
  type: string // email-verification, password-reset, etc.
  expiresAt: Date
  isUsed: boolean
  createdAt: Date
  updatedAt: Date
}

// Jobs Model Interface (Background Jobs)
export interface IJobs extends Document {
  _id: string
  jobType: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  data: any
  result?: any
  error?: string
  startedAt?: Date
  completedAt?: Date
  company?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Notification Counter Model Interface
export interface INotificationCounter extends Document {
  _id: string
  company: mongoose.Types.ObjectId
  product: mongoose.Types.ObjectId
  country: mongoose.Types.ObjectId
  lastNotificationNumber: number
  createdAt: Date
  updatedAt: Date
}

// ========================================
// API REQUEST/RESPONSE INTERFACES
// ========================================

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  code: string
  message?: string
  user?: IUser
  token?: string
  body?: {
    code: string
    verified: boolean
  }
}

export interface RegisterRequest {
  firstName?: string
  lastName?: string
  email: string
  password: string
  company: string
  role: string
}

export interface RegisterResponse {
  code: string
  message: string
}

export interface ApiResponse<T = any> {
  code: string
  message?: string
  data?: T
}

export interface UsersResponse {
  data?: any
  count?: number
}

// Query parameter interfaces
export interface GetAllUsersQuery {
  searchTitle?: string
  search?: string
  page?: string
  limit?: string
  sort?: string
  order?: string
  isDownload?: string
  filetype?: string
  selectedFields?: string
}

// Request custom interfaces
export interface RequestWithUser extends Omit<Request, 'session'> {
  user?: IUser
  roleData?: {
    permissions: string[]
    slug: string
  }
  session?: any
}

export interface RequestWithCompany extends Request {
  company?: ICompany
}

// ========================================
// SOCKET.IO INTERFACES
// ========================================

export interface ServerToClientEvents {
  'joined-room': (userId: string) => void
}

export interface ClientToServerEvents {
  join: (userId: string) => void
  disconnect: () => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  userId: string
}

// ========================================
// UTILITY TYPES AND ENUMS
// ========================================

export type UserRole = 'superadmin' | 'admin' | 'user'

export enum ResponseCodes {
  SUCCESS = 'FETCHED',
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  ERROR = 'ERROROCCURED',
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  DUPLICATEDATA = 'DUPLICATEDATA',
  NOT_FOUND = 'NOTFOUND',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  PLAN_EXPIRED = 'PLANEXPIRED',
  OTP_SENT = 'OTP_SENT',
  LOGGED_OUT = 'LOGGED_OUT',
}

// Environment variables interface
export interface ProcessEnv {
  DB_URL: string
  DB_NAME: string
  TOKEN_KEY: string
  SESSION_SECRET_KEY: string
  PORT?: string
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_KEY: string
  AWS_REGION: string
  FOLDER: string
  // Add other env variables as needed
}

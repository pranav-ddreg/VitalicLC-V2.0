const path = require('path')

// Ensure env is set for token signing
process.env.TOKEN_KEY = process.env.TOKEN_KEY || 'test-secret'
process.env.ENV_STATUS = 'test'

// Resolve module paths exactly as used by controller to mock correctly
const controllerPath = path.join(__dirname, '..', '..', 'controller', 'auth.js')
const userModelPath = path.join(__dirname, '..', 'model', 'user.js')
const roleModelPath = path.join(__dirname, '..', 'model', 'role.js')
const sendEmailUtilPath = path.join(__dirname, '..', 'utils', 'sendEmail.js')
const ejsToPdfPath = path.join(__dirname, '..', 'services', 'ejsToPdf.js')
const exportCSVPath = path.join(__dirname, '..', 'utils', 'exportSelectedFieldsCSV.js')

// Mocks
jest.mock('aws-sdk', () => {
  const SES = jest.fn().mockImplementation(() => ({
    verifyEmailIdentity: jest.fn().mockReturnValue(true),
    sendEmail: jest.fn(() => ({ promise: () => Promise.resolve() })),
  }))
  return { SES }
})

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}))

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}))

jest.mock('../../model/user.js', () => ({
  findOne: jest.fn(),
  updateOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  create: jest.fn(),
  aggregate: jest.fn(),
  findOneAndUpdate: jest.fn(),
}))

jest.mock('../../model/role.js', () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
}))

jest.mock('../../utils/sendEmail.js', () => ({
  loginNotificationEmail: jest.fn(() => Promise.resolve(true)),
  sendOtpEmail: jest.fn(() => Promise.resolve(true)),
}))

jest.mock('../../services/ejsToPdf.js', () => ({
  generatingEjsWithFieldToExportAndTitle: jest.fn(),
}))

jest.mock('../../utils/exportSelectedFieldsCSV.js', () => ({
  exportSelectedFieldsCSV: jest.fn(),
}))

// Import after mocks
const { compare, hash } = require('bcryptjs')
const { sign } = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const User = require('../../model/user.js')
const Role = require('../../model/role.js')
const { loginNotificationEmail, sendOtpEmail } = require('../../utils/sendEmail.js')

// Load the controller under test
const authController = require(controllerPath)

// Helpers
const mockRes = () => {
  const res = {}
  res.status = jest.fn(() => res)
  res.json = jest.fn(() => res)
  res.send = jest.fn(() => res)
  res.set = jest.fn(() => res)
  res.clearCookie = jest.fn(() => res)
  return res
}

const resultOk = () => ({ isEmpty: () => true, array: () => [] })
const resultErr = (msg) => ({ isEmpty: () => false, array: () => [{ msg }] })

const chainFindOnePopulateLean = (doc) => ({
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(doc),
})

const chainFindByIdLean = (doc) => ({
  lean: jest.fn().mockResolvedValue(doc),
})

const defaultCompany = (overrides = {}) => ({
  _id: 'cmp123',
  title: 'Acme Inc',
  email: 'info@acme.test',
  logo: 'logo.png',
  plan: { _id: 'pricing123', plan: 'Pro', slug: 'pro', price: 100, duration: 30 },
  expiredOn: '2999-12-31',
  ...overrides,
})

const defaultUserDoc = (overrides = {}) => ({
  _id: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'hashed',
  company: defaultCompany(),
  role: 'role123',
  twoFactor: false,
  isAccountLocked: false,
  wrongAttampt: 0,
  ...overrides,
})

const roleDoc = (overrides = {}) => ({
  _id: 'role123',
  title: 'Admin',
  slug: 'admin',
  permissions: ['root'],
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
  validationResult.mockImplementation(() => resultOk())
  sign.mockReturnValue('signed-token')
  hash.mockResolvedValue('new-hash')

  // Default mocks for model methods
  User.updateOne.mockResolvedValue({ acknowledged: true })
  User.findById.mockImplementation(() => ({
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(defaultUserDoc()),
  }))
  Role.findById.mockImplementation(() => chainFindByIdLean(roleDoc()))
})

describe('authController.login', () => {
  test('returns 400 on invalid input', async () => {
    validationResult.mockImplementation(() => resultErr('Email required'))
    const req = { body: {}, session: {} }
    const res = mockRes()

    await authController.login(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_INPUT' }))
  })

  test('returns 404 when user not found', async () => {
    User.findOne.mockImplementation(() => chainFindOnePopulateLean(null))
    const req = { body: { email: 'no@user.test', password: 'x' }, session: {} }
    const res = mockRes()

    await authController.login(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_EMAIL' }))
  })

  test('wrong password increments attempts and sends notification', async () => {
    const user = defaultUserDoc({ wrongAttampt: 3, password: 'hash' })
    User.findOne.mockImplementation(() => chainFindOnePopulateLean(user))
    compare.mockResolvedValue(false)

    const req = { body: { email: user.email, password: 'wrong' }, session: {} }
    const res = mockRes()

    await authController.login(req, res)

    expect(User.updateOne).toHaveBeenCalledWith({ _id: user._id }, { $set: { wrongAttampt: 4 } })
    expect(loginNotificationEmail).toHaveBeenCalledWith(expect.objectContaining({ recipientEmail: user.email }))
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'UNAUTHORIZED', message: expect.stringContaining('Only 1 attempt(s) left') })
    )
  })

  test('locks account on 5th wrong attempt', async () => {
    const user = defaultUserDoc({ wrongAttampt: 4, password: 'hash' })
    User.findOne.mockImplementation(() => chainFindOnePopulateLean(user))
    compare.mockResolvedValue(false)

    const req = { body: { email: user.email, password: 'wrong' }, session: {} }
    const res = mockRes()

    await authController.login(req, res)

    expect(User.updateOne).toHaveBeenCalledWith({ _id: user._id }, { $set: { wrongAttampt: 5, isAccountLocked: true } })
    expect(res.status).toHaveBeenCalledWith(423)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'UNAUTHORIZED' }))
  })

  test('2FA enabled: sends OTP and returns OTP_SENT', async () => {
    const user = defaultUserDoc({ twoFactor: true, wrongAttampt: 1 })
    User.findOne.mockImplementation(() => chainFindOnePopulateLean(user))
    compare.mockResolvedValue(true)

    const req = { body: { email: user.email, password: 'correct' }, session: {} }
    const res = mockRes()

    await authController.login(req, res)

    // Resets wrong attempts
    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: user._id },
      { $set: { wrongAttampt: 0, isAccountLocked: false } }
    )

    // Also sets reset_otp in fire-and-forget
    expect(User.updateOne).toHaveBeenCalledTimes(2)
    expect(sendOtpEmail).toHaveBeenCalledWith(
      expect.objectContaining({ recipientEmail: user.email, subject: 'Login OTP' })
    )
    expect(req.session.token).toBe('signed-token')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'OTP_SENT' }))
  })

  test('success without 2FA returns token and user payload', async () => {
    const user = defaultUserDoc({
      twoFactor: false,
      company: defaultCompany({ expiredOn: '2999-01-01' }),
    })
    User.findOne.mockImplementation(() => chainFindOnePopulateLean(user))
    compare.mockResolvedValue(true)

    const req = { body: { email: user.email, password: 'correct' }, session: {} }
    const res = mockRes()

    await authController.login(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'FETCHED', token: 'signed-token' }))
  })

  test('returns PLANEXPIRED when company expired', async () => {
    const today = new Date().toISOString().substring(0, 10)
    const user = defaultUserDoc({
      twoFactor: false,
      company: defaultCompany({ expiredOn: today }),
    })
    User.findOne.mockImplementation(() => chainFindOnePopulateLean(user))
    compare.mockResolvedValue(true)

    const req = { body: { email: user.email, password: 'correct' }, session: {} }
    const res = mockRes()

    await authController.login(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ code: 'PLANEXPIRED', verified: true }),
      })
    )
  })
})

describe('authController.verifyLoginOtp', () => {
  test('returns 400 when email/otp missing', async () => {
    const req = { body: { email: '', otp: '' }, session: {} }
    const res = mockRes()

    await authController.verifyLoginOtp(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_INPUT' }))
  })
})

describe('authController.resendLoginOtp', () => {
  test('returns 400 if email missing', async () => {
    const req = { body: {} }
    const res = mockRes()
    await authController.resendLoginOtp(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_INPUT' }))
  })

  test('sends OTP if user has twoFactor', async () => {
    const user = defaultUserDoc({ email: 'jane@example.com', twoFactor: true })
    User.findOne.mockResolvedValueOnce(user)

    const req = { body: { email: user.email, Subject: 'Login OTP' } }
    const res = mockRes()

    await authController.resendLoginOtp(req, res)

    expect(User.updateOne).toHaveBeenCalledWith({ _id: user._id }, { $set: { reset_otp: expect.any(String) } })
    expect(sendOtpEmail).toHaveBeenCalledWith(
      expect.objectContaining({ recipientEmail: user.email, subject: 'Login OTP' })
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'OTP_SENT' }))
  })
})

// Note: You can extend with tests for register, updateUser, deleteUser, getAllUser, changePassword, logout, unlockAccount, otpSent, forgetPasswordOtpVerify, forgetPassword etc.

/**
 * API tests for server/routers/auth.js
 * - Uses Jest + Supertest
 * - Mocks middleware (checkToken, checkRoot, etc.) to simulate auth and role conditions
 * - Mocks controllers to avoid DB/external service dependencies
 * - Mocks validations to avoid express-validator side effects
 *
 * How to run:
 * 1) npm i -D jest supertest
 * 2) Ensure Jest is configured to run in node environment (testEnvironment: "node")
 * 3) npx jest tests/auth.routes.test.js
 */
const path = require('path')
const express = require('express')
const request = require('supertest')

// Helper to setup mocks and build an app instance fresh for each test
const makeApp = () => {
  jest.resetModules()

  // Resolve absolute paths based on this test file location
  const middlewarePath = path.resolve(__dirname, '../../middleware/middleware.js')
  const controllerPath = path.resolve(__dirname, '../../controller/auth.js')
  const validationPath = path.resolve(__dirname, '../../validation/authValidation.js')
  const routerPath = path.resolve(__dirname, '../../routers/auth.js')

  // Load modules before the router so we can patch them
  const middleware = require(middlewarePath)
  const controllers = require(controllerPath)
  const validations = require(validationPath)

  // Mock middleware: simulate success by default, allow failure control via headers.
  middleware.checkToken = jest.fn((req, res, next) => {
    if (req.headers['x-test-auth'] === 'deny') {
      return res.status(401).json({ code: 'INVALID_TOKEN', message: 'Your token is invalid!' })
    }
    // Seed values often used downstream
    req.user = { _id: 'u_test', company: { _id: 'c_test', title: 'ACME' }, role: { slug: 'superadmin' } }
    req.roleData = { slug: 'superadmin', permissions: ['root', 'create', 'update', 'delete'] }
    return next()
  })

  middleware.checkRoot = jest.fn((req, res, next) => {
    if (req.headers['x-test-root'] === 'deny') {
      return res.status(403).json({ code: 'UNAUTHORIZED', message: 'You are not authorized' })
    }
    return next()
  })

  middleware.checkUpdate = jest.fn((req, res, next) => {
    if (req.headers['x-test-update'] === 'deny') {
      return res.status(403).json({ message: 'You do not have permission for update' })
    }
    return next()
  })

  // Mock validations (express-validator chains) to no-op middlewares
  const passThrough = (req, _res, next) => next()
  validations.userCreateValidation = [jest.fn(passThrough)]
  validations.updateUserValidation = [jest.fn(passThrough)]

  // Mock controllers to return a simple success with endpoint marker
  const ok = (endpoint) => (req, res) => {
    return res.status(200).json({
      code: 'OK',
      endpoint,
      params: req.params || {},
      query: req.query || {},
      body: req.body || {},
    })
  }

  controllers.register = jest.fn(ok('register'))
  controllers.login = jest.fn(ok('login'))
  controllers.deleteUser = jest.fn(ok('deleteUser'))
  controllers.updateUser = jest.fn(ok('updateUser'))
  controllers.getAllUser = jest.fn(ok('getAllUser'))
  controllers.changePassword = jest.fn(ok('changePassword'))
  controllers.logout = jest.fn(ok('logout'))
  controllers.verifyLoginOtp = jest.fn(ok('verifyLoginOtp'))
  controllers.enableTwoFactorAuth = jest.fn(ok('enableTwoFactorAuth'))
  controllers.resendLoginOtp = jest.fn(ok('resendLoginOtp'))
  controllers.otpSent = jest.fn(ok('otpSent'))
  controllers.forgetPasswordOtpVerify = jest.fn(ok('forgetPasswordOtpVerify'))
  controllers.forgetPassword = jest.fn(ok('forgetPassword'))

  // Now load the router which will consume the mocked modules above
  const router = require(routerPath)

  // Build an express app and mount router
  const app = express()
  app.use(express.json())
  app.use('/auth', router)

  return { app, middleware, controllers }
}

describe('Auth Router API', () => {
  test('GET /auth/users -> requires auth and root, hits controller', async () => {
    const { app, middleware, controllers } = makeApp()

    const res = await request(app).get('/auth/users').set('x-test-auth', 'allow')

    expect(res.status).toBe(200)
    expect(res.body.endpoint).toBe('getAllUser')
    expect(middleware.checkToken).toHaveBeenCalled()
    expect(middleware.checkRoot).toHaveBeenCalled()
    expect(controllers.getAllUser).toHaveBeenCalled()
  })

  test('GET /auth/users -> unauthorized when token invalid', async () => {
    const { app, middleware, controllers } = makeApp()

    const res = await request(app).get('/auth/users').set('x-test-auth', 'deny')

    expect(res.status).toBe(401)
    expect(res.body.code).toBe('INVALID_TOKEN')
    expect(middleware.checkToken).toHaveBeenCalled()
    // Should not reach controller or next root middleware
    expect(middleware.checkRoot).not.toHaveBeenCalled()
    expect(controllers.getAllUser).not.toHaveBeenCalled()
  })

  test('POST /auth/addUser -> with validation pass-through and root', async () => {
    const { app, controllers } = makeApp()

    const payload = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'StrongP@ssw0rd!',
      company: '60f7b2bb2b4a256d8d8f1234',
      role: '60f7b2bb2b4a256d8d8f5678',
    }

    const res = await request(app).post('/auth/addUser').set('x-test-auth', 'allow').send(payload)

    expect(res.status).toBe(200)
    expect(res.body.endpoint).toBe('register')
    expect(controllers.register).toHaveBeenCalled()
  })

  test('PUT /auth/update/:id -> update route hits controller', async () => {
    const { app, controllers } = makeApp()

    const res = await request(app)
      .put('/auth/update/123')
      .set('x-test-auth', 'allow')
      .send({ email: 'new@example.com', password: 'N3wStrongP@ss!' })

    expect(res.status).toBe(200)
    expect(res.body.endpoint).toBe('updateUser')
    expect(res.body.params.id).toBe('123')
    expect(controllers.updateUser).toHaveBeenCalled()
  })

  test('DELETE /auth/delete/:id -> delete route hits controller', async () => {
    const { app, controllers } = makeApp()

    const res = await request(app).delete('/auth/delete/abc123').set('x-test-auth', 'allow')

    expect(res.status).toBe(200)
    expect(res.body.endpoint).toBe('deleteUser')
    expect(res.body.params.id).toBe('abc123')
    expect(controllers.deleteUser).toHaveBeenCalled()
  })

  test('POST /auth/change/password -> protected route hits controller', async () => {
    const { app, controllers } = makeApp()

    const res = await request(app)
      .post('/auth/change/password')
      .set('x-test-auth', 'allow')
      .send({ password: 'old', newPassword: 'N3wStrongP@ss!' })

    expect(res.status).toBe(200)
    expect(res.body.endpoint).toBe('changePassword')
    expect(controllers.changePassword).toHaveBeenCalled()
  })

  test('POST /auth/login -> open route hits controller', async () => {
    const { app, controllers } = makeApp()

    const res = await request(app).post('/auth/login').send({ email: 'user@example.com', password: 'secret' })

    expect(res.status).toBe(200)
    expect(res.body.endpoint).toBe('login')
    expect(controllers.login).toHaveBeenCalled()
  })

  test('POST /auth/logout -> route hits controller', async () => {
    const { app, controllers } = makeApp()

    const res = await request(app).post('/auth/logout').set('x-test-auth', 'allow')

    expect(res.status).toBe(200)
    expect(res.body.endpoint).toBe('logout')
    expect(controllers.logout).toHaveBeenCalled()
  })

  test('POST /auth/verify-otp -> route hits controller', async () => {
    const { app, controllers } = makeApp()

    const res = await request(app).post('/auth/verify-otp').send({ email: 'user@example.com', otp: '123456' })

    expect(res.status).toBe(200)
    expect(res.body.endpoint).toBe('verifyLoginOtp')
    expect(controllers.verifyLoginOtp).toHaveBeenCalled()
  })

  test('POST /auth/resend-otp -> route hits controller', async () => {
    const { app, controllers } = makeApp()

    const res = await request(app).post('/auth/resend-otp').send({ email: 'user@example.com', Subject: 'Resend OTP' })

    expect(res.status).toBe(200)
    expect(res.body.endpoint).toBe('resendLoginOtp')
    expect(controllers.resendLoginOtp).toHaveBeenCalled()
  })

  test('POST /auth/two-factor-verify/:id -> route hits controller', async () => {
    const { app, controllers } = makeApp()

    const res = await request(app).post('/auth/two-factor-verify/u123').send({ twoFactor: true })

    expect(res.status).toBe(200)
    expect(res.body.endpoint).toBe('enableTwoFactorAuth')
    expect(res.body.params.id).toBe('u123')
    expect(controllers.enableTwoFactorAuth).toHaveBeenCalled()
  })

  test('POST /auth/sent-otp -> route hits controller', async () => {
    const { app, controllers } = makeApp()

    const res = await request(app).post('/auth/sent-otp').send({ email: 'user@example.com' })

    expect(res.status).toBe(200)
    expect(res.body.endpoint).toBe('otpSent')
    expect(controllers.otpSent).toHaveBeenCalled()
  })

  test('POST /auth/forget-password/verify-otp -> route hits controller', async () => {
    const { app, controllers } = makeApp()

    const res = await request(app)
      .post('/auth/forget-password/verify-otp')
      .send({ email: 'user@example.com', otp: '654321' })

    expect(res.status).toBe(200)
    expect(res.body.endpoint).toBe('forgetPasswordOtpVerify')
    expect(controllers.forgetPasswordOtpVerify).toHaveBeenCalled()
  })

  test('POST /auth/forget-password -> route hits controller', async () => {
    const { app, controllers } = makeApp()

    const res = await request(app)
      .post('/auth/forget-password')
      .send({ email: 'user@example.com', newPassword: 'N3wStrongP@ss!' })

    expect(res.status).toBe(200)
    expect(res.body.endpoint).toBe('forgetPassword')
    expect(controllers.forgetPassword).toHaveBeenCalled()
  })
})

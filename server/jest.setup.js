const path = require('path')

// Load test environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.test') })

// Test user credentials for different roles
global.testUsers = {
  HR: {
    email: 'govind.s@ddreg.in',
    password: 'Govind@123',
    role: 'HR',
  },
  QA: {
    email: 'deepanshu.k@ddreg.in',
    password: 'Deepanshu@12',
    role: 'QA',
  },
  PL: {
    email: 'pranav.c@ddreg.in',
    password: 'Pranav@123',
    role: 'PL',
  },
  USER: {
    email: 'vimisha.d@ddreg.in',
    password: 'Vimisha@123',
    role: 'USER',
  },
  RM: {
    email: 'shorya.d@ddreg.in',
    password: 'Shorya@123',
    role: 'RM',
  },
}

// Extend Jest matchers
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received)
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      }
    }
  },

  toHaveValidObjectId(received) {
    const ObjectId = require('mongoose').Types.ObjectId
    const pass = ObjectId.isValid(received)
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ObjectId`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be a valid ObjectId`,
        pass: false,
      }
    }
  },
})

// Global test utilities
global.testUtils = {
  // Helper to get test user by role
  getTestUser: (role = 'USER') => {
    return global.testUsers[role] || global.testUsers.USER
  },

  // Helper to create mock user data (for unit tests)
  createMockUser: (overrides = {}) => {
    const { faker } = require('@faker-js/faker')
    return {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      empId: faker.string.alphanumeric(6).toUpperCase(),
      role: 'USER',
      status: true,
      ...overrides,
    }
  },

  // Helper to create mock request object
  createMockReq: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    session: {},
    user: null,
    ...overrides,
  }),

  // Helper to create mock response object
  createMockRes: () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    res.send = jest.fn().mockReturnValue(res)
    res.cookie = jest.fn().mockReturnValue(res)
    res.clearCookie = jest.fn().mockReturnValue(res)
    return res
  },
}

// Console override for cleaner test output
const originalConsoleError = console.error
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is deprecated')) {
    return
  }
  originalConsoleError.call(console, ...args)
}

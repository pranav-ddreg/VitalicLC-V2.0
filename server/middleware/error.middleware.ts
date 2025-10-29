import { Request, Response, NextFunction } from 'express'
import appConfig from '../config/app.config'
import { SecurityLogger } from '../services/securityLogger'

// Error response interface
interface ErrorResponse {
  success: false
  message: string
  code?: string
  details?: any
  timestamp: string
  path: string
  method: string
}

// Custom error class
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

// Error logging function
const logError = (error: any, req: Request) => {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    status: error.statusCode || error.status || 500,
    environment: appConfig.server.environment,
  }

  console.error('🚨 ERROR:', appConfig.server.isDevelopment ? JSON.stringify(errorInfo, null, 2) : error.message)
}

// Main error handler middleware
export const errorHandler = (error: AppError | any, req: Request, res: Response, next: NextFunction): Response => {
  let statusCode = error.statusCode || error.status || 500
  let message = error.message || 'Internal server error'
  let code: string | undefined = error.code
  let details: any = undefined

  // Log the error
  logError(error, req)

  // Handle specific error types
  if (error.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400
    message = 'Validation failed'
    details = error.errors
    code = 'VALIDATION_ERROR'
  } else if (error.name === 'CastError') {
    // Mongoose cast error (invalid ID, etc.)
    statusCode = 400
    message = 'Invalid data format'
    code = 'CAST_ERROR'
  } else if (error.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409
    message = 'Duplicate entry found'
    code = 'DUPLICATE_ERROR'
  } else if (error.name === 'UnauthorizedError') {
    // JWT error
    statusCode = 401
    message = 'Unauthorized access'
    code = 'UNAUTHORIZED'
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
    code = 'INVALID_TOKEN'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
    code = 'TOKEN_EXPIRED'
  }

  // Normalize status code
  if (statusCode < 400 || statusCode > 599) {
    statusCode = 500
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  }

  if (code) {
    errorResponse.code = code
  }

  // Add details in development mode or for specific status codes
  if ((appConfig.server.isDevelopment || appConfig.server.environment === 'test') && details) {
    errorResponse.details = details
  }

  if (appConfig.server.isDevelopment && statusCode === 500) {
    errorResponse.details = {
      stack: error.stack,
      originalMessage: error.message,
    }
  }

  return res.status(statusCode).json(errorResponse)
}

// 404 Not Found handler
export const notFoundHandler = (req: Request, res: Response): Response => {
  return res.status(404).json({
    success: false,
    message: 'Resource not found',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  })
}

// Rate limit exceeded handler (used by express-rate-limit)
export const rateLimitHandler = (req: Request, res: Response, options: any) => {
  // Log the rate limit violation
  SecurityLogger.logRateLimitExceeded(req)

  const retryAfterRaw = res.getHeader('Retry-After') || options.windowMs / 1000
  let retryAfter: number

  if (typeof retryAfterRaw === 'string') {
    retryAfter = parseInt(retryAfterRaw) || 60 // fallback to 60 seconds
  } else if (typeof retryAfterRaw === 'number') {
    retryAfter = retryAfterRaw
  } else {
    retryAfter = 60 // fallback
  }

  return res.status(429).json({
    success: false,
    message: options.message?.error || 'Too many requests',
    code: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString(),
    retryAfter: Math.ceil(retryAfter),
    path: req.path,
    method: req.method,
  })
}

// Development error handler (request logger)
export const developmentErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🚨 DEVELOPMENT ERROR DETAILS:')
  console.error('Error:', error.message)
  console.error('Stack:', error.stack)
  console.error('Request:', `${req.method} ${req.path}`)
  console.error('Body:', req.body)
  console.error('Query:', req.query)
  console.error('Params:', req.params)
  console.error('='.repeat(80))

  return errorHandler(error, req, res, next)
}

// Health check error handler
export const healthCheckErrorHandler = (error: any, req: Request, res: Response) => {
  console.error('Health check error:', error.message)

  return res.status(503).json({
    status: 'error',
    message: 'Health check failed',
    timestamp: new Date().toISOString(),
    details: appConfig.server.isDevelopment ? error.message : undefined,
  })
}

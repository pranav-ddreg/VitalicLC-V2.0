import { Response } from 'express'

// Response functions for common API responses
export const serverErrorResponse = (res: Response, error?: any): Response => {
  console.error('Server Error:', error || 'Something broke!')
  return res.status(500).json({
    code: 500,
    message: 'Internal server error. Please try again later.',
    error: 'Internal Server Error',
  })
}

export const successResponse = (res: Response, message: string, data?: any, statusCode: number = 200): Response => {
  return res.status(statusCode).json({
    code: statusCode,
    message,
    data: data || null,
    success: true,
  })
}

export const errorResponse = (res: Response, message: string, data?: any, statusCode: number = 400): Response => {
  return res.status(statusCode).json({
    code: statusCode,
    message,
    data: data || null,
    success: false,
  })
}

export const validationErrorResponse = (res: Response, errors: any[]): Response => {
  return res.status(422).json({
    code: 422,
    message: 'Validation failed',
    errors: errors,
    success: false,
  })
}

// Pagination helper
export const getPaginationParams = (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit
  return { offset, limit }
}

// Common validation helper for object IDs
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

// Generate random string utility
export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Date utilities
export const formatDate = (date: Date, format: 'iso' | 'readable' = 'iso'): string => {
  if (format === 'readable') {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  return date.toISOString()
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Array utilities
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunked: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size))
  }
  return chunked
}

export const removeDuplicates = <T>(array: T[], compareFn?: (a: T, b: T) => boolean): T[] => {
  if (compareFn) {
    return array.filter((item, index, arr) => arr.findIndex((other) => compareFn(item, other)) === index)
  }
  return [...new Set(array)]
}

export default {
  serverErrorResponse,
  successResponse,
  errorResponse,
  validationErrorResponse,
  getPaginationParams,
  isValidObjectId,
  generateRandomString,
  formatDate,
  addDays,
  chunkArray,
  removeDuplicates,
}

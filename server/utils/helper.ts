import { Response } from 'express'

// Interface for validation result
interface ValidationResult {
  isValid: boolean
  errors?: string[]
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(email)

  return {
    isValid,
    errors: isValid ? undefined : ['Please provide a valid email address'],
  }
}

// Password strength validation
export const validatePasswordStrength = (password: string): ValidationResult => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  }
}

// File type validation
export const validateFileType = (filename: string, allowedExtensions: string[]): ValidationResult => {
  const extension = filename.split('.').pop()?.toLowerCase()
  const isValid = extension ? allowedExtensions.includes(extension) : false

  return {
    isValid,
    errors: isValid ? undefined : [`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`],
  }
}

// Phone number validation (basic)
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  const isValid = phoneRegex.test(phone)

  return {
    isValid,
    errors: isValid ? undefined : ['Please provide a valid phone number'],
  }
}

// URL validation
export const validateUrl = (url: string): ValidationResult => {
  try {
    new URL(url)
    return { isValid: true }
  } catch {
    return {
      isValid: false,
      errors: ['Please provide a valid URL'],
    }
  }
}

// String sanitization
export const sanitizeString = (str: string): string => {
  if (!str) return ''
  return str.trim().replace(/[<>]/g, '')
}

// Generate secure token
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Deep clone objects
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

// Sleep utility for async operations
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Calculate age from date of birth
export const calculateAge = (dob: Date | string): number => {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generate API response wrapper
export const createApiResponse = <T>(success: boolean, message: string, data?: T, statusCode: number = 200) => ({
  success,
  message,
  data: data || null,
  timestamp: new Date().toISOString(),
  statusCode,
})

export default {
  validateEmail,
  validatePasswordStrength,
  validateFileType,
  validatePhoneNumber,
  validateUrl,
  sanitizeString,
  generateSecureToken,
  deepClone,
  sleep,
  calculateAge,
  formatFileSize,
  createApiResponse,
}

import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Environment enum
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

// Helper functions
const isProduction = (): boolean => process.env.NODE_ENV === Environment.PRODUCTION
const isDevelopment = (): boolean => process.env.NODE_ENV === Environment.DEVELOPMENT
const isTest = (): boolean => process.env.NODE_ENV === Environment.TEST

// Configuration object
const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || '9000'),
    environment: (process.env.NODE_ENV as Environment) || Environment.DEVELOPMENT,
    host: process.env.HOST || 'localhost',
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    isTest: isTest(),
  },

  // Database configuration
  database: {
    url: process.env.DB_URL!,
    name: process.env.DB_NAME!,
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET_KEY!,
    ttl: 14 * 24 * 60 * 60, // 14 days in seconds
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
    secure: isProduction(),
    httpOnly: true,
    sameSite: 'lax' as const,
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
      error: 'Too many request, please try again later.',
      retryAfter: 900,
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Auth rate limiting (stricter)
  authRateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
      error: 'Too many login attempts',
      retryAfter: 900,
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  sessionRateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 20000,
    message: {
      error: 'Too many session check requests, please try again later.',
      retryAfter: 900,
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Upload limits
  uploads: {
    jsonLimit: '10mb',
    urlencodedLimit: '10mb',
    fileSizeLimit: '100mb',
  },

  // CORS configuration
  cors: {
    origin: isProduction()
      ? ['http://lc.vitalicglobal.com', 'http://lc-test.vitalicglobal.com', 'http://localhost:9004']
      : ['http://localhost:3000', 'http://localhost:9004'],
    credentials: true,
  },

  // Asset configuration
  assets: {
    staticPath: 'public',
    viewsPath: 'views',
  },

  // Logging configuration
  logging: {
    level: isProduction() ? 'warn' : 'info',
    format: 'combined' as const,
    enableAccessLogs: true,
  },

  // Health check configuration
  health: {
    enabled: !isTest(),
    path: '/health',
    metricsInterval: 60000, // 1 minute
  },

  // S3 configuration (if used)
  s3: {
    bucketName: process.env.AWS_BUCKET_NAME!,
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
}

// Configuration validation
function validateConfig(): void {
  const required = ['DB_URL', 'DB_NAME', 'SESSION_SECRET_KEY', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_KEY', 'AWS_BUCKET_NAME']

  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Validate port
  if (isNaN(config.server.port) || config.server.port < 1 || config.server.port > 65535) {
    throw new Error('PORT must be a valid number between 1 and 65535')
  }

  console.log('✅ Configuration validation passed')
}

// Validate on module load
validateConfig()

export default config

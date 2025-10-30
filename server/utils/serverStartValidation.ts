import db from '../config/connect'

export function validateEnvironment(): void {
  console.log('🔧 Validating environment variables...')

  const requiredEnvVars = [
    'DB_URL',
    'DB_NAME',
    'SESSION_SECRET_KEY',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_KEY',
    'AWS_BUCKET_NAME',
  ]

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}`
    console.error('❌', errorMsg)
    throw new Error(errorMsg)
  }

  const dbUrl = process.env.DB_URL!
  if (!dbUrl.startsWith('mongodb://') && !dbUrl.startsWith('mongodb+srv://')) {
    console.warn('⚠️  DB_URL might be invalid - should start with mongodb:// or mongodb+srv://')
  }

  console.log('✅ Environment validation passed')
}

export async function validateDatabaseConnection(): Promise<void> {
  console.log('🗄️  Testing database connection...')

  try {
    await db()
    console.log('✅ Database connection successful')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw new Error('Database connection validation failed')
  }
}

export async function validateServerDependencies(): Promise<void> {
  try {
    validateEnvironment()
    await validateDatabaseConnection()
  } catch (error) {
    console.error('\n💥 SERVER VALIDATION FAILED:')
    console.error('Error:', error)
    console.error('\n🔄 Please check the following:')
    console.error('1. Environment variables are set correctly')
    console.error('2. MongoDB is running and accessible')
    process.exit(1)
  }
}

export class ServerValidation {
  static validateEnvironment(): void {
    validateEnvironment()
  }

  static async validateDatabase(): Promise<void> {
    await validateDatabaseConnection()
  }

  static async validateAll(): Promise<void> {
    await validateServerDependencies()
  }
}

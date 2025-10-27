const mongoose = require('mongoose')
const path = require('path')

// Load test environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.test') })

module.exports = async () => {
  console.log('🔧 Setting up test database connection...')

  try {
    // Use the test database configuration
    const dbConnection = process.env.DB_CONNECTION_DEV || process.env.DB_CONNECTION_PROD
    const dbName = process.env.DB_DEV || process.env.DB_PROD

    if (!dbConnection) {
      throw new Error('Database connection string not found in environment variables')
    }

    // Connect to MongoDB
    await mongoose.connect(dbConnection, {
      dbName: dbName,
    })

    console.log(`✅ Connected to test database: ${dbName}`)

    // Store connection info for tests
    global.__MONGO_URI__ = dbConnection
    global.__MONGO_DB_NAME__ = dbName
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error)
    process.exit(1)
  }
}

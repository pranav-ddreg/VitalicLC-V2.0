const mongoose = require('mongoose')

module.exports = async () => {
  console.log('🔧 Cleaning up test database connection...')

  try {
    // Close all mongoose connections
    await mongoose.disconnect()

    // Force close any remaining connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(true)
    }

    // Clear the mongoose connection cache
    mongoose.models = {}
    mongoose.modelSchemas = {}

    console.log('✅ Test database connection closed')

    // Give a small delay to ensure cleanup
    await new Promise((resolve) => setTimeout(resolve, 100))
  } catch (error) {
    console.error('❌ Error closing test database connection:', error)
  }
}

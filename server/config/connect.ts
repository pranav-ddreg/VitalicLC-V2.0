import mongoose from 'mongoose'
import config from './app.config'

// Disable strictQuery deprecation warning
mongoose.set('strictQuery', false)

// Connection status tracking
let connectionStatus = 'disconnected'

mongoose.connection.on('connected', () => {
  connectionStatus = 'connected'
  console.log('✅ MongoDB connected successfully')
})

mongoose.connection.on('error', (error) => {
  connectionStatus = 'error'
  console.error('❌ MongoDB connection error:', error.message)
})

mongoose.connection.on('disconnected', () => {
  connectionStatus = 'disconnected'
  console.log('📤 MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  connectionStatus = 'connected'
  console.log('🔄 MongoDB reconnected')
})

// Database connection function with comprehensive configuration
export default async function (): Promise<mongoose.Connection> {
  try {
    const connectionString = `${config.database.url}/${config.database.name}?retryWrites=true&w=majority`

    const options: mongoose.ConnectOptions = {
      // Connection Pooling (Enterprise-ready)
      // maxPoolSize: 10, // Maximum connection pool size
      // minPoolSize: 2, // Minimum connections to maintain
      // maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity

      // Compression (Performance optimization)
      compressors: 'zstd', // Use Zstd compression (modern, efficient)
      zlibCompressionLevel: 6, // Balanced compression

      // Retry & Reliability
      retryWrites: true,
      retryReads: true, // Enable retryable reads
      maxStalenessSeconds: 90, // Allow reads from secondaries up to 90 seconds stale

      // Security (Production-ready)
      tls: true, // Force TLS encryption
      tlsInsecure: false, // Require valid certificates
      // tlsCAFile: process.env.CA_CERT_PATH, // Optional: Custom CA certificates

      // Authentication
      authSource: 'admin', // Default auth database
      authMechanism: 'DEFAULT', // Use MongoDB's default auth
    }

    const connected = await mongoose.connect(connectionString, options)
    console.log(`🚀 MongoDB connected to database: ${connected.connection.name}`)

    return connected.connection
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error'
    console.error('💥 MongoDB connection failed:', errorMessage)
    connectionStatus = 'error'
    throw error
  }
}

// Utility functions for monitoring
export function getConnectionStatus(): string {
  return connectionStatus
}

export function getConnectionPoolStats(): any {
  if (!mongoose.connection?.readyState) return { readyState: -1 }

  return {
    readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected
    poolSize: (mongoose.connection as any)?.$pool?.totalConnectionCount || 0,
    availableConnections: (mongoose.connection as any)?.$pool?.available || 0,
    pendingOperations: (mongoose.connection as any)?.$pool?.pending || 0,
  }
}

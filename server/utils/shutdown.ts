import { SocketIOServer } from '../types/serverTypes'
import { SecurityLogger } from '../services/securityLogger'

/**
 * Graceful shutdown handler with proper cleanup
 */
export async function gracefulShutdown(signal: string, io?: SocketIOServer): Promise<void> {
  console.log(`📤 Received ${signal}, starting graceful shutdown...`)

  // Log the shutdown event
  await SecurityLogger.logServerShutdown(signal)

  let shutdownTimeout: NodeJS.Timeout | undefined

  try {
    console.log('🔄 Setting up shutdown timeout (30 seconds)...')

    // Set a 30-second timeout for force shutdown
    const forceShutdownTimeout = 30000
    shutdownTimeout = setTimeout(() => {
      console.error('⏰ Force shutdown due to timeout')
      process.exit(1)
    }, forceShutdownTimeout)

    // Close Socket.IO connections
    console.log('🔌 Closing Socket.IO connections...')
    if (io) {
      try {
        io.close(() => {
          console.log('✅ Socket.IO connections closed gracefully')
        })

        // Give Socket.IO time to close connections (max 5 seconds)
        await new Promise((resolve) => {
          const socketTimeout = setTimeout(() => {
            console.log('⚠️  Socket.IO close timeout, continuing...')
            resolve(void 0)
          }, 5000)

          io.close(() => {
            clearTimeout(socketTimeout)
            resolve(void 0)
          })
        })
      } catch (error) {
        console.error('❌ Error closing Socket.IO:', error)
      }
    }

    // Close database connections
    console.log('🗄️  Closing database connections...')
    try {
      const mongoose = require('mongoose')
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close()
        console.log('✅ Database connections closed gracefully')
      } else {
        console.log('⚠️  Database connection already closed')
      }
    } catch (error) {
      console.error('❌ Error closing database connection:', error)
    }

    // Clear shutdown timeout since we're shutting down gracefully
    if (shutdownTimeout) {
      clearTimeout(shutdownTimeout)
    }

    console.log('✅ All connections closed. Graceful shutdown complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error)

    // Clear timeout and force shutdown
    if (shutdownTimeout) {
      clearTimeout(shutdownTimeout)
    }

    console.error('💥 Force shutting down due to error')
    process.exit(1)
  }
}

/**
 * Shutdown manager class for better organization
 */
export class ShutdownManager {
  private static io: SocketIOServer | undefined

  /**
   * Initialize with Socket.IO instance
   */
  static initialize(io: SocketIOServer): void {
    this.io = io
  }

  /**
   * Register all shutdown handlers
   */
  static registerHandlers(): void {
    console.log('🛡️  Registering shutdown handlers...')

    process.on('SIGTERM', () => {
      console.log('📤 SIGTERM received. Initiating graceful shutdown...')
      gracefulShutdown('SIGTERM', this.io)
    })

    process.on('SIGINT', () => {
      console.log('📤 SIGINT received. Initiating graceful shutdown...')
      gracefulShutdown('SIGINT', this.io)
    })

    process.on('uncaughtException', (error) => {
      console.error('💀 Uncaught Exception:', error)
      console.error('Stack:', error.stack)
      // Don't call graceful shutdown for exceptions
      process.exit(1)
    })

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💀 Unhandled Rejection at:', promise, 'reason:', reason)
      gracefulShutdown('unhandledRejection', this.io)
    })

    console.log('✅ Shutdown handlers registered')
  }
}

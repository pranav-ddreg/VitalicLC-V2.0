// Load environment variables first - before any other imports
require('dotenv').config()

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import cors from 'cors'
import morgan from 'morgan'
import http from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import db from './config/connect'
import path from 'path'
import moment from 'moment'
import fs from 'fs'

// Environment validation function
function validateEnvironment(): void {
  console.log('🔧 Step 1: Validating environment variables...')

  const requiredEnvVars = ['DB_URL', 'DB_NAME', 'SESSION_SECRET_KEY', 'PORT']

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '))
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
  }

  console.log('✅ Environment validation passed')
}

// Database connection test
async function validateDatabaseConnection(): Promise<void> {
  console.log('🗄️  Step 2: Testing database connection...')

  try {
    await db()
    console.log('✅ Database connection successful')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw new Error('Database connection validation failed')
  }
}

// Route loading function with better error handling
function loadRoutes(app: express.Application): void {
  console.log('🚀 Step 3: Loading routes...')

  const routesPath = path.join(__dirname, 'routes')
  let routesLoaded = 0

  if (!fs.existsSync(routesPath)) {
    console.error('❌ Routes directory not found:', routesPath)
    throw new Error('Routes directory not found')
  }

  try {
    const files = fs.readdirSync(routesPath)

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        try {
          const routePath = path.join(routesPath, file)
          const routeModule = require(routePath)
          const router = routeModule.default || routeModule

          const routeName = file.split('.')[0]
          app.use(`/api/${routeName}`, router)
          routesLoaded++

          console.log(`   📍 Loaded route: /api/${routeName}`)
        } catch (routeError) {
          console.error(`❌ Failed to load route ${file}:`, routeError)
          throw new Error(`Route loading failed for ${file}`)
        }
      }
    }

    if (routesLoaded === 0) {
      console.warn('⚠️  No routes were loaded')
    } else {
      console.log(`✅ Successfully loaded ${routesLoaded} routes`)
    }
  } catch (error) {
    console.error('❌ Route loading process failed:', error)
    throw error
  }
}

// Server startup function
async function startServer(): Promise<void> {
  console.log('🎯 Starting VitaLC Server...')

  try {
    // Step 1: Validate environment
    validateEnvironment()

    // Step 2: Initialize Express app
    const app: express.Application = express()
    const server = http.createServer(app)

    // Step 3: Test database connection
    await validateDatabaseConnection()

    // Step 4: Configure app basics
    console.log('⚙️  Step 4: Configuring Express application...')

    app.locals.moment = moment

    // Security middleware
    app.use(helmet())
    app.use(helmet.frameguard({ action: 'deny' }))

    // CORS setup
    app.use(
      cors({
        origin: [
          'http://localhost:3000',
          'http://localhost:9004',
          'http://lc.vitalicglobal.com',
          'http://lc-test.vitalicglobal.com',
        ],
      })
    )

    app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      next()
    })

    // Basic middleware
    app.use(express.json({ limit: '100mb' }))
    app.use(express.urlencoded({ extended: true }))
    app.use(morgan('dev'))

    // Static files and views
    app.use(express.static(path.join(__dirname, 'public')))
    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, 'views'))

    // Step 5: Configure session store
    console.log('🔑 Step 5: Setting up session management...')

    app.use(
      session({
        secret: process.env.SESSION_SECRET_KEY!,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl: `${process.env.DB_URL}/${process.env.DB_NAME}`,
          collectionName: 'sessions',
          ttl: 14 * 24 * 60 * 60,
          autoRemove: 'interval' as any,
          autoRemoveInterval: 10,
        }),
      })
    )

    // Step 6: Load routes
    loadRoutes(app)

    // Step 7: Socket.IO setup
    console.log('🔌 Step 7: Initializing Socket.IO...')

    interface ServerToClientEvents {
      'joined-room': (userId: string) => void
    }

    interface ClientToServerEvents {
      join: (userId: string) => void
      disconnect: () => void
    }

    interface InterServerEvents {
      ping: () => void
    }

    interface SocketData {
      userId: string
    }

    const io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> =
      new SocketIOServer(server, {
        cors: {
          origin: [
            'http://lc-test.vitalicglobal.com',
            'http://localhost:9004',
            'http://localhost:3000',
            'http://localhost:9000',
            'http://lc.vitalicglobal.com',
          ],
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        },
      })

    // Socket.IO connection handler
    io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
      console.log('A user connected via socket.io')

      socket.on('join', (userId: string) => {
        console.log(`📨 Received join event with userId: ${userId}`)
        socket.join(userId)
        console.log(`✅ User ${userId} joined socket room`)

        // Confirm room join to client for debugging/stability checks
        socket.emit('joined-room', userId)
        console.log(`🔄 Emitted joined-room confirmation to client: ${userId}`)
      })

      socket.on('disconnect', () => {
        console.log('A user disconnected from socket')
      })
    })

    // Global socket.io instance
    ;(global as any).io = io

    // Step 8: Error handling setup
    console.log('🛡️  Step 8: Setting up error handling...')

    process.on('uncaughtException', (err: Error) => {
      console.error('💀 Uncaught Exception:', err)
      process.exit(1)
    })

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('💀 Unhandled Rejection at:', promise, 'reason:', reason)
      process.exit(1)
    })

    // Step 9: Start server (only if all checks passed)
    const PORT = process.env.PORT || 9000

    console.log('🚀 Step 9: Starting server...')
    console.log(`📡 Server will listen on port ${PORT}`)
    console.log('⏳ Attempting to start server...')

    return new Promise((resolve, reject) => {
      server.listen(PORT, () => {
        console.log('🎉 =========================================================================')
        console.log(`🎉                 VitaLC Server Started Successfully!               `)
        console.log('🎉 =========================================================================')
        console.log(`🚀 Server running on http://localhost:${PORT}`)
        console.log('✅ Environment validation: PASSED')
        console.log('✅ Database connection: PASSED')
        console.log('✅ Route loading: PASSED')
        console.log('✅ Socket.IO: INITIALIZED')
        console.log('🎉 =========================================================================')
        resolve()
      })

      server.on('error', (error) => {
        console.error('❌ Server failed to start:', error)
        reject(error)
      })
    })
  } catch (error) {
    console.error('\n💥 SERVER STARTUP FAILED:')
    console.error('Error details:', error)
    console.error('\n🔄 Please check the following:')
    console.error('1. Environment variables are set correctly')
    console.error('2. Database is running and accessible')
    console.error('3. Required ports are not occupied')
    console.error('4. Route files exist and are valid')
    process.exit(1)
  }
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('📤 SIGTERM received. Shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('📤 SIGINT received. Shutting down gracefully...')
  process.exit(0)
})

// Start the server
startServer().catch((error) => {
  console.error('💥 Fatal error during server startup:', error)
  process.exit(1)
})

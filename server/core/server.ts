import express from 'express'
import http from 'http'
import path from 'path'
import moment from 'moment'
import config from '../config/app.config'
import { validateServerDependencies } from '../utils/serverStartValidation'
import { RouteLoader } from '../utils/route-loader'
import { SecurityMiddleware } from '../middleware/serverSecurity'
import { SocketManager } from './socket'
import { ShutdownManager } from '../utils/shutdown'
import { errorHandler, notFoundHandler } from '../middleware/error.middleware'
import { SecurityLogger } from '../services/securityLogger'

export class ServerCore {
  private static app: express.Application
  private static server: http.Server

  static async start(): Promise<void> {
    const startTime = Date.now()
    console.log('🎯 Starting VitaLC Server...')
    console.log(`⏰ Startup timestamp: ${new Date().toISOString()}`)

    try {
      await validateServerDependencies()

      this.app = this.createExpressApp()
      this.server = http.createServer(this.app)

      SecurityMiddleware.setupAll(this.app)
      this.setupSessionStore()
      await RouteLoader.loadAll(this.app)
      this.setupErrorHandling()

      const io = SocketManager.initialize(this.server)
      ShutdownManager.initialize(io)
      ShutdownManager.registerHandlers()

      await this.startHttpServer()

      const totalTime = Date.now() - startTime
      console.log('✅ Server initialized successfully')
      console.log(`🚀 Server running on http://localhost:${config.server.port}`)
      console.log(`⏱️  Startup time: ${totalTime}ms`)

      await SecurityLogger.logServerStart(totalTime)
    } catch (error) {
      console.error('\n💥 SERVER STARTUP FAILED:')
      console.error('Error:', error)
      process.exit(1)
    }
  }

  /**
   * Create and configure Express application
   */
  private static createExpressApp(): express.Application {
    const app = express()

    // Basic Express setup
    app.locals.moment = moment

    // Static files and views
    app.use(express.static(path.join(__dirname, '..', 'public')))
    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, '..', 'views'))

    return app
  }

  /**
   * Setup session store configuration
   */
  private static setupSessionStore(): void {
    const session = require('express-session')
    const MongoStore = require('connect-mongo')

    this.app.use(
      session({
        secret: config.session.secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: config.session.ttl,
          httpOnly: true,
          secure: config.server.isProduction,
          sameSite: 'strict' as const,
        },
        store: MongoStore.create({
          mongoUrl: `${config.database.url}/${config.database.name}`,
          collectionName: 'sessions',
          ttl: config.session.ttl,
          autoRemove: 'interval' as any,
          autoRemoveInterval: 10,
        }),
      })
    )
  }

  /**
   * Setup error handling middleware
   */
  private static setupErrorHandling(): void {
    // Add health check endpoint
    this.app.get('/_internal/status', async (req, res) => {
      try {
        const mongoose = require('mongoose')
        await mongoose.connection.db.admin().ping()

        const memoryUsage = process.memoryUsage()
        const uptime = process.uptime()

        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: Math.floor(uptime),
          memory: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          },
          database: 'connected',
          version: process.version,
          environment: config.server.environment,
        })
      } catch (error: any) {
        console.error('Health check failed:', error.message)
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: config.server.isDevelopment ? error.message : 'Service unavailable',
        })
      }
    })

    // Error handling middleware (must be last)
    this.app.use(notFoundHandler)
    this.app.use(errorHandler)
  }

  /**
   * Start the HTTP server
   */
  private static startHttpServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(config.server.port, () => {
        resolve()
      })

      this.server.on('error', (error) => {
        console.error('❌ Server failed to start:', error)
        reject(error)
      })
    })
  }
}

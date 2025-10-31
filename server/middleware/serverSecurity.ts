import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import config from '../config/app.config'

export class SecurityMiddleware {
  static setupHelmet(app: express.Application): void {
    console.log('🔒 Setting up Helmet security middleware...')

    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            connectSrc: ["'self'", 'https:', 'wss:'],
            frameSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        },
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        hsts: config.server.isProduction,
        noSniff: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        xssFilter: true,
      })
    )

    console.log('✅ Helmet security middleware configured')
  }

  static setupAdditionalHeaders(app: express.Application): void {
    console.log('🛡️ Setting up additional security headers...')

    app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader('X-DNS-Prefetch-Control', 'off')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('X-XSS-Protection', '1; mode=block')
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

      if (req.path.includes('/auth/') || req.path.includes('/login')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Expires', '0')
      }

      next()
    })

    console.log('✅ Additional security headers configured')
  }

  // static setupRateLimiting(app: express.Application): void {
  //   console.log('🏃 Setting up rate limiting...')

  //   const rateLimit = require('express-rate-limit')
  //   const limiter = rateLimit.rateLimit(config.rateLimit)
  //   app.use('/api/', limiter)

  //   const authLimiter = rateLimit.rateLimit(config.authRateLimit)
  //   app.use('/api/auth', authLimiter)

  //   const sessionLimiter = rateLimit.rateLimit(config.sessionRateLimit)
  //   app.use('/api/auth/session', sessionLimiter)

  //   console.log('✅ Rate limiting configured')
  // }

  static setupCORS(app: express.Application): void {
    console.log('🌐 Setting up CORS...')

    const cors = require('cors')
    app.use(cors(config.cors))

    console.log('✅ CORS configured')
  }

  static setupUploadLimits(app: express.Application): void {
    console.log('📤 Setting up upload limits...')

    app.use(express.json({ limit: config.uploads.jsonLimit }))
    app.use(express.urlencoded({ limit: config.uploads.urlencodedLimit, extended: true }))

    console.log('✅ Upload limits configured')
  }

  static setupLogging(app: express.Application): void {
    if (config.logging.enableAccessLogs) {
      console.log('📝 Setting up access logging...')

      const morgan = require('morgan')
      app.use(morgan(config.logging.format))

      console.log('✅ Access logging configured')
    } else {
      console.log('⚠️  Access logging disabled')
    }
  }

  static setupAll(app: express.Application): void {
    console.log('� Configuring complete security stack...')

    this.setupHelmet(app)
    this.setupAdditionalHeaders(app)
    this.setupCORS(app)
    // this.setupRateLimiting(app)
    this.setupUploadLimits(app)
    this.setupLogging(app)

    console.log('✅ Complete security stack configured')
  }
}

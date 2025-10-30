import { ServerLogModel } from '../model/serverLogs'
import { SecurityEventModel, ISecurityEvent } from '../model/securityEvents'
import config from '../config/app.config'

export class SecurityLogger {
  static async logServerStart(startupTime?: number, error?: any): Promise<void> {
    try {
      const memoryUsage = process.memoryUsage()
      const eventData = {
        eventType: 'start' as const,
        timestamp: new Date(),
        startupTime,
        environment: config.server.environment,
        nodeVersion: process.version,
        memoryUsage: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        },
        databaseStatus: 'connected' as const,
        port: config.server.port,
        errorDetails: error ? { message: error.message, stack: error.stack } : undefined,
      }

      await ServerLogModel.create(eventData)
    } catch (logError) {
      console.warn('Failed to log server start event:', logError)
    }
  }

  static async logServerShutdown(reason: string = 'normal'): Promise<void> {
    try {
      const memoryUsage = process.memoryUsage()
      const eventData = {
        eventType: 'shutdown' as const,
        timestamp: new Date(),
        environment: config.server.environment,
        nodeVersion: process.version,
        memoryUsage: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        },
        databaseStatus: 'connected' as const,
        port: config.server.port,
        reason,
      }

      await ServerLogModel.create(eventData)
    } catch (logError) {
      console.warn('Failed to log server shutdown event:', logError)
    }
  }

  static async logSecurityEvent(
    eventType: ISecurityEvent['eventType'],
    severity: ISecurityEvent['severity'],
    req: any,
    additionalData?: {
      detectedPattern?: string
      mitigationAction?: string
      notes?: string
    }
  ): Promise<void> {
    try {
      const userAgent = req.get('User-Agent') || req.headers['user-agent']
      const sourceIP = this.getClientIP(req)
      const userAgentAnalysis = this.analyzeUserAgent(userAgent)
      const riskScore = this.calculateRiskScore(req, eventType, userAgentAnalysis)

      const eventData: Partial<ISecurityEvent> = {
        eventType,
        severity,
        timestamp: new Date(),
        sourceIP,
        userAgent,
        sessionId: req.session?.id,
        endpoint: req.originalUrl || req.url,
        method: req.method,
        headers: {
          accept: req.get('Accept'),
          'accept-language': req.get('Accept-Language'),
          'cache-control': req.get('Cache-Control'),
          referer: req.get('Referer'),
        },
        detectedPattern: additionalData?.detectedPattern,
        mitigationAction: additionalData?.mitigationAction || 'blocked',
        userAgentAnalysis,
        riskScore,
        notes: additionalData?.notes,
      }

      await SecurityEventModel.create(eventData)

      if (severity === 'critical' || riskScore >= 80) {
        console.error('🚨 CRITICAL SECURITY EVENT:', {
          type: eventType,
          ip: sourceIP,
          endpoint: eventData.endpoint,
          riskScore,
        })
      }
    } catch (logError) {
      console.warn('Failed to log security event:', logError)
    }
  }

  static async logRateLimitExceeded(req: any): Promise<void> {
    await this.logSecurityEvent('rate_limit_exceeded', 'medium', req, {
      mitigationAction: 'rate_limited',
      notes: 'Rate limit exceeded - potential abuse',
    })
  }

  /**
   * Analyze user agent string
   */
  private static analyzeUserAgent(userAgent?: string) {
    if (!userAgent) {
      return {
        browser: 'Unknown',
        os: 'Unknown',
        device: 'Unknown',
        isBot: false,
        automationIndicators: [],
      }
    }

    const lowerUserAgent = userAgent.toLowerCase()
    const automationIndicators: string[] = []

    // Bot detection
    const botPatterns = [
      'bot',
      'crawler',
      'spider',
      'scraper',
      'headless',
      'selenium',
      'chrome-lighthouse',
      'puppeteer',
      'phantomjs',
      'python-requests',
      'curl',
      'wget',
      'postman',
    ]

    const isBot = botPatterns.some((pattern) => lowerUserAgent.includes(pattern))
    if (isBot) {
      automationIndicators.push('bot_detected')
    }

    // Browser detection
    let browser = 'Unknown'
    if (lowerUserAgent.includes('chrome') && !lowerUserAgent.includes('edge')) {
      browser = 'Chrome'
    } else if (lowerUserAgent.includes('firefox')) {
      browser = 'Firefox'
    } else if (lowerUserAgent.includes('safari') && !lowerUserAgent.includes('chrome')) {
      browser = 'Safari'
    } else if (lowerUserAgent.includes('edge')) {
      browser = 'Edge'
    }

    // OS detection
    let os = 'Unknown'
    if (lowerUserAgent.includes('windows')) {
      os = 'Windows'
    } else if (lowerUserAgent.includes('mac')) {
      os = 'macOS'
    } else if (lowerUserAgent.includes('linux')) {
      os = 'Linux'
    } else if (lowerUserAgent.includes('android')) {
      os = 'Android'
    } else if (lowerUserAgent.includes('ios') || lowerUserAgent.includes('iphone')) {
      os = 'iOS'
    }

    // Device detection
    let device = 'Desktop'
    if (lowerUserAgent.includes('mobile')) {
      device = 'Mobile'
    } else if (lowerUserAgent.includes('tablet')) {
      device = 'Tablet'
    }

    // Check for automation indicators
    if (lowerUserAgent.includes('selenium')) {
      automationIndicators.push('selenium_detected')
    }
    if (lowerUserAgent.includes('headless')) {
      automationIndicators.push('headless_browser')
    }
    if (!lowerUserAgent.includes('mozilla')) {
      automationIndicators.push('non_standard_agent')
    }

    return {
      browser,
      os,
      device,
      isBot,
      automationIndicators,
    }
  }

  /**
   * Calculate risk score based on request characteristics
   */
  private static calculateRiskScore(req: any, eventType: string, userAgentAnalysis: any): number {
    let riskScore = 0

    // Base scores by event type
    const baseScores = {
      sql_injection_attempt: 90,
      xss_attempt: 80,
      rate_limit_exceeded: 30,
      csrf_attempt: 60,
      suspicious_activity: 40,
      attack_attempt: 70,
    }
    riskScore += baseScores[eventType as keyof typeof baseScores] || 20

    // Add points for suspicious characteristics
    if (userAgentAnalysis.isBot) riskScore += 20
    if (userAgentAnalysis.automationIndicators.length > 0) riskScore += 15
    if (req.method === 'POST' && req.path.includes('login')) riskScore += 10
    if (req.get('Referer') === undefined) riskScore += 5

    // Cap at 100
    return Math.min(100, riskScore)
  }

  /**
   * Get client IP address from request
   */
  private static getClientIP(req: any): string {
    // Handle proxy headers (X-Forwarded-For, etc.)
    const forwardedFor = req.get('X-Forwarded-For')
    if (forwardedFor) {
      // Take first IP if multiple (most recent proxy)
      return forwardedFor.split(',')[0].trim()
    }

    const realIP = req.get('X-Real-IP')
    if (realIP) return realIP

    const clientIP = req.get('X-Client-IP')
    if (clientIP) return clientIP

    return req.ip || req.socket?.remoteAddress || 'unknown'
  }

  /**
   * Get recent security events (for monitoring dashboard)
   */
  static async getRecentEvents(limit = 50): Promise<ISecurityEvent[]> {
    try {
      return await SecurityEventModel.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('userId', 'name email')
        .exec()
    } catch (error) {
      console.warn('Failed to fetch recent security events:', error)
      return []
    }
  }

  /**
   * Get high-risk events
   */
  static async getHighRiskEvents(): Promise<ISecurityEvent[]> {
    try {
      return await SecurityEventModel.find({
        $or: [{ severity: 'critical' }, { riskScore: { $gte: 80 } }],
      })
        .sort({ timestamp: -1 })
        .limit(100)
        .exec()
    } catch (error) {
      console.warn('Failed to fetch high-risk security events:', error)
      return []
    }
  }

  /**
   * Clean up old events (retention policy)
   */
  static async cleanupOldEvents(daysToKeep = 90): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const serverResult = await ServerLogModel.deleteMany({
        timestamp: { $lt: cutoffDate },
      })

      const securityResult = await SecurityEventModel.deleteMany({
        timestamp: { $lt: cutoffDate },
      })

      console.log(
        `Cleaned up ${serverResult.deletedCount} server events and ${securityResult.deletedCount} security events older than ${daysToKeep} days`
      )
    } catch (error) {
      console.warn('Failed to cleanup old security events:', error)
    }
  }
}

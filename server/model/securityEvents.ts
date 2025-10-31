import mongoose, { Schema, Document } from 'mongoose'

export interface ISecurityEvent extends Document {
  eventType:
    | 'attack_attempt'
    | 'rate_limit_exceeded'
    | 'suspicious_activity'
    | 'sql_injection_attempt'
    | 'xss_attempt'
    | 'csrf_attempt'
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  sourceIP: string
  userAgent?: string
  userId?: string
  sessionId?: string
  endpoint: string
  method: string
  headers?: any
  payload?: any
  detectedPattern?: string
  mitigationAction: string
  geography?: {
    country?: string
    city?: string
    latitude?: number
    longitude?: number
  }
  userAgentAnalysis?: {
    browser?: string
    os?: string
    device?: string
    isBot?: boolean
    automationIndicators?: string[]
  }
  riskScore: number
  notes?: string
}

const securityEventSchema = new Schema<ISecurityEvent>(
  {
    eventType: {
      type: String,
      enum: [
        'attack_attempt',
        'rate_limit_exceeded',
        'suspicious_activity',
        'sql_injection_attempt',
        'xss_attempt',
        'csrf_attempt',
      ],
      required: true,
      index: true,
    },
    timestamp: { type: Date, default: Date.now, required: true, index: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true, index: true },
    sourceIP: { type: String, required: true, index: true },
    userAgent: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, index: true },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    headers: { type: Schema.Types.Mixed },
    payload: { type: Schema.Types.Mixed },
    detectedPattern: { type: String },
    mitigationAction: { type: String, required: true },
    geography: {
      country: { type: String },
      city: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    userAgentAnalysis: {
      browser: { type: String },
      os: { type: String },
      device: { type: String },
      isBot: { type: Boolean, default: false },
      automationIndicators: [{ type: String }],
    },
    riskScore: { type: Number, default: 0, min: 0, max: 100, index: true },
    notes: { type: String },
  },
  {
    timestamps: true,
    collection: 'securityEvents',
  }
)

securityEventSchema.index({ timestamp: -1 })
securityEventSchema.index({ sourceIP: 1, timestamp: -1 })
securityEventSchema.index({ userId: 1, timestamp: -1 })
securityEventSchema.index({ eventType: 1, timestamp: -1 })
securityEventSchema.index({ severity: 1, timestamp: -1 })
securityEventSchema.index({ riskScore: -1, timestamp: -1 })

export const SecurityEventModel = mongoose.model<ISecurityEvent>('SecurityEvent', securityEventSchema)

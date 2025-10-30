import mongoose, { Schema, Document } from 'mongoose'

export interface IServerLog extends Document {
  eventType: 'start' | 'restart' | 'shutdown'
  timestamp: Date
  startupTime?: number
  environment: string
  nodeVersion: string
  memoryUsage: {
    rss: string
    heapTotal: string
    heapUsed: string
  }
  databaseStatus: 'connected' | 'disconnected' | 'error'
  port: number
  reason?: string
  socketIOConnections?: number
  activeRoutes?: number
  errorDetails?: any
}

const serverLogSchema = new Schema<IServerLog>(
  {
    eventType: {
      type: String,
      enum: ['start', 'restart', 'shutdown'],
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    startupTime: { type: Number },
    environment: { type: String, required: true, index: true },
    nodeVersion: { type: String, required: true },
    memoryUsage: {
      rss: { type: String },
      heapTotal: { type: String },
      heapUsed: { type: String },
    },
    databaseStatus: {
      type: String,
      enum: ['connected', 'disconnected', 'error'],
      required: true,
    },
    port: { type: Number, required: true },
    reason: { type: String },
    socketIOConnections: { type: Number, default: 0 },
    activeRoutes: { type: Number, default: 0 },
    errorDetails: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: 'serverLogs',
  }
)

serverLogSchema.index({ timestamp: -1 })
serverLogSchema.index({ eventType: 1, timestamp: -1 })
serverLogSchema.index({ environment: 1 })

export const ServerLogModel = mongoose.model<IServerLog>('ServerLog', serverLogSchema)

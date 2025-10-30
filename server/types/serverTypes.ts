export interface ServerToClientEvents {
  'joined-room': (userId: string) => void
  notification: (data: any) => void
}

export interface ClientToServerEvents {
  join: (userId: string) => void
  disconnect: () => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  userId: string
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  timestamp: string
  code?: string
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  uptime?: number
  memory?: {
    rss: string
    heapTotal: string
    heapUsed: string
  }
  database?: string
  version?: string
  environment?: string
  error?: string
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  message?: string
  errors?: string[]
}

// Route loading result
export interface RouteLoadResult {
  success: boolean
  route: string
  error?: string
}

// Application configuration interfaces
export interface CorsConfig {
  origin: string[]
  credentials: boolean
}

export interface UploadLimits {
  jsonLimit: string
  urlencodedLimit: string
  fileSizeLimit: string
}

export interface HealthConfig {
  enabled: boolean
  path: string
  metricsInterval: number
}

// Export the Socket.IO Server type for use in other modules
export type { Server as SocketIOServer } from 'socket.io'

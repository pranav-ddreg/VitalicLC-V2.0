// Socket.IO manager
// Handles WebSocket connections and events

import http from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '../types/serverTypes'

/**
 * Socket.IO connection manager
 */
export class SocketManager {
  private static io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

  /**
   * Initialize Socket.IO with HTTP server
   */
  static initialize(
    server: http.Server
  ): SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
    console.log('🔌 Initializing Socket.IO...')

    this.io = new SocketIOServer(server, {
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

    this.setupEventHandlers()
    console.log('✅ Socket.IO initialized')
    return this.io
  }

  /**
   * Setup socket event handlers
   */
  private static setupEventHandlers(): void {
    this.io.on(
      'connection',
      (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
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
      }
    )
  }

  /**
   * Get the Socket.IO instance
   * Returns null if not initialized (for early module imports)
   */
  static getIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null {
    return this.io || null
  }

  /**
   * Safely get the Socket.IO instance (throws if not initialized)
   */
  static getRequiredIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
    if (!this.io) {
      throw new Error('Socket.IO not initialized. Make sure server has started.')
    }
    return this.io
  }

  /**
   * Send notification to specific user
   * Returns false if Socket.IO is not initialized
   */
  static notifyUser(userId: string, data: any): boolean {
    if (!this.io) {
      console.warn('⚠️  Cannot send notification - Socket.IO not initialized')
      return false
    }
    this.io.to(userId).emit('notification', data)
    return true
  }
}

// Export the instance getter for backward compatibility
export { SocketManager as default }

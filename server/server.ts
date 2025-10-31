declare global {
  namespace Express {
    interface Request {
      session?: any
    }
  }
}

import { ServerCore } from './core/server'
import { SocketManager } from './core/socket'

async function main(): Promise<void> {
  try {
    await ServerCore.start()
  } catch (error) {
    console.error('💥 Critical startup failure:', error)
    process.exit(1)
  }
}

let cachedIO: any = null
export const getIO = () => {
  if (!cachedIO) {
    cachedIO = SocketManager.getIO()
  }
  return cachedIO
}

export const io = getIO()

main()

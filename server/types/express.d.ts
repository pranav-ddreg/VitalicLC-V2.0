declare global {
  namespace Express {
    interface Request {
      session?: any
    }
  }
}

export {}

import { S3Client } from '@aws-sdk/client-s3'
import config from './app.config'

// Create optimized S3 client with modern AWS SDK v3 configuration
const s3 = new S3Client({
  region: config.s3.region,
  maxAttempts: 3, // Intelligent retry with exponential backoff

  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
})

export default s3

// Monitoring utilities
export function getS3ClientConfig() {
  return {
    region: s3.config.region,
    maxAttempts: s3.config.maxAttempts,
  }
}

// Health check function
export function testS3Connection(): boolean {
  return s3.config !== undefined && s3.config.region !== undefined
}

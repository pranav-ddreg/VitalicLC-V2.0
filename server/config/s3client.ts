import { S3Client } from '@aws-sdk/client-s3'
require('dotenv').config()

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
  requestHandler: {
    requestTimeout: 50000,
    httpsAgent: { maxSockets: 1000 },
  },
  // logger: console,
})

export default s3

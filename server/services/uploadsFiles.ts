import * as dotenv from 'dotenv'
import * as AWS from 'aws-sdk'
import { nanoid } from 'nanoid'
import * as fs from 'fs'
import * as Path from 'path'
import { GetObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import s3V3 from '../config/s3client'

// Load environment variables
dotenv.config()

// File interface for uploads
interface FileUpload {
  path: string
  name: string
  type: string
}

// Response interfaces
interface UploadResult {
  companyLogo?: any
  fileData?: any
  uploadFile?: any
  signedUrl?: string
  size?: number
  lastModified?: Date
  etag?: string
  data?: any
  error?: string
  location?: string
}

// Initialize S3 clients
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
})

// Image storage for company logos and other images
export const awsImageStorage = async (file: FileUpload, apiFolder?: string): Promise<UploadResult> => {
  console.log('apiFolder: ', apiFolder)
  try {
    let fileData: Buffer | undefined
    const folderPath: string = apiFolder ? apiFolder : ''
    const { path, name, type } = file

    if (Object.keys(file).length > 0) {
      fileData = fs.readFileSync(path)
    }

    if (!fileData) {
      throw new Error('No file data provided')
    }

    const imgKey: string = `${nanoid()}-${name}`
    console.log('folder path: ', folderPath)

    if (!process.env.AWS_BUCKET_NAME) {
      throw new Error('AWS_BUCKET_NAME not configured')
    }

    const params: AWS.S3.PutObjectRequest = {
      Bucket: (process.env.AWS_BUCKET_NAME || '') + folderPath,
      Key: imgKey,
      Body: fileData,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: type,
    }

    const imageFile = await s3
      .upload(params, async function (err: any) {
        if (err) return { error: err.message }
      })
      .promise()

    console.log('image file: ', imageFile)
    console.log(`File ${imgKey} uploaded successfully`)
    return { companyLogo: imageFile }
  } catch (error: any) {
    console.log(error)
    return { error: error.message }
  }
}

// Upload PDF files
export const uploadFile = async (file: FileUpload, apiFolder: string): Promise<UploadResult> => {
  const { path, name, type } = file
  const folderPath: string = apiFolder ? apiFolder : ''
  let fileData: Buffer | undefined
  try {
    if (Object.keys(file).length > 0) {
      fileData = fs.readFileSync(path)
    }

    if (!fileData) {
      throw new Error('No file data provided')
    }

    const ext: string = name.split('.').pop() || ''
    if (ext !== 'pdf') throw new Error('file should be pdf')
    const fileKey: string = `${nanoid()}.${ext}`

    // Construct proper key with folder path
    const key: string = folderPath ? `${folderPath.replace(/^\//, '')}/${fileKey}` : fileKey

    if (!process.env.AWS_BUCKET_NAME) {
      throw new Error('AWS_BUCKET_NAME not configured')
    }

    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: fileData,
      ACL: 'public-read',
      ContentType: type,
    }

    const uploadResult = await s3.upload(params).promise()
    console.log(`File ${fileKey} uploaded successfully to ${key}`)
    return { fileData: uploadResult }
  } catch (error: any) {
    console.error('File upload error:', error.message || error)
    return { error: 'File upload failed: ' + (error.message || error.code) }
  }
}

// Delete file from S3
export const deleteFile = async (file: { key: string }): Promise<void> => {
  try {
    const fileKeyToDelete: string = file?.key

    const deleteParams: AWS.S3.DeleteObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKeyToDelete,
    }

    // Deleting the file from the bucket
    s3.deleteObject(deleteParams, function (err: any, data: any) {
      if (err) {
        console.error('File deletion error:', err)
      } else {
        console.log(`File ${fileKeyToDelete} deleted successfully`, data)
      }
    })
  } catch (error: any) {
    console.log(error)
    throw error
  }
}

// Upload ZIP files to S3
export const uploadZip = async (path: string, fileData: Buffer, filename: string): Promise<UploadResult> => {
  try {
    // Validate path
    if (!path || typeof path !== 'string') throw new Error('Path not specified')
    if (path.includes('null') || path.includes('undefined')) throw new Error('Path not specified')

    // Validate bucket config
    if (!process.env.AWS_BUCKET_NAME) throw new Error('AWS_BUCKET_NAME not configured')

    // Get content type from file name
    const extension: string = (filename || '').toLowerCase().split('.').pop() || ''
    let contentType: string
    switch (extension) {
      case 'pdf':
        contentType = 'application/pdf'
        break
      case 'doc':
        contentType = 'application/msword'
        break
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
      case 'xls':
        contentType = 'application/vnd.ms-excel'
        break
      case 'xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'xml':
        contentType = 'application/xml'
        break
      case 'zip':
        contentType = 'application/zip'
        break
      case 'csv':
        contentType = 'text/csv'
        break
      case 'svg':
        contentType = 'image/svg+xml'
        break
      default:
        throw new Error('Please provide a valid file type')
    }

    // Parse file title
    const { name: title } = Path.parse(filename)
    if (title.includes('/')) {
      throw new Error("File name must not contain '/'")
    }

    // S3: Bucket must be ONLY the bucket name; put path in Key
    const key: string = `${path}/${title}_${Math.random().toString(36).substring(2, 15)}.${extension}`
    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: fileData,
      ACL: 'private',
      ContentType: contentType,
    }

    const uploadFile = await s3.upload(params).promise()
    return { uploadFile }
  } catch (error: any) {
    console.log('Error uploading zip', error?.message || error)
    return { error: 'Something Broken!!' }
  }
}

// Get file data from S3
export const getFileData = async (key: string): Promise<UploadResult> => {
  try {
    if (!process.env.AWS_BUCKET_NAME) {
      throw new Error('AWS_BUCKET_NAME not configured')
    }

    const params: AWS.S3.GetObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }

    const data = await s3.getObject(params).promise()
    return { data }
  } catch (error: any) {
    console.error('Error getting file data:', error)
    return { error: error.message }
  }
}

// Stream to buffer helper
const streamToString = (stream: any): Promise<Buffer> => {
  const chunks: Buffer[] = []
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

// Extract and store file from S3
export const extractAndStoreFile = async (filePath: string): Promise<UploadResult> => {
  try {
    const bucket = process.env.AWS_BUCKET_NAME
    if (!bucket) throw new Error('AWS_BUCKET_NAME not configured')

    const params: AWS.S3.GetObjectRequest = {
      Bucket: bucket,
      Key: filePath,
    }
    console.log(params, 'params')

    const data = s3.getObject(params).createReadStream()
    const fileData: Buffer = await streamToString(data)

    return { fileData }
  } catch (error: any) {
    console.error('Error extracting data from S3:', 'Something Broken!!')
    return { error: 'Something Broken!!' }
  }
}

// Presigned URL functions
export const getPresignedUrlForDownload = async (key: string): Promise<UploadResult> => {
  try {
    if (!process.env.AWS_BUCKET_NAME) {
      throw new Error('AWS_BUCKET_NAME not configured')
    }
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    })
    const signedUrl: string = await getSignedUrl(s3V3, command, { expiresIn: 3600 })
    return { signedUrl }
  } catch (error: any) {
    console.error('Error generating pre-signed URL for download:', error)
    return { error: error.message }
  }
}

export const getPresignedUrlForUpload = async (key: string, contentType?: string): Promise<UploadResult> => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    })
    const signedUrl: string = await getSignedUrl(s3V3, command, { expiresIn: 3600 })
    return { signedUrl }
  } catch (error: any) {
    console.error('Error generating pre-signed URL for upload:', error)
    return { error: error.message }
  }
}

// Get actual S3 file size and metadata
export const getS3FileSize = async (key: string): Promise<UploadResult> => {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    })
    const headObject = await s3V3.send(command)
    return {
      size: headObject.ContentLength,
      lastModified: headObject.LastModified,
      etag: headObject.ETag,
    }
  } catch (error: any) {
    console.error('Error getting S3 file size:', error)
    return { error: error.message }
  }
}

// Multipart upload functions (stubs for compatibility)
export const presignUpload = async (
  originalName: string,
  contentType?: string,
  sizeBytes?: number,
  apiFolder?: string
): Promise<UploadResult> => {
  // TODO: Implement multipart upload initialization
  return { error: 'Multipart upload not implemented' }
}

export const getMultipartPartUrls = async (
  key: string,
  uploadId: string,
  start?: number,
  end?: number
): Promise<UploadResult> => {
  // TODO: Implement multipart part URLs generation
  return { error: 'Multipart part URLs not implemented' }
}

export const completeMultipart = async (key: string, uploadId: string, parts: any[]): Promise<UploadResult> => {
  try {
    // AWS S3 Complete Multipart Upload
    const completeParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((part: any, index: number) => ({
          ETag: part.ETag,
          PartNumber: index + 1,
        })),
      },
    }

    const result = await s3.completeMultipartUpload(completeParams as any).promise()
    return { location: result.Location }
  } catch (error: any) {
    console.error('Complete multipart upload error:', error)
    return { error: error.message }
  }
}

export const abortMultipart = async (key: string, uploadId: string): Promise<UploadResult> => {
  // TODO: Implement multipart upload abort
  return { error: 'Multipart abort not implemented' }
}

export default {
  awsImageStorage,
  uploadFile,
  deleteFile,
  uploadZip,
  getFileData,
  extractAndStoreFile,
  getPresignedUrlForDownload,
  getPresignedUrlForUpload,
  getS3FileSize,
}

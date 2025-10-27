import * as fs from 'fs'
import * as path from 'path'
import AdmZip from 'adm-zip'

interface ZipExtractionOptions {
  inputPath: string
  outputPath: string
  overwrite?: boolean
}

interface ExtractionResult {
  success: boolean
  extractedFiles?: string[]
  totalFiles?: number
  error?: string
}

// Extract ZIP file
export const extractZipFile = async (options: ZipExtractionOptions): Promise<ExtractionResult> => {
  try {
    const { inputPath, outputPath, overwrite = false } = options

    // Validate input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input ZIP file does not exist: ${inputPath}`)
    }

    // Validate ZIP file extension
    if (!inputPath.toLowerCase().endsWith('.zip')) {
      throw new Error('Input file must have .zip extension')
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true })
    }

    // Initialize ZIP extraction
    const zip = new AdmZip(inputPath)
    const zipEntries = zip.getEntries()

    // Extract files
    const extractedFiles: string[] = []
    zipEntries.forEach((entry) => {
      if (!entry.isDirectory) {
        const filePath = path.join(outputPath, entry.entryName)

        // Handle overwrite logic
        if (!overwrite && fs.existsSync(filePath)) {
          console.warn(`File already exists, skipping: ${entry.entryName}`)
        } else {
          zip.extractEntryTo(entry, outputPath, false, true)
          extractedFiles.push(entry.entryName)
        }
      }
    })

    console.log(`Successfully extracted ${extractedFiles.length} files from ${inputPath} to ${outputPath}`)

    return {
      success: true,
      extractedFiles,
      totalFiles: extractedFiles.length,
    }
  } catch (error: any) {
    console.error('Error extracting ZIP file:', error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Validate ZIP file
export const validateZipFile = async (filePath: string): Promise<{ isValid: boolean; message: string }> => {
  try {
    if (!fs.existsSync(filePath)) {
      return { isValid: false, message: 'File does not exist' }
    }

    const stats = fs.statSync(filePath)
    if (stats.size === 0) {
      return { isValid: false, message: 'File is empty' }
    }

    // Try to read as ZIP
    const zip = new AdmZip(filePath)
    const entries = zip.getEntries()

    if (entries.length === 0) {
      return { isValid: false, message: 'ZIP file is empty or corrupted' }
    }

    return { isValid: true, message: `Valid ZIP file with ${entries.length} entries` }
  } catch (error: any) {
    return { isValid: false, message: `Invalid ZIP file: ${error.message}` }
  }
}

// Get ZIP file information
export const getZipInfo = async (
  filePath: string
): Promise<{ success: boolean; info?: { size: number; entries: number; compression: string }; error?: string }> => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('ZIP file does not exist')
    }

    const zip = new AdmZip(filePath)
    const entries = zip.getEntries()
    const stats = fs.statSync(filePath)

    return {
      success: true,
      info: {
        size: stats.size,
        entries: entries.length,
        compression: 'DEFLATE', // Default for most ZIP files
      },
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}

// List files in ZIP without extracting
export const listZipContents = async (
  filePath: string
): Promise<{ success: boolean; files?: string[]; error?: string }> => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('ZIP file does not exist')
    }

    const zip = new AdmZip(filePath)
    const entries = zip.getEntries()
    const files = entries.map((entry) => entry.entryName)

    return {
      success: true,
      files,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}

import JobsModel from '../model/jobs'
import FolderModel from '../model/folder'
import FileModel from '../model/file'

// Main function to process ZIP extraction for a job
export const processZipExtraction = async (jobId: string): Promise<void> => {
  try {
    console.log(`Starting ZIP extraction for job: ${jobId}`)

    // Get job details
    const job = await JobsModel.findById(jobId)
    if (!job) {
      throw new Error(`Job not found: ${jobId}`)
    }

    // Update job status to processing
    await JobsModel.findByIdAndUpdate(jobId, { status: 'processing' })

    // Prepare extraction paths
    const inputPath = `/tmp/${job.fileKey}` // This needs to be adjusted based on how files are stored
    const outputPath = path.join(process.cwd(), 'uploads', String(job.parentId))

    // Extract the ZIP file
    const extractResult = await extractZipFile({
      inputPath: inputPath,
      outputPath: outputPath,
      overwrite: true,
    })

    if (!extractResult.success) {
      throw new Error(`Extraction failed: ${extractResult.error}`)
    }

    // Update job with successful status
    await JobsModel.findByIdAndUpdate(jobId, {
      status: 'completed',
      extractedFiles: extractResult.extractedFiles,
      totalFiles: extractResult.totalFiles,
    })

    console.log(`Successfully completed ZIP extraction for job: ${jobId}, extracted ${extractResult.totalFiles} files`)
  } catch (error: any) {
    console.error(`ZIP extraction failed for job: ${jobId}`, error.message)
    // Update job status to failed
    await JobsModel.findByIdAndUpdate(jobId, {
      status: 'failed',
      error: error.message,
    })
    throw error
  }
}

export default { extractZipFile, validateZipFile, getZipInfo, listZipContents }

import mongoose, { Document, Schema } from 'mongoose'

export interface IJob extends Document {
  _id: string
  fileKey: string
  userId: mongoose.Types.ObjectId
  fileName: string
  s3Location: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  progress: {
    processedFiles: number
    processedFolders: number
    totalFilesFolders: number
  }
  jobType: 'preRegistration' | 'renewal' | 'variation' | 'folder'
  parentId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const jobsSchema = new Schema<IJob>(
  {
    fileKey: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    fileName: { type: String, required: true },
    s3Location: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'failed'],
      default: 'pending',
    },
    progress: {
      processedFiles: { type: Number, default: 0 },
      processedFolders: { type: Number, default: 0 },
      totalFilesFolders: { type: Number, default: 0 },
    },
    jobType: {
      type: String,
      enum: ['preRegistration', 'renewal', 'variation', 'folder'],
      required: true,
    },
    parentId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
)

const Jobs = mongoose.model<IJob>('Job', jobsSchema)
export default Jobs

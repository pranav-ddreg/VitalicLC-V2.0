import mongoose, { Document, model, Schema } from 'mongoose'

export interface IFile extends Document {
  _id: string
  title: string
  extension: string
  file: {
    Location: string
    Key: string
  }
  parent: mongoose.Types.ObjectId
  isUploaded: boolean
  createdAt: Date
  updatedAt: Date
}

const fileSchema = new Schema<IFile>(
  {
    title: { type: String, required: true, trim: true },
    extension: { type: String, required: true, trim: true },
    file: { type: { Location: String, Key: String }, required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, required: true },
    isUploaded: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const File = model<IFile>('File', fileSchema)
export default File

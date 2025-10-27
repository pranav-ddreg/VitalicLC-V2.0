import mongoose, { Document, Schema, model } from 'mongoose'

export interface IFolder extends Document {
  _id: string
  title: string
  parent: mongoose.Types.ObjectId // renewal ID/ variation ID or its parent folder
  createdAt: Date
  updatedAt: Date
}

const folderSchema = new Schema<IFolder>(
  {
    title: { type: String, required: true, trim: true },
    parent: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  },
  { timestamps: true }
)

const Folder = model<IFolder>('Folder', folderSchema)
export default Folder

import mongoose, { Document, Schema } from 'mongoose'

export interface IRole extends Document {
  _id: string
  title: string
  slug: string
  permissions: string[]
  company: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const roleSchema = new mongoose.Schema<IRole>(
  {
    title: { type: String, required: true },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    permissions: [{ type: String }],
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  },
  {
    collection: 'roles',
    timestamps: true,
  }
)

const Role = mongoose.model<IRole>('Role', roleSchema)
export default Role

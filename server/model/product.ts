import mongoose, { Document } from 'mongoose'

export interface IProduct extends Document {
  _id: string
  title: string
  slug: string
  company: mongoose.Types.ObjectId
  active: boolean
  deletedBy?: {
    userId: mongoose.Types.ObjectId
    time: Date
  }
  createdAt: Date
  updatedAt: Date
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    title: { type: String, required: true },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    company: { type: mongoose.Schema.Types.ObjectId, required: true },
    active: { type: Boolean, default: true },
    deletedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId },
      time: { type: Date },
    },
  },
  {
    collection: 'products',
    timestamps: true,
  }
)

const Product = mongoose.model<IProduct>('Product', productSchema)
export default Product

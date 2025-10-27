import mongoose, { Document } from 'mongoose'

export interface IPricing extends Document {
  _id: string
  plan: string
  slug: string
  price: number
  duration: number
  deletedBy?: {
    userId: mongoose.Types.ObjectId
    time: Date
  }
  createdAt: Date
  updatedAt: Date
}

const pricingSchema = new mongoose.Schema<IPricing>(
  {
    plan: { type: String, required: true },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    deletedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId },
      time: { type: Date },
    },
  },
  { collection: 'pricing', timestamps: true }
)

const Pricing = mongoose.model<IPricing>('Pricing', pricingSchema)
export default Pricing

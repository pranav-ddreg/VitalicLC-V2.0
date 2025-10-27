import mongoose, { Document } from 'mongoose'

export interface ICountry extends Document {
  _id: string
  title: string
  slug: string
  approvalDays: number
  launchDays: number
  initiateDays: number
  submitDays: number
  renewDays: number
  IA: number
  IB: number
  major: number
  minor: number
  deletedBy?: {
    userId: mongoose.Types.ObjectId
    time: Date
  }
  createdAt: Date
  updatedAt: Date
}

const countrySchema = new mongoose.Schema<ICountry>(
  {
    title: { type: String, required: true },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
      index: true,
    },
    approvalDays: { type: Number, required: true },
    launchDays: { type: Number, required: true },
    initiateDays: { type: Number, required: true },
    submitDays: { type: Number, required: true },
    renewDays: { type: Number, required: true },
    IA: { type: Number, required: true },
    IB: { type: Number, required: true },
    major: { type: Number, required: true },
    minor: { type: Number, required: true },
    deletedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId },
      time: { type: Date },
    },
  },
  {
    collection: 'countries',
    timestamps: true,
  }
)

const Country = mongoose.model<ICountry>('Country', countrySchema)
export default Country

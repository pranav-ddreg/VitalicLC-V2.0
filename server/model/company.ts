import mongoose, { Document } from 'mongoose'

export interface ICompany extends Document {
  _id: string
  title: string
  email: string
  secondaryEmail?: string
  plan: mongoose.Types.ObjectId
  countryIds: mongoose.Types.ObjectId[]
  purchasedOn: Date
  expiredOn: Date
  logo: any
  deletedBy?: {
    userId: mongoose.Types.ObjectId
    time: Date
  }
  createdAt: Date
  updatedAt: Date
}

const companySchema = new mongoose.Schema<ICompany>(
  {
    title: { type: String, required: true },
    email: { type: String, required: true },
    secondaryEmail: { type: String },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Pricing', required: true },
    countryIds: { type: [mongoose.Types.ObjectId], required: true },
    purchasedOn: { type: Date, required: true },
    expiredOn: { type: Date, required: true },
    logo: { type: Object, required: true },
    deletedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId },
      time: { type: Date },
    },
  },
  {
    collection: 'companies',
    timestamps: true,
  }
)

const Company = mongoose.model<ICompany>('Company', companySchema)
export default Company

import mongoose, { Document } from 'mongoose'

export interface IRenewal extends Document {
  _id: string
  preregistration: mongoose.Types.ObjectId
  expSubmitDate: Date
  expInitiateDate: Date
  company: mongoose.Types.ObjectId
  renewDate?: Date
  initiateDate?: Date
  submitDate?: Date
  stage: string
  posPdf?: any
  approvalPdf?: any
  status: boolean
  notificationNumber?: string
  remark?: string
  deletedBy?: {
    userId: mongoose.Types.ObjectId
    time: Date
  }
  createdAt: Date
  updatedAt: Date
}

const renewalSchema = new mongoose.Schema<IRenewal>(
  {
    preregistration: { type: mongoose.Schema.Types.ObjectId, ref: 'Preregistration', required: true },
    expSubmitDate: { type: Date, required: true },
    expInitiateDate: { type: Date, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    renewDate: { type: Date, default: null },
    initiateDate: { type: Date, default: null },
    submitDate: { type: Date, default: null },
    stage: { type: String, default: 'registered' },
    posPdf: { type: Object, default: null },
    approvalPdf: { type: Object, default: null },
    status: { type: Boolean, default: true },
    notificationNumber: { type: String },
    remark: { type: String },
    deletedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId },
      time: { type: Date },
    },
  },
  {
    collection: 'renewal',
    timestamps: true,
  }
)

const Renewal = mongoose.model<IRenewal>('renewal', renewalSchema)
export default Renewal

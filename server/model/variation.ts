import mongoose, { Document } from 'mongoose'

export interface IVariation extends Document {
  _id: string
  preregistration: mongoose.Types.ObjectId
  title: string
  category: string // IA/IB/MINOR/MAJOR
  expApprovalDate: Date
  submissionDate: Date
  company: mongoose.Types.ObjectId
  approvalPdf?: any
  posPdf?: any
  POS: string // Received/Not-Received
  approval: string // approved/rejected/Not-Received
  approvalDate?: Date
  stage: string // Submitted/Not-submitted
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

const variationSchema = new mongoose.Schema<IVariation>(
  {
    preregistration: { type: mongoose.Schema.Types.ObjectId, ref: 'Preregistration', required: true },
    title: { type: String, required: true },
    category: { type: String, required: true }, // IA/IB/MINOR/MAJOR
    expApprovalDate: { type: Date, required: true },
    submissionDate: { type: Date, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, required: true },
    approvalPdf: { type: Object, default: null },
    posPdf: { type: Object, default: null },
    POS: {
      type: String,
      required: true,
      default: function (this: IVariation) {
        return this.posPdf ? 'received' : 'not-received'
      },
    }, // Received/Not-Received
    approval: {
      type: String,
      required: true,
      default: function (this: IVariation) {
        return this.approvalPdf ? 'approved' : 'not-received'
      },
    }, // approved/rejected/Not-Received
    approvalDate: { type: Date, default: null },
    stage: { type: String, default: 'not-submitted' }, // Submitted/Not-submitted
    status: { type: Boolean, default: true },
    notificationNumber: { type: String },
    remark: { type: String },
    deletedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId },
      time: { type: Date },
    },
  },
  {
    collection: 'variation',
    timestamps: true,
  }
)

const Variation = mongoose.model<IVariation>('variation', variationSchema)
export default Variation

import mongoose, { Document } from 'mongoose'

export interface IPreregistration extends Document {
  _id: string
  product: mongoose.Types.ObjectId
  registrationDate?: Date
  registrationNo?: string
  notificationNumber?: string
  country: mongoose.Types.ObjectId
  expApprovalDate?: Date
  submissionDate?: Date
  dossier?: string
  sample?: string
  expLaunchDate?: Date
  renewalDate?: Date
  localPartner: Array<{
    partnerName: string
  }>
  remark?: string
  stage: string
  rc?: any
  company?: mongoose.Types.ObjectId
  active: boolean
  apiName: string
  brandName: string
  api: Array<{
    apiSourceName?: string
    apiSourceAddress?: string
    apiSourceMethod?: string
  }>
  modeOfRegistration?: string
  siteGMP?: string
  modeOfVersion?: string
  FPSpecificationNumber?: string
  shelfLife?: string
  batchSize?: string
  batchFormula?: any
  storageCondition?: string
  packSize?: string
  CIC?: string
  SKUCode?: string
  registeredPrice?: string
  registeredArtworkLabel?: string
  registeredArtworkCarton?: string
  registeredArtworkOuterCarton?: string
  registeredArtworkPackageInsert?: string
  registeredArtworkPIL?: any
  deletedBy?: {
    userId: mongoose.Types.ObjectId
    time: Date
  }
  createdAt: Date
  updatedAt: Date
}

const preregistrationSchema = new mongoose.Schema<IPreregistration>(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    registrationDate: { type: Date, default: null },
    registrationNo: { type: String, default: null },
    notificationNumber: { type: String, default: null },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    expApprovalDate: { type: Date },
    submissionDate: { type: Date },
    dossier: { type: String },
    sample: { type: String },
    expLaunchDate: { type: Date },
    renewalDate: { type: Date },
    localPartner: [
      {
        partnerName: { type: String },
      },
    ],
    remark: { type: String },
    stage: { type: String, default: 'under-process' },
    rc: { type: Object },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    active: { type: Boolean, default: true },
    apiName: { type: String, required: true },
    brandName: { type: String, required: true },
    api: [
      {
        apiSourceName: { type: String },
        apiSourceAddress: { type: String },
        apiSourceMethod: { type: String },
      },
    ],
    modeOfRegistration: { type: String },
    siteGMP: { type: String },
    modeOfVersion: { type: String },
    FPSpecificationNumber: { type: String },
    shelfLife: { type: String },
    batchSize: { type: String },
    batchFormula: { type: Object },
    storageCondition: { type: String },
    packSize: { type: String },
    CIC: { type: String },
    SKUCode: { type: String },
    registeredPrice: { type: String },
    registeredArtworkLabel: { type: String },
    registeredArtworkCarton: { type: String },
    registeredArtworkOuterCarton: { type: String },
    registeredArtworkPackageInsert: { type: String },
    registeredArtworkPIL: { type: Object },
    deletedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId },
      time: { type: Date, default: new Date() },
    },
  },
  {
    collection: 'preRegistration',
    timestamps: true,
  }
)

const Preregistration = mongoose.model<IPreregistration>('preRegistration', preregistrationSchema)
export default Preregistration

import mongoose, { Document } from 'mongoose'

export interface INotificationCounter extends Document {
  _id: string
  year: number
  currentCounter: number
  company: mongoose.Types.ObjectId
  product: mongoose.Types.ObjectId
  country: mongoose.Types.ObjectId
  status: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationCounterSchema = new mongoose.Schema<INotificationCounter>(
  {
    year: { type: Number, required: true },
    currentCounter: { type: Number, default: 0 },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'country', required: true },
    status: { type: Boolean, default: true },
  },
  {
    collection: 'notificationCounters',
    timestamps: true,
  }
)

const NotificationCounter = mongoose.model<INotificationCounter>('notificationCounter', notificationCounterSchema)
export default NotificationCounter

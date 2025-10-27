import mongoose, { Document, Schema } from 'mongoose'
import { IRole, ICompany } from '../types/interfaces'

export interface IUser extends Document {
  _id: string
  firstName?: string
  lastName?: string
  email: string
  company: mongoose.Types.ObjectId | ICompany
  password: string
  role: mongoose.Types.ObjectId | IRole
  reset_key?: {
    data: string
  }
  reset_otp?: string
  wrongAttampt: number
  isAccountLocked: boolean
  twoFactor: boolean
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, trim: true, required: true, unique: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    password: { type: String, trim: true, required: true },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    reset_key: { data: String },
    reset_otp: { type: String, default: null },
    wrongAttampt: { type: Number, default: 0 },
    isAccountLocked: { type: Boolean, default: false },
    twoFactor: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'users' }
)

const User = mongoose.model<IUser>('User', userSchema)
export default User

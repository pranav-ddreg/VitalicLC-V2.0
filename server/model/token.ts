import mongoose, { Document } from 'mongoose'

export interface IToken extends Document {
  _id: string
  token?: string
  user?: mongoose.Types.ObjectId
  isValid: boolean
  company?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const tokenSchema = new mongoose.Schema<IToken>(
  {
    token: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId },
    isValid: { type: Boolean, default: true },
    company: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true, collection: 'tokens' }
)

const Token = mongoose.model<IToken>('Token', tokenSchema)
export default Token

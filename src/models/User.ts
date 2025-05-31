// models/User.ts
import mongoose, { Document, Model } from 'mongoose'

interface IUser extends Document {
  name: string
  email: string
  password: string
  image?: string
  role?: string
  createdAt: Date
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
})

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
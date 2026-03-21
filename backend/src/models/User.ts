import { Schema, model, Document } from "mongoose"

export interface IUser extends Document {
  clerkId: string
  role: "teacher" | "student" | null
  name: string
  email: string
  schoolName?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ["teacher", "student", null], default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    schoolName: { type: String, trim: true },
  },
  { timestamps: true }
)

export const User = model<IUser>("User", UserSchema)

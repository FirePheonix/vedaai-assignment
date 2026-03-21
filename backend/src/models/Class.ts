import { Schema, model, Document } from "mongoose"

export interface IClass extends Document {
  userId: string
  name: string
  joinCode: string
  studentIds: string[]
  createdAt: Date
}

const ClassSchema = new Schema<IClass>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    joinCode: { type: String, required: true, unique: true, uppercase: true },
    studentIds: { type: [String], default: [] },
  },
  { timestamps: true }
)

export const Class = model<IClass>("Class", ClassSchema)

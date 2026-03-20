import { Schema, model, Document, Types } from "mongoose"

export interface IQuestionType {
  type: string
  count: number
  marks: number
}

export interface IAssignment extends Document {
  title: string
  subject: string
  dueDate: Date
  questionTypes: IQuestionType[]
  additionalInfo?: string
  fileUrl?: string
  sourceIds: string[]
  jobId?: string
  status: "pending" | "queued" | "processing" | "done" | "failed"
  paperId?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const QuestionTypeSchema = new Schema<IQuestionType>({
  type: { type: String, required: true },
  count: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
})

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeSchema], required: true },
    additionalInfo: { type: String, default: "" },
    fileUrl: { type: String },
    sourceIds: { type: [String], default: [] },
    jobId: { type: String },
    status: {
      type: String,
      enum: ["pending", "queued", "processing", "done", "failed"],
      default: "pending",
    },
    paperId: { type: Schema.Types.ObjectId, ref: "QuestionPaper" },
  },
  { timestamps: true }
)

export const Assignment = model<IAssignment>("Assignment", AssignmentSchema)

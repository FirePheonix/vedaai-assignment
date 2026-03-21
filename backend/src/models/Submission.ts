import { Schema, model, Document, Types } from "mongoose"

export interface ISubmission extends Document {
  assignmentId: Types.ObjectId
  paperId: Types.ObjectId
  studentId: string
  studentName: string
  fileUrl: string
  filename: string
  fileType: "pdf" | "image"
  status: "submitted" | "graded"
  totalMarksAwarded?: number
  maxMarks: number
  feedback?: string
  submittedAt: Date
  gradedAt?: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    paperId: { type: Schema.Types.ObjectId, ref: "QuestionPaper", required: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    filename: { type: String, required: true },
    fileType: { type: String, enum: ["pdf", "image"], required: true },
    status: { type: String, enum: ["submitted", "graded"], default: "submitted" },
    totalMarksAwarded: { type: Number, min: 0 },
    maxMarks: { type: Number, required: true },
    feedback: { type: String },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date },
  },
  { timestamps: false }
)

// One submission per student per assignment
SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true })

export const Submission = model<ISubmission>("Submission", SubmissionSchema)

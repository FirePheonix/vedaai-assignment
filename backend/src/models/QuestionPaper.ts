import { Schema, model, Document, Types } from "mongoose"

export interface IQuestion {
  id: string
  text: string
  difficulty: "Easy" | "Moderate" | "Challenging"
  marks: number
  answer?: string
}

export interface ISection {
  id: string
  title: string
  questionType: string
  instruction: string
  marksPerQuestion: number
  questions: IQuestion[]
}

export interface IAnswerKey {
  questionId: string
  answer: string
}

export interface IQuestionPaper extends Document {
  assignmentId: Types.ObjectId
  schoolName: string
  subject: string
  className: string
  timeAllowed: string
  maximumMarks: number
  totalQuestions: number
  sections: ISection[]
  answerKey: IAnswerKey[]
  createdAt: Date
}

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Moderate", "Challenging"], required: true },
  marks: { type: Number, required: true },
  answer: { type: String },
})

const SectionSchema = new Schema<ISection>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  questionType: { type: String, required: true },
  instruction: { type: String, required: true },
  marksPerQuestion: { type: Number, required: true },
  questions: { type: [QuestionSchema], required: true },
})

const AnswerKeySchema = new Schema<IAnswerKey>({
  questionId: { type: String, required: true },
  answer: { type: String, required: true },
})

const QuestionPaperSchema = new Schema<IQuestionPaper>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    schoolName: { type: String, default: "Delhi Public School" },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    maximumMarks: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    sections: { type: [SectionSchema], required: true },
    answerKey: { type: [AnswerKeySchema], default: [] },
  },
  { timestamps: true }
)

export const QuestionPaper = model<IQuestionPaper>("QuestionPaper", QuestionPaperSchema)

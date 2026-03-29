import { z } from "zod"

export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  difficulty: z.enum(["Easy", "Moderate", "Challenging"]),
  marks: z.number(),
  options: z.array(z.string()).optional(), // MCQ options
})

export const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  questionType: z.string(),
  instruction: z.string(),
  marksPerQuestion: z.number(),
  questions: z.array(QuestionSchema),
})

export const AnswerKeySchema = z.object({
  questionId: z.string(),
  answer: z.string(),
})

export const GeneratedPaperSchema = z.object({
  schoolName: z.string(),
  className: z.string(),
  timeAllowed: z.string(),
  maximumMarks: z.number(),
  totalQuestions: z.number(),
  sections: z.array(SectionSchema),
  answerKey: z.array(AnswerKeySchema),
})

export type GeneratedPaper = z.infer<typeof GeneratedPaperSchema>

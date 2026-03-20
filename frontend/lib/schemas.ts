import { z } from "zod"

export const QuestionTypeSchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Question type is required"),
  count: z.number().min(1, "At least 1 question").max(50),
  marks: z.number().min(1, "At least 1 mark"),
})

export const AssignmentFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  subject: z.string().min(1, "Subject is required"),
  className: z.string().min(1, "Class is required"),
  file: z.instanceof(File).optional().nullable(),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine((val) => {
      return new Date(val) > new Date()
    }, "Due date must be in the future"),
  questionTypes: z.array(QuestionTypeSchema).min(1, "Add at least one question type"),
  additionalInfo: z.string().max(500).optional(),
})

export type AssignmentFormData = z.infer<typeof AssignmentFormSchema>
export type QuestionTypeRow = z.infer<typeof QuestionTypeSchema>

// Paper / Output schemas

export const DifficultySchema = z.enum(["Easy", "Moderate", "Challenging"])
export type Difficulty = z.infer<typeof DifficultySchema>

export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  difficulty: DifficultySchema,
  marks: z.number(),
})

export const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  questionType: z.string(),
  instruction: z.string(),
  marksPerQuestion: z.number(),
  questions: z.array(QuestionSchema),
})

export const QuestionPaperSchema = z.object({
  id: z.string(),
  schoolName: z.string(),
  subject: z.string(),
  className: z.string(),
  timeAllowed: z.string(),
  maximumMarks: z.number(),
  totalQuestions: z.number(),
  sections: z.array(SectionSchema),
  answerKey: z.array(z.object({ questionId: z.string(), answer: z.string() })).optional(),
  createdAt: z.string(),
})

export type Question = z.infer<typeof QuestionSchema>
export type Section = z.infer<typeof SectionSchema>
export type QuestionPaper = z.infer<typeof QuestionPaperSchema>

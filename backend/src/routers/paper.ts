import { z } from "zod"
import { router, protectedProcedure, TRPCError } from "../trpc"
import { QuestionPaper } from "../models/QuestionPaper"
import { Assignment } from "../models/Assignment"

const QuestionInput = z.object({
  id: z.string(),
  text: z.string().min(1),
  difficulty: z.enum(["Easy", "Moderate", "Challenging"]),
  marks: z.number().int().min(1),
})

const SectionInput = z.object({
  id: z.string(),
  title: z.string().min(1),
  questionType: z.string().min(1),
  instruction: z.string().min(1),
  marksPerQuestion: z.number().min(1),
  questions: z.array(QuestionInput).min(1),
})

const AnswerKeyInput = z.object({
  questionId: z.string(),
  answer: z.string(),
})

export const paperRouter = router({
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const paper = await QuestionPaper.findById(input.id).lean()

    if (!paper) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Paper not found" })
    }

    const assignment = await Assignment.findOne({ _id: paper.assignmentId, userId: ctx.userId }).lean()
    if (!assignment) throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" })

    return {
      id: paper._id.toString(),
      assignmentId: paper.assignmentId.toString(),
      schoolName: paper.schoolName,
      subject: paper.subject,
      className: paper.className,
      timeAllowed: paper.timeAllowed,
      maximumMarks: paper.maximumMarks,
      totalQuestions: paper.totalQuestions,
      sections: paper.sections,
      answerKey: paper.answerKey,
      createdAt: paper.createdAt.toISOString(),
    }
  }),

  getByAssignmentId: protectedProcedure
    .input(z.object({ assignmentId: z.string() }))
    .query(async ({ input, ctx }) => {
      const assignment = await Assignment.findOne({ _id: input.assignmentId, userId: ctx.userId }).lean()
      if (!assignment) return null

      const paper = await QuestionPaper.findOne({ assignmentId: input.assignmentId }).lean()
      if (!paper) return null

      return {
        id: paper._id.toString(),
        assignmentId: paper.assignmentId.toString(),
        schoolName: paper.schoolName,
        subject: paper.subject,
        className: paper.className,
        timeAllowed: paper.timeAllowed,
        maximumMarks: paper.maximumMarks,
        totalQuestions: paper.totalQuestions,
        sections: paper.sections,
        answerKey: paper.answerKey,
        createdAt: paper.createdAt.toISOString(),
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        sections: z.array(SectionInput),
        answerKey: z.array(AnswerKeyInput).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const paper = await QuestionPaper.findById(input.id)
      if (!paper) throw new TRPCError({ code: "NOT_FOUND", message: "Paper not found" })

      const assignment = await Assignment.findOne({ _id: paper.assignmentId, userId: ctx.userId })
      if (!assignment) throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" })

      const totalQuestions = input.sections.reduce((s, sec) => s + sec.questions.length, 0)
      const maximumMarks = input.sections.reduce(
        (s, sec) => s + sec.questions.reduce((qs, q) => qs + q.marks, 0),
        0
      )

      await QuestionPaper.findByIdAndUpdate(input.id, {
        sections: input.sections,
        answerKey: input.answerKey ?? paper.answerKey,
        totalQuestions,
        maximumMarks,
      })

      return { success: true }
    }),
})

import { z } from "zod"
import { router, protectedProcedure, TRPCError } from "../trpc"
import { QuestionPaper } from "../models/QuestionPaper"

export const paperRouter = router({
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const paper = await QuestionPaper.findById(input.id).lean()

    if (!paper) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Paper not found" })
    }

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
    .query(async ({ input }) => {
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
})

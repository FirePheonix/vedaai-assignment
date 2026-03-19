import { z } from "zod"
import { router, publicProcedure, TRPCError } from "../trpc"
import { Assignment } from "../models/Assignment"
import { logger } from "../lib/logger"

const QuestionTypeInput = z.object({
  type: z.string().min(1),
  count: z.number().int().min(1).max(50),
  marks: z.number().int().min(1),
})

const CreateAssignmentInput = z.object({
  title: z.string().min(3),
  subject: z.string().min(1),
  dueDate: z.string().datetime(),
  questionTypes: z.array(QuestionTypeInput).min(1),
  additionalInfo: z.string().max(500).optional(),
})

export const assignmentRouter = router({
  create: publicProcedure.input(CreateAssignmentInput).mutation(async ({ input }) => {
    const assignment = await Assignment.create({
      title: input.title,
      subject: input.subject,
      dueDate: new Date(input.dueDate),
      questionTypes: input.questionTypes,
      additionalInfo: input.additionalInfo ?? "",
      status: "pending",
    })

    logger.info({ assignmentId: assignment._id, step: "created" }, "Assignment saved")

    return {
      assignmentId: assignment._id.toString(),
    }
  }),

  list: publicProcedure.query(async () => {
    const assignments = await Assignment.find().sort({ createdAt: -1 }).select("-fileText").lean()

    return assignments.map((a) => ({
      id: a._id.toString(),
      title: a.title,
      subject: a.subject,
      dueDate: a.dueDate.toISOString(),
      status: a.status,
      assignedOn: a.createdAt.toISOString(),
      paperId: a.paperId?.toString() ?? null,
    }))
  }),

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const assignment = await Assignment.findById(input.id).lean()

    if (!assignment) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" })
    }

    return {
      id: assignment._id.toString(),
      title: assignment.title,
      subject: assignment.subject,
      dueDate: assignment.dueDate.toISOString(),
      questionTypes: assignment.questionTypes,
      additionalInfo: assignment.additionalInfo,
      status: assignment.status,
      jobId: assignment.jobId ?? null,
      paperId: assignment.paperId?.toString() ?? null,
    }
  }),
})

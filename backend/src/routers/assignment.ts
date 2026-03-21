import { z } from "zod"
import { router, protectedProcedure, teacherProcedure, studentProcedure, TRPCError } from "../trpc"
import { Assignment } from "../models/Assignment"
import { Class } from "../models/Class"
import { Submission } from "../models/Submission"
import { assignmentQueue } from "../lib/queue"
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
  sourceIds: z.array(z.string()).optional(),
})

export const assignmentRouter = router({
  create: protectedProcedure.input(CreateAssignmentInput).mutation(async ({ input, ctx }) => {
    const assignment = await Assignment.create({
      userId: ctx.userId,
      title: input.title,
      subject: input.subject,
      dueDate: new Date(input.dueDate),
      questionTypes: input.questionTypes,
      additionalInfo: input.additionalInfo ?? "",
      sourceIds: input.sourceIds ?? [],
      status: "pending",
    })

    logger.info({ assignmentId: assignment._id, step: "created" }, "Assignment saved")

    return {
      assignmentId: assignment._id.toString(),
    }
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const assignments = await Assignment.find({ userId: ctx.userId }).sort({ createdAt: -1 }).lean()

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

  generate: protectedProcedure
    .input(z.object({ id: z.string(), className: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const assignment = await Assignment.findOne({ _id: input.id, userId: ctx.userId })

      if (!assignment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" })
      }

      if (assignment.status === "processing") {
        throw new TRPCError({ code: "CONFLICT", message: "Already generating" })
      }

      const job = await assignmentQueue.add("assignment-generate" as string, {
        assignmentId: assignment._id.toString(),
        title: assignment.title,
        subject: assignment.subject,
        className: input.className,
        questionTypes: assignment.questionTypes,
        additionalInfo: assignment.additionalInfo,
        sourceIds: assignment.sourceIds ?? [],
      })

      await Assignment.findByIdAndUpdate(input.id, { jobId: job.id })

      logger.info({ assignmentId: input.id, jobId: job.id }, "Generation job queued")

      return { jobId: job.id }
    }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const assignment = await Assignment.findOne({ _id: input.id, userId: ctx.userId }).lean()

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
      classId: assignment.classId ?? null,
      isPublished: assignment.isPublished,
    }
  }),

  publish: teacherProcedure
    .input(z.object({ id: z.string(), classId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const assignment = await Assignment.findOne({ _id: input.id, userId: ctx.userId })
      if (!assignment) throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" })
      if (assignment.status !== "done")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Paper must be generated before publishing",
        })

      const cls = await Class.findOne({ _id: input.classId, userId: ctx.userId }).lean()
      if (!cls) throw new TRPCError({ code: "NOT_FOUND", message: "Class not found" })

      await Assignment.findByIdAndUpdate(input.id, { isPublished: true, classId: input.classId })
      return { success: true, className: cls.name }
    }),

  listForStudent: studentProcedure.query(async ({ ctx }) => {
    // Find all classes this student is enrolled in
    const classes = await Class.find({ studentIds: ctx.userId }).lean()
    if (classes.length === 0) return []

    const classIds = classes.map((c) => c._id.toString())
    const classMap = Object.fromEntries(classes.map((c) => [c._id.toString(), c.name]))

    const assignments = await Assignment.find({
      classId: { $in: classIds },
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .lean()

    // Check which assignments this student has already submitted
    const assignmentIds = assignments.map((a) => a._id.toString())
    const submissions = await Submission.find({
      assignmentId: { $in: assignmentIds },
      studentId: ctx.userId,
    }).lean()

    const submissionMap = Object.fromEntries(submissions.map((s) => [s.assignmentId.toString(), s]))

    return assignments.map((a) => {
      const sub = submissionMap[a._id.toString()]
      return {
        id: a._id.toString(),
        title: a.title,
        subject: a.subject,
        dueDate: a.dueDate.toISOString(),
        className: classMap[a.classId!] ?? "",
        paperId: a.paperId?.toString() ?? null,
        submissionStatus: sub ? sub.status : null,
        submissionId: sub ? sub._id.toString() : null,
      }
    })
  }),
})

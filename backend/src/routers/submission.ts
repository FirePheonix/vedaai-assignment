import { z } from "zod"
import { router, protectedProcedure, teacherProcedure, studentProcedure, TRPCError } from "../trpc"
import { Submission } from "../models/Submission"
import { Assignment } from "../models/Assignment"
import { QuestionPaper } from "../models/QuestionPaper"
import { Class } from "../models/Class"
import { mailSubmissionConfirmed } from "../lib/emails"
import { env } from "../env"

export const submissionRouter = router({
  create: studentProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        fileUrl: z.string().url(),
        filename: z.string().min(1),
        fileType: z.enum(["pdf", "image"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const assignment = await Assignment.findById(input.assignmentId).lean()
      if (!assignment || !assignment.isPublished) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found or not published" })
      }

      // Verify the student is in the class
      const cls = await Class.findOne({ _id: assignment.classId, studentIds: ctx.userId }).lean()
      if (!cls)
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not enrolled in this class" })

      if (!assignment.paperId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No paper generated for this assignment",
        })
      }

      const paper = await QuestionPaper.findById(assignment.paperId).lean()
      if (!paper) throw new TRPCError({ code: "NOT_FOUND", message: "Paper not found" })

      // Upsert — student can resubmit before grading
      const submission = await Submission.findOneAndUpdate(
        { assignmentId: input.assignmentId, studentId: ctx.userId },
        {
          $set: {
            paperId: assignment.paperId,
            studentName: ctx.user.name,
            fileUrl: input.fileUrl,
            filename: input.filename,
            fileType: input.fileType,
            status: "submitted",
            submittedAt: new Date(),
            totalMarksAwarded: undefined,
            feedback: undefined,
            gradedAt: undefined,
            maxMarks: paper.maximumMarks,
          },
        },
        { upsert: true, new: true }
      )

      // Fire-and-forget confirmation email to student
      mailSubmissionConfirmed({
        studentEmail: ctx.user.email,
        studentName: ctx.user.name,
        assignmentTitle: assignment.title,
        subject: assignment.subject,
        frontendUrl: env.FRONTEND_URL,
      }).catch(() => {})

      return { submissionId: submission._id.toString() }
    }),

  getMySubmissions: studentProcedure.query(async ({ ctx }) => {
    const submissions = await Submission.find({ studentId: ctx.userId })
      .sort({ submittedAt: -1 })
      .lean()

    const assignmentIds = submissions.map((s) => s.assignmentId.toString())
    const assignments = await Assignment.find({ _id: { $in: assignmentIds } }).lean()
    const assignmentMap = Object.fromEntries(assignments.map((a) => [a._id.toString(), a]))

    return submissions.map((s) => {
      const a = assignmentMap[s.assignmentId.toString()]
      return {
        id: s._id.toString(),
        assignmentId: s.assignmentId.toString(),
        assignmentTitle: a?.title ?? "",
        subject: a?.subject ?? "",
        status: s.status,
        totalMarksAwarded: s.totalMarksAwarded ?? null,
        maxMarks: s.maxMarks,
        feedback: s.feedback ?? null,
        submittedAt: s.submittedAt.toISOString(),
        gradedAt: s.gradedAt?.toISOString() ?? null,
      }
    })
  }),

  getForAssignment: teacherProcedure
    .input(z.object({ assignmentId: z.string() }))
    .query(async ({ input, ctx }) => {
      const assignment = await Assignment.findOne({
        _id: input.assignmentId,
        userId: ctx.userId,
      }).lean()
      if (!assignment) throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" })

      const submissions = await Submission.find({ assignmentId: input.assignmentId })
        .sort({ submittedAt: -1 })
        .lean()

      return submissions.map((s) => ({
        id: s._id.toString(),
        studentId: s.studentId,
        studentName: s.studentName,
        fileUrl: s.fileUrl,
        filename: s.filename,
        fileType: s.fileType,
        status: s.status,
        totalMarksAwarded: s.totalMarksAwarded ?? null,
        maxMarks: s.maxMarks,
        feedback: s.feedback ?? null,
        submittedAt: s.submittedAt.toISOString(),
        gradedAt: s.gradedAt?.toISOString() ?? null,
      }))
    }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const submission = await Submission.findById(input.id).lean()
    if (!submission) throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" })

    // Student can only see their own; teacher must own the assignment
    if (submission.studentId !== ctx.userId) {
      const assignment = await Assignment.findOne({
        _id: submission.assignmentId,
        userId: ctx.userId,
      }).lean()
      if (!assignment) throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" })
    }

    const assignment = await Assignment.findById(submission.assignmentId).lean()

    return {
      id: submission._id.toString(),
      assignmentId: submission.assignmentId.toString(),
      assignmentTitle: assignment?.title ?? "",
      subject: assignment?.subject ?? "",
      studentName: submission.studentName,
      fileUrl: submission.fileUrl,
      filename: submission.filename,
      fileType: submission.fileType,
      status: submission.status,
      totalMarksAwarded: submission.totalMarksAwarded ?? null,
      maxMarks: submission.maxMarks,
      feedback: submission.feedback ?? null,
      submittedAt: submission.submittedAt.toISOString(),
      gradedAt: submission.gradedAt?.toISOString() ?? null,
    }
  }),

  getTeacherAnalytics: teacherProcedure
    .input(z.object({ classId: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const assignmentQuery: Record<string, unknown> = { userId: ctx.userId }
      if (input?.classId) assignmentQuery.classId = input.classId

      const assignments = await Assignment.find(assignmentQuery).lean()
      const assignmentIds = assignments.map((a) => a._id)

      // Get class size for submitted/not submitted gauge
      let totalStudents = 0
      if (input?.classId) {
        const cls = await Class.findOne({ _id: input.classId, userId: ctx.userId }).lean()
        totalStudents = cls ? (cls.studentIds?.length ?? 0) : 0
      } else {
        const classes = await Class.find({ userId: ctx.userId }).lean()
        totalStudents = classes.reduce((sum, c) => sum + (c.studentIds?.length ?? 0), 0)
      }

      const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } }).lean()
      const graded = submissions.filter(
        (s) =>
          s.status === "graded" && s.totalMarksAwarded !== null && s.totalMarksAwarded !== undefined
      )
      const scores = graded.map((s) => (s.totalMarksAwarded! / s.maxMarks) * 100)

      const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      const topScore = scores.length ? Math.max(...scores) : 0
      const lowestScore = scores.length ? Math.min(...scores) : 0
      const sorted = [...scores].sort((a, b) => a - b)
      const medianScore = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0

      const gradeBuckets = { A: 0, B: 0, C: 0, D: 0, belowD: 0 }
      scores.forEach((s) => {
        if (s >= 80) gradeBuckets.A++
        else if (s >= 60) gradeBuckets.B++
        else if (s >= 40) gradeBuckets.C++
        else if (s >= 20) gradeBuckets.D++
        else gradeBuckets.belowD++
      })

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const gradedThisWeek = graded.filter((s) => s.gradedAt && s.gradedAt >= weekAgo).length

      const feedbacks = graded
        .filter((s) => s.feedback && s.feedback.trim().length > 0)
        .map((s) => s.feedback!)
        .slice(0, 30)

      return {
        totalSubmissions: submissions.length,
        totalStudents,
        gradedCount: graded.length,
        gradedThisWeek,
        avgScore: Math.round(avgScore),
        topScore: Math.round(topScore),
        lowestScore: Math.round(lowestScore),
        medianScore: Math.round(medianScore),
        gradeBuckets,
        feedbacks,
      }
    }),

  getStudentAnalytics: studentProcedure.query(async ({ ctx }) => {
    const submissions = await Submission.find({ studentId: ctx.userId }).lean()
    const graded = submissions.filter(
      (s) =>
        s.status === "graded" && s.totalMarksAwarded !== null && s.totalMarksAwarded !== undefined
    )
    const scores = graded.map((s) => (s.totalMarksAwarded! / s.maxMarks) * 100)

    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const topScore = scores.length ? Math.max(...scores) : 0

    const assignmentIds = submissions.map((s) => s.assignmentId)
    const assignments = await Assignment.find({ _id: { $in: assignmentIds } }).lean()
    const assignmentMap = Object.fromEntries(assignments.map((a) => [a._id.toString(), a]))

    const history = graded
      .map((s) => ({
        id: s._id.toString(),
        assignmentTitle: assignmentMap[s.assignmentId.toString()]?.title ?? "",
        subject: assignmentMap[s.assignmentId.toString()]?.subject ?? "",
        score: Math.round((s.totalMarksAwarded! / s.maxMarks) * 100),
        marks: s.totalMarksAwarded!,
        maxMarks: s.maxMarks,
        gradedAt: s.gradedAt?.toISOString() ?? s.submittedAt.toISOString(),
        feedback: s.feedback ?? null,
      }))
      .sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime())

    return {
      totalSubmissions: submissions.length,
      gradedCount: graded.length,
      avgScore: Math.round(avgScore),
      topScore: Math.round(topScore),
      history,
    }
  }),

  grade: teacherProcedure
    .input(
      z.object({
        id: z.string(),
        totalMarksAwarded: z.number().min(0),
        feedback: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const submission = await Submission.findById(input.id).lean()
      if (!submission) throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" })

      const assignment = await Assignment.findOne({
        _id: submission.assignmentId,
        userId: ctx.userId,
      }).lean()
      if (!assignment) throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" })

      if (input.totalMarksAwarded > submission.maxMarks) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Marks cannot exceed maximum (${submission.maxMarks})`,
        })
      }

      await Submission.findByIdAndUpdate(input.id, {
        status: "graded",
        totalMarksAwarded: input.totalMarksAwarded,
        feedback: input.feedback ?? "",
        gradedAt: new Date(),
      })

      return { success: true }
    }),
})

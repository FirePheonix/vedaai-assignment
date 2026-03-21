import { Worker, Queue } from "bullmq"
import { env } from "@/env"
import { logger } from "@/lib/logger"
import { Assignment } from "@/models/Assignment"
import { Submission } from "@/models/Submission"
import { Class } from "@/models/Class"
import { User } from "@/models/User"
import { mailDeadlineReminder } from "@/lib/emails"

const QUEUE_NAME = "deadline-reminder"
const connection = { url: env.REDIS_URL }

export function startDeadlineWorker() {
  const queue = new Queue(QUEUE_NAME, { connection })

  // Schedule a daily check at 08:00 UTC
  queue
    .upsertJobScheduler("daily-deadline-check", { pattern: "0 8 * * *" }, { name: "check" })
    .catch((err) => logger.error({ err }, "Failed to schedule deadline job"))

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Assignments due in the next 24–48 hours that are published
      const windowStart = new Date(now)
      windowStart.setHours(windowStart.getHours() + 20)
      const windowEnd = new Date(now)
      windowEnd.setHours(windowEnd.getHours() + 48)

      const assignments = await Assignment.find({
        isPublished: true,
        dueDate: { $gte: windowStart, $lte: windowEnd },
      }).lean()

      logger.info({ count: assignments.length }, "Deadline check: assignments in window")

      for (const assignment of assignments) {
        if (!assignment.classId) continue

        const cls = await Class.findById(assignment.classId).lean()
        if (!cls || cls.studentIds.length === 0) continue

        // Find students who have NOT yet submitted
        const submitted = await Submission.find({
          assignmentId: assignment._id,
          studentId: { $in: cls.studentIds },
        })
          .select("studentId")
          .lean()

        const submittedIds = new Set(submitted.map((s) => s.studentId))
        const pendingIds = cls.studentIds.filter((id) => !submittedIds.has(id))
        if (pendingIds.length === 0) continue

        const students = await User.find({ clerkId: { $in: pendingIds } })
          .select("email name")
          .lean()

        for (const student of students) {
          if (!student.email) continue
          mailDeadlineReminder({
            studentEmail: student.email,
            studentName: student.name,
            assignmentTitle: assignment.title,
            subject: assignment.subject,
            dueDate: assignment.dueDate,
            assignmentId: assignment._id.toString(),
            frontendUrl: env.FRONTEND_URL,
          }).catch((err) =>
            logger.error({ err, studentEmail: student.email }, "mailDeadlineReminder failed")
          )
        }
      }
    },
    { connection }
  )

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Deadline check job failed")
  })

  logger.info("Deadline reminder worker started")
  return worker
}

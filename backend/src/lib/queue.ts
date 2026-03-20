import { Queue } from "bullmq"
import { env } from "@/env"

export interface GenerateJobData {
  assignmentId: string
  title: string
  subject: string
  className: string
  questionTypes: { type: string; count: number; marks: number }[]
  additionalInfo?: string
  fileText?: string
}

export const assignmentQueue = new Queue<GenerateJobData>("assignment-generate", {
  connection: { url: env.REDIS_URL },
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
})

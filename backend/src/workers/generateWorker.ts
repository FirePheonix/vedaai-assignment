import { Worker } from "bullmq"
import OpenAI from "openai"
import { env } from "@/env"
import { logger } from "@/lib/logger"
import { Assignment } from "@/models/Assignment"
import { QuestionPaper } from "@/models/QuestionPaper"
import { GeneratedPaperSchema } from "@/lib/paperSchema"
import type { GenerateJobData } from "@/lib/queue"
import type { Server as SocketIOServer } from "socket.io"

const openai = new OpenAI()

function buildPrompt(data: GenerateJobData): string {
  const questionList = data.questionTypes
    .map((q) => `- ${q.count} ${q.type} (${q.marks} mark${q.marks > 1 ? "s" : ""} each)`)
    .join("\n")

  return `You are an expert teacher. Generate a complete exam question paper as structured JSON.

Subject: ${data.subject}
Title: ${data.title}
Class: ${data.className}
Question types required:
${questionList}
${data.additionalInfo ? `Additional instructions: ${data.additionalInfo}` : ""}
${data.fileText ? `Reference material:\n${data.fileText}` : ""}

Return ONLY valid JSON matching this exact structure:
{
  "schoolName": "Delhi Public School",
  "className": "${data.className}",
  "timeAllowed": "<estimate based on question count>",
  "maximumMarks": <sum of all marks>,
  "totalQuestions": <total count>,
  "sections": [
    {
      "id": "s1",
      "title": "Section A",
      "questionType": "<question type>",
      "instruction": "<brief instruction>",
      "marksPerQuestion": <marks>,
      "questions": [
        {
          "id": "q1",
          "text": "<question text>",
          "difficulty": "Easy" | "Moderate" | "Challenging",
          "marks": <marks>
        }
      ]
    }
  ],
  "answerKey": [
    { "questionId": "q1", "answer": "<answer>" }
  ]
}`
}

type Emitter = (event: string, payload: unknown) => void

export async function processGenerateJob(data: GenerateJobData, emit: Emitter) {
  const { assignmentId } = data

  emit("job:progress", { step: "generating", message: "Generating question paper with AI..." })
  await Assignment.findByIdAndUpdate(assignmentId, { status: "processing" })

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: buildPrompt(data) }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  })

  const raw = completion.choices[0].message.content
  if (!raw) throw new Error("Empty response from OpenAI")

  emit("job:progress", { step: "validating", message: "Validating output..." })
  const parsed = GeneratedPaperSchema.parse(JSON.parse(raw))

  emit("job:progress", { step: "saving", message: "Saving question paper..." })
  const paper = await QuestionPaper.create({ assignmentId, subject: data.subject, ...parsed })

  await Assignment.findByIdAndUpdate(assignmentId, { status: "done", paperId: paper._id })

  logger.info({ assignmentId, paperId: paper._id }, "Paper generated")
  emit("job:done", { paperId: paper._id.toString() })

  return { paperId: paper._id.toString() }
}

export function startWorker(io: SocketIOServer) {
  const worker = new Worker<GenerateJobData>(
    "assignment-generate",
    async (job) => {
      const emit: Emitter = (event, payload) => io.to(job.data.assignmentId).emit(event, payload)
      return processGenerateJob(job.data, emit)
    },
    { connection: { url: env.REDIS_URL }, concurrency: 3 }
  )

  worker.on("failed", async (job, err) => {
    logger.error({ jobId: job?.id, err }, "Generation job failed")
    if (job?.data.assignmentId) {
      await Assignment.findByIdAndUpdate(job.data.assignmentId, { status: "failed" })
      io.to(job.data.assignmentId).emit("job:error", { message: err.message })
    }
  })

  logger.info("Generate worker started")
  return worker
}

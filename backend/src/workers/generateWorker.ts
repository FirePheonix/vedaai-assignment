import { Worker } from "bullmq"
import OpenAI from "openai"
import { createClerkClient } from "@clerk/backend"
import { env } from "@/env"
import { logger } from "@/lib/logger"
import { Assignment } from "@/models/Assignment"
import { QuestionPaper } from "@/models/QuestionPaper"
import { User } from "@/models/User"
import { GeneratedPaperSchema } from "@/lib/paperSchema"
import { embedTexts, retrieveChunks } from "@/lib/embed"
import { mailPaperReady } from "@/lib/emails"
import type { GenerateJobData } from "@/lib/queue"
import type { Server as SocketIOServer } from "socket.io"

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })

const openai = new OpenAI()

function buildPrompt(data: GenerateJobData, contextChunks: string[]): string {
  const questionList = data.questionTypes
    .map((q) => `- ${q.count} ${q.type} (${q.marks} mark${q.marks > 1 ? "s" : ""} each)`)
    .join("\n")

  const referenceSection =
    contextChunks.length > 0
      ? `\nReference material from uploaded documents:\n${contextChunks.map((c, i) => `[${i + 1}] ${c}`).join("\n\n")}\n\nGenerate questions based on the above reference material where possible.`
      : ""

  return `You are an expert teacher. Generate a complete exam question paper as structured JSON.

Subject: ${data.subject}
Title: ${data.title}
Class: ${data.className}
Question types required:
${questionList}
${data.additionalInfo ? `Additional instructions: ${data.additionalInfo}` : ""}${referenceSection}

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

  emit("job:progress", { step: "retrieving", message: "Searching knowledge base..." })
  await Assignment.findByIdAndUpdate(assignmentId, { status: "processing" })

  const contextChunks: string[] = []
  if (data.sourceIds.length > 0) {
    const query = `${data.subject} ${data.title} ${data.questionTypes.map((q) => q.type).join(" ")}`
    const [queryEmbedding] = await embedTexts([query])
    const chunks = await retrieveChunks(queryEmbedding, data.sourceIds)
    contextChunks.push(...chunks)
    logger.info({ assignmentId, chunksRetrieved: chunks.length }, "Knowledge base chunks retrieved")
  }

  emit("job:progress", { step: "generating", message: "Generating question paper with AI..." })

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: buildPrompt(data, contextChunks) }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  })

  const raw = completion.choices[0].message.content
  if (!raw) throw new Error("Empty response from OpenAI")

  emit("job:progress", { step: "validating", message: "Validating output..." })

  let parsed
  try {
    parsed = GeneratedPaperSchema.parse(JSON.parse(raw))
  } catch {
    const retry = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: buildPrompt(data, contextChunks) },
        { role: "assistant", content: raw },
        {
          role: "user",
          content:
            "The JSON was invalid. Return only the corrected JSON with all required fields: schoolName, className, timeAllowed, maximumMarks, totalQuestions, sections (with id, title, questionType, instruction, marksPerQuestion, questions array), and answerKey.",
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    })
    const retryRaw = retry.choices[0].message.content
    if (!retryRaw) throw new Error("Empty retry response from OpenAI")
    parsed = GeneratedPaperSchema.parse(JSON.parse(retryRaw))
  }

  emit("job:progress", { step: "saving", message: "Saving question paper..." })
  const paper = await QuestionPaper.create({ assignmentId, subject: data.subject, ...parsed })

  await Assignment.findByIdAndUpdate(assignmentId, { status: "done", paperId: paper._id })

  logger.info(
    { assignmentId, paperId: paper._id, chunksUsed: contextChunks.length },
    "Paper generated"
  )

  // Fire-and-forget email to teacher
  const assignment = await Assignment.findById(assignmentId).lean()
  if (!assignment) {
    logger.warn({ assignmentId }, "mailPaperReady: assignment not found")
  } else {
    try {
      const clerkUser = await clerkClient.users.getUser(assignment.userId)
      const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? ""
      const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "Teacher"
      if (!email) {
        logger.warn({ clerkId: assignment.userId }, "mailPaperReady: teacher has no email in Clerk")
      } else {
        logger.info({ to: email }, "Sending paper-ready email")
        mailPaperReady({
          teacherEmail: email,
          teacherName: name,
          assignmentTitle: assignment.title,
          subject: assignment.subject,
          assignmentId,
          frontendUrl: env.FRONTEND_URL,
        }).catch((err) => logger.error({ err }, "mailPaperReady failed"))
      }
    } catch (err) {
      logger.warn({ err, clerkId: assignment.userId }, "mailPaperReady: failed to fetch teacher from Clerk")
    }
  }

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

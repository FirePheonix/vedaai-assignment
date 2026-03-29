import { Worker } from "bullmq"
import OpenAI from "openai"
import { createClerkClient } from "@clerk/backend"
import { parse as parsePartial } from "partial-json"
import { env } from "@/env"
import { logger } from "@/lib/logger"
import { Assignment } from "@/models/Assignment"
import { QuestionPaper } from "@/models/QuestionPaper"
import { QuestionSchema, GeneratedPaperSchema } from "@/lib/paperSchema"
import { embedTexts, retrieveChunks } from "@/lib/embed"
import { mailPaperReady } from "@/lib/emails"
import type { GenerateJobData } from "@/lib/queue"
import type { Server as SocketIOServer } from "socket.io"

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })
const openai = new OpenAI()

type Emitter = (event: string, payload: unknown) => void

function isMcqType(questionType: string): boolean {
  const t = questionType.toLowerCase()
  return t.includes("mcq") || t.includes("multiple choice") || t.includes("multiple-choice")
}

function buildPrompt(data: GenerateJobData, contextChunks: string[]): string {
  const questionList = data.questionTypes
    .map((q) => `- ${q.count} ${q.type} (${q.marks} mark${q.marks > 1 ? "s" : ""} each)`)
    .join("\n")

  const hasMcq = data.questionTypes.some((q) => isMcqType(q.type))

  const referenceSection =
    contextChunks.length > 0
      ? `\nReference material:\n${contextChunks.map((c, i) => `[${i + 1}] ${c}`).join("\n\n")}\n\nBase questions on this material where possible.`
      : ""

  const mcqNote = hasMcq
    ? `\nIMPORTANT: For MCQ/Multiple Choice questions, each question MUST include an "options" array with exactly 4 choices in format ["A. ...", "B. ...", "C. ...", "D. ..."].`
    : ""

  const questionTemplate = hasMcq
    ? `        {
          "id": "q1",
          "text": "<question text>",
          "difficulty": "Easy" | "Moderate" | "Challenging",
          "marks": <marks>,
          "options": ["A. <option>", "B. <option>", "C. <option>", "D. <option>"]
        }`
    : `        {
          "id": "q1",
          "text": "<question text>",
          "difficulty": "Easy" | "Moderate" | "Challenging",
          "marks": <marks>
        }`

  return `You are an expert teacher. Generate a complete exam question paper as structured JSON.

Subject: ${data.subject}
Title: ${data.title}
Class: ${data.className}
Question types required:
${questionList}
${data.additionalInfo ? `Additional instructions: ${data.additionalInfo}` : ""}${referenceSection}${mcqNote}

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
${questionTemplate}
      ]
    }
  ],
  "answerKey": [
    { "questionId": "q1", "answer": "<answer or correct option letter>" }
  ]
}`
}

async function streamAndDetectQuestions(
  data: GenerateJobData,
  contextChunks: string[],
  emit: Emitter
): Promise<string> {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: buildPrompt(data, contextChunks) }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    stream: true,
  })

  let accumulated = ""
  const emittedIds = new Set<string>()
  let lastStreamedText = ""
  let tokenCount = 0

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? ""
    if (!token) continue
    accumulated += token
    tokenCount++

    if (tokenCount % 3 !== 0) continue

    try {
      const partial = parsePartial(accumulated) as {
        sections?: Array<{
          id?: string
          title?: string
          questionType?: string
          questions?: unknown[]
        }>
      }

      if (!partial?.sections) continue

      let currentText: string | null = null
      let currentProgress = 0

      for (const section of partial.sections) {
        if (!section?.questions || !Array.isArray(section.questions)) continue
        for (const rawQ of section.questions) {
          if (!rawQ || typeof rawQ !== "object") continue
          const q = rawQ as Record<string, unknown>
          if (typeof q.id !== "string" || emittedIds.has(q.id)) continue
          if (typeof q.text === "string" && q.text.length > 0) {
            currentText = q.text
            currentProgress = Math.min(99, Math.round((q.text.length / 120) * 100))
          }
        }
      }

      if (currentText !== null && currentText !== lastStreamedText) {
        lastStreamedText = currentText
        emit("job:stream:text", { text: currentText, progress: currentProgress })
      }

      for (const section of partial.sections) {
        if (!section?.questions || !Array.isArray(section.questions)) continue

        for (const rawQ of section.questions) {
          if (!rawQ || typeof rawQ !== "object" || !("id" in rawQ)) continue
          const q = rawQ as Record<string, unknown>
          if (typeof q.id !== "string" || emittedIds.has(q.id)) continue

          const validated = QuestionSchema.safeParse(rawQ)
          if (!validated.success) continue

          if (isMcqType(section.questionType ?? "")) {
            if (!validated.data.options || validated.data.options.length < 4) continue
          }

          emittedIds.add(validated.data.id)
          lastStreamedText = ""
          emit("job:stream:question", {
            question: validated.data,
            sectionId: section.id ?? "",
            sectionTitle: section.title ?? "",
            questionType: section.questionType ?? "",
          })

          logger.debug({ questionId: validated.data.id, section: section.title }, "Streamed question emitted")
        }
      }
    } catch {
      // partial buffer not yet parseable, continue
    }
  }

  logger.info({ emitted: emittedIds.size }, "Stream complete")
  return accumulated
}

export async function processGenerateJobStreaming(data: GenerateJobData, emit: Emitter) {
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

  const totalExpected = data.questionTypes.reduce((s, q) => s + q.count, 0)
  emit("job:progress", { step: "generating", message: "Generating questions..." })
  emit("job:stream:start", { totalQuestions: totalExpected })

  const rawJson = await streamAndDetectQuestions(data, contextChunks, emit)

  emit("job:progress", { step: "validating", message: "Validating paper..." })

  let parsed
  try {
    parsed = GeneratedPaperSchema.parse(JSON.parse(rawJson))
  } catch {
    emit("job:progress", { step: "validating", message: "Fixing validation errors..." })
    const retry = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: buildPrompt(data, contextChunks) },
        { role: "assistant", content: rawJson },
        { role: "user", content: "The JSON was invalid. Return only the corrected complete JSON with all required fields." },
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

  logger.info({ assignmentId, paperId: paper._id }, "Paper generated (streaming)")

  const assignment = await Assignment.findById(assignmentId).lean()
  if (assignment) {
    try {
      const clerkUser = await clerkClient.users.getUser(assignment.userId)
      const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? ""
      const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "Teacher"
      if (email) {
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
      logger.warn({ err }, "Failed to fetch teacher from Clerk for email")
    }
  }

  emit("job:done", { paperId: paper._id.toString() })
  return { paperId: paper._id.toString() }
}

export function startStreamingWorker(io: SocketIOServer) {
  const worker = new Worker<GenerateJobData>(
    "assignment-generate",
    async (job) => {
      const emit: Emitter = (event, payload) =>
        io.to(job.data.assignmentId).emit(event, payload)
      return processGenerateJobStreaming(job.data, emit)
    },
    { connection: { url: env.REDIS_URL }, concurrency: 3 }
  )

  worker.on("failed", async (job, err) => {
    logger.error({ jobId: job?.id, err }, "Streaming generation job failed")
    if (job?.data.assignmentId) {
      await Assignment.findByIdAndUpdate(job.data.assignmentId, { status: "failed" })
      io.to(job.data.assignmentId).emit("job:error", { message: err.message })
    }
  })

  logger.info("Streaming generate worker started")
  return worker
}

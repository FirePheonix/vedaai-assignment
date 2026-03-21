import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest"
import { processGenerateJob } from "@/workers/generateWorker"
import { Assignment } from "@/models/Assignment"
import { QuestionPaper } from "@/models/QuestionPaper"
import { setupDB, teardownDB, clearDB } from "@/__tests__/helpers"
import type { GenerateJobData } from "@/lib/queue"

const { mockCreate } = vi.hoisted(() => {
  const mockPaperResponse = {
    schoolName: "Delhi Public School",
    className: "8th",
    timeAllowed: "45 minutes",
    maximumMarks: 10,
    totalQuestions: 2,
    sections: [
      {
        id: "s1",
        title: "Section A",
        questionType: "MCQ",
        instruction: "Attempt all questions",
        marksPerQuestion: 5,
        questions: [
          { id: "q1", text: "What is photosynthesis?", difficulty: "Easy", marks: 5 },
          { id: "q2", text: "Name the powerhouse of the cell.", difficulty: "Easy", marks: 5 },
        ],
      },
    ],
    answerKey: [
      { questionId: "q1", answer: "Process by which plants make food using sunlight." },
      { questionId: "q2", answer: "Mitochondria" },
    ],
  }
  return {
    mockPaperResponse,
    mockCreate: vi.fn().mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockPaperResponse) } }],
    }),
  }
})

vi.mock("openai", () => {
  class MockOpenAI {
    chat = { completions: { create: mockCreate } }
  }
  return { default: MockOpenAI }
})

beforeAll(setupDB)
afterAll(teardownDB)
afterEach(clearDB)

async function createAssignment() {
  return Assignment.create({
    userId: "test_user",
    title: "Biology Test",
    subject: "Biology",
    dueDate: new Date(Date.now() + 86400000),
    questionTypes: [{ type: "MCQ", count: 2, marks: 5 }],
    sourceIds: [],
    status: "pending",
  })
}

function makeEmitter() {
  const events: { event: string; payload: unknown }[] = []
  const emit = (event: string, payload: unknown) => events.push({ event, payload })
  return { emit, events }
}

describe("processGenerateJob", () => {
  it("creates a QuestionPaper in the database", async () => {
    const assignment = await createAssignment()
    const { emit } = makeEmitter()

    const jobData: GenerateJobData = {
      assignmentId: assignment._id.toString(),
      title: "Biology Test",
      subject: "Biology",
      className: "8th",
      questionTypes: [{ type: "MCQ", count: 2, marks: 5 }],
      sourceIds: [],
    }

    await processGenerateJob(jobData, emit)

    const paper = await QuestionPaper.findOne({ assignmentId: assignment._id }).lean()
    expect(paper).not.toBeNull()
    expect(paper!.subject).toBe("Biology")
    expect(paper!.sections).toHaveLength(1)
    expect(paper!.sections[0].questions).toHaveLength(2)
  })

  it("updates assignment status to done and sets paperId", async () => {
    const assignment = await createAssignment()
    const { emit } = makeEmitter()

    const jobData: GenerateJobData = {
      assignmentId: assignment._id.toString(),
      title: "Biology Test",
      subject: "Biology",
      className: "8th",
      questionTypes: [{ type: "MCQ", count: 2, marks: 5 }],
      sourceIds: [],
    }

    const result = await processGenerateJob(jobData, emit)

    const updated = await Assignment.findById(assignment._id).lean()
    expect(updated!.status).toBe("done")
    expect(updated!.paperId?.toString()).toBe(result.paperId)
  })

  it("emits progress events in the correct order", async () => {
    const assignment = await createAssignment()
    const { emit, events } = makeEmitter()

    const jobData: GenerateJobData = {
      assignmentId: assignment._id.toString(),
      title: "Biology Test",
      subject: "Biology",
      className: "8th",
      questionTypes: [{ type: "MCQ", count: 2, marks: 5 }],
      sourceIds: [],
    }

    await processGenerateJob(jobData, emit)

    const steps = events.map((e) => e.event)
    expect(steps).toEqual([
      "job:progress",
      "job:progress",
      "job:progress",
      "job:progress",
      "job:done",
    ])

    const progressSteps = events
      .filter((e) => e.event === "job:progress")
      .map((e) => (e.payload as { step: string }).step)
    expect(progressSteps).toEqual(["retrieving", "generating", "validating", "saving"])
  })

  it("throws if OpenAI returns empty content", async () => {
    mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: null } }] })

    const assignment = await createAssignment()
    const { emit } = makeEmitter()

    await expect(
      processGenerateJob(
        {
          assignmentId: assignment._id.toString(),
          title: "Biology Test",
          subject: "Biology",
          className: "8th",
          questionTypes: [{ type: "MCQ", count: 2, marks: 5 }],
          sourceIds: [],
        },
        emit
      )
    ).rejects.toThrow("Empty response from OpenAI")
  })

  it("returns paperId on success", async () => {
    const assignment = await createAssignment()
    const { emit } = makeEmitter()

    const result = await processGenerateJob(
      {
        assignmentId: assignment._id.toString(),
        title: "Biology Test",
        subject: "Biology",
        className: "8th",
        questionTypes: [{ type: "MCQ", count: 2, marks: 5 }],
        sourceIds: [],
      },
      emit
    )

    expect(result.paperId).toBeDefined()
    expect(typeof result.paperId).toBe("string")
  })
})

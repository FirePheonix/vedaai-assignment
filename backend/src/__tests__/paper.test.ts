import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import type { Request, Response } from "express"
import { createCallerFactory } from "@/trpc"
import { appRouter } from "@/routers/_app"
import { QuestionPaper } from "@/models/QuestionPaper"
import { Assignment } from "@/models/Assignment"
import { setupDB, teardownDB, clearDB } from "@/__tests__/helpers"

const createCaller = createCallerFactory(appRouter)
const caller = createCaller({ req: {} as Request, res: {} as Response, userId: "test_user" })

beforeAll(setupDB)
afterAll(teardownDB)
afterEach(clearDB)

async function createMockPaper() {
  const assignment = await Assignment.create({
    userId: "test_user",
    title: "Science Test",
    subject: "Science",
    dueDate: new Date(Date.now() + 86400000),
    questionTypes: [{ type: "Short Answer", count: 3, marks: 2 }],
    status: "done",
  })

  const paper = await QuestionPaper.create({
    assignmentId: assignment._id,
    schoolName: "Delhi Public School",
    subject: "Science",
    className: "8th",
    timeAllowed: "45 minutes",
    maximumMarks: 20,
    totalQuestions: 3,
    sections: [
      {
        id: "s1",
        title: "Section A",
        questionType: "Short Answer",
        instruction: "Attempt all questions",
        marksPerQuestion: 2,
        questions: [
          { id: "q1", text: "Define electroplating.", difficulty: "Easy", marks: 2 },
          { id: "q2", text: "What is electrolysis?", difficulty: "Moderate", marks: 2 },
        ],
      },
    ],
    answerKey: [{ questionId: "q1", answer: "Electroplating is..." }],
  })

  return { assignment, paper }
}

describe("paper.getById", () => {
  it("returns paper by id", async () => {
    const { paper } = await createMockPaper()
    const result = await caller.paper.getById({ id: paper._id.toString() })

    expect(result.id).toBe(paper._id.toString())
    expect(result.subject).toBe("Science")
    expect(result.sections).toHaveLength(1)
    expect(result.sections[0].questions).toHaveLength(2)
  })

  it("throws NOT_FOUND for unknown id", async () => {
    await expect(
      caller.paper.getById({ id: "000000000000000000000000" })
    ).rejects.toThrow("Paper not found")
  })
})

describe("paper.getByAssignmentId", () => {
  it("returns paper for an assignment", async () => {
    const { assignment, paper } = await createMockPaper()
    const result = await caller.paper.getByAssignmentId({
      assignmentId: assignment._id.toString(),
    })

    expect(result).not.toBeNull()
    expect(result!.id).toBe(paper._id.toString())
  })

  it("returns null when no paper exists for assignment", async () => {
    const result = await caller.paper.getByAssignmentId({
      assignmentId: "000000000000000000000000",
    })
    expect(result).toBeNull()
  })
})

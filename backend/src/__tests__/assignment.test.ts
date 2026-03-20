import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import type { Request, Response } from "express"
import { createCallerFactory } from "@/trpc"
import { appRouter } from "@/routers/_app"
import { setupDB, teardownDB, clearDB } from "@/__tests__/helpers"

const createCaller = createCallerFactory(appRouter)
const caller = createCaller({ req: {} as Request, res: {} as Response, userId: "test_user" })

const validInput = {
  title: "Physics Test",
  subject: "Physics",
  dueDate: new Date(Date.now() + 86400000).toISOString(),
  questionTypes: [{ type: "MCQ", count: 5, marks: 2 }],
  additionalInfo: "Focus on electricity chapter",
}

beforeAll(setupDB)
afterAll(teardownDB)
afterEach(clearDB)

describe("assignment.create", () => {
  it("creates an assignment and returns assignmentId", async () => {
    const result = await caller.assignment.create(validInput)
    expect(result.assignmentId).toBeDefined()
    expect(typeof result.assignmentId).toBe("string")
  })

  it("rejects title shorter than 3 chars", async () => {
    await expect(
      caller.assignment.create({ ...validInput, title: "ab" })
    ).rejects.toThrow()
  })

  it("rejects empty questionTypes", async () => {
    await expect(
      caller.assignment.create({ ...validInput, questionTypes: [] })
    ).rejects.toThrow()
  })

  it("rejects question count less than 1", async () => {
    await expect(
      caller.assignment.create({
        ...validInput,
        questionTypes: [{ type: "MCQ", count: 0, marks: 2 }],
      })
    ).rejects.toThrow()
  })
})

describe("assignment.list", () => {
  it("returns empty array when no assignments", async () => {
    const result = await caller.assignment.list()
    expect(result).toEqual([])
  })

  it("returns created assignments", async () => {
    await caller.assignment.create(validInput)
    await caller.assignment.create({ ...validInput, title: "Chemistry Test", subject: "Chemistry" })

    const result = await caller.assignment.list()
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe("Chemistry Test") // sorted by createdAt desc
  })

  it("returned assignments have correct shape", async () => {
    await caller.assignment.create(validInput)
    const [assignment] = await caller.assignment.list()

    expect(assignment).toMatchObject({
      id: expect.any(String),
      title: "Physics Test",
      subject: "Physics",
      status: "pending",
      paperId: null,
    })
  })
})

describe("assignment.getById", () => {
  it("returns assignment by id", async () => {
    const { assignmentId } = await caller.assignment.create(validInput)
    const result = await caller.assignment.getById({ id: assignmentId })

    expect(result.id).toBe(assignmentId)
    expect(result.title).toBe("Physics Test")
    expect(result.questionTypes).toHaveLength(1)
  })

  it("throws NOT_FOUND for unknown id", async () => {
    await expect(
      caller.assignment.getById({ id: "000000000000000000000000" })
    ).rejects.toThrow("Assignment not found")
  })
})

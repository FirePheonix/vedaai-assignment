import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest"
import type { Request, Response } from "express"
import { createCallerFactory } from "@/trpc"
import { appRouter } from "@/routers/_app"
import { Assignment } from "@/models/Assignment"
import { setupDB, teardownDB, clearDB } from "@/__tests__/helpers"

vi.mock("@/lib/queue", () => ({
  assignmentQueue: {
    add: vi.fn().mockResolvedValue({ id: "mock-job-id-123" }),
  },
}))

const createCaller = createCallerFactory(appRouter)
const caller = createCaller({ req: {} as Request, res: {} as Response })

const baseInput = {
  title: "Biology Test",
  subject: "Biology",
  dueDate: new Date(Date.now() + 86400000).toISOString(),
  questionTypes: [{ type: "MCQ", count: 5, marks: 2 }],
}

beforeAll(setupDB)
afterAll(teardownDB)
afterEach(clearDB)

describe("assignment.generate", () => {
  it("enqueues a job and returns jobId", async () => {
    const { assignmentId } = await caller.assignment.create(baseInput)

    const result = await caller.assignment.generate({ id: assignmentId, className: "8th" })

    expect(result.jobId).toBe("mock-job-id-123")
  })

  it("saves jobId on the assignment after enqueuing", async () => {
    const { assignmentId } = await caller.assignment.create(baseInput)
    await caller.assignment.generate({ id: assignmentId, className: "8th" })

    const assignment = await Assignment.findById(assignmentId).lean()
    expect(assignment?.jobId).toBe("mock-job-id-123")
  })

  it("throws NOT_FOUND for unknown assignment", async () => {
    await expect(
      caller.assignment.generate({ id: "000000000000000000000000", className: "8th" })
    ).rejects.toThrow("Assignment not found")
  })

  it("throws CONFLICT if assignment is already processing", async () => {
    const { assignmentId } = await caller.assignment.create(baseInput)
    await Assignment.findByIdAndUpdate(assignmentId, { status: "processing" })

    await expect(
      caller.assignment.generate({ id: assignmentId, className: "8th" })
    ).rejects.toThrow("Already generating")
  })

  it("passes correct job data to the queue", async () => {
    const { assignmentQueue } = await import("@/lib/queue")
    const { assignmentId } = await caller.assignment.create({
      ...baseInput,
      additionalInfo: "Focus on chapter 3",
    })

    await caller.assignment.generate({ id: assignmentId, className: "10th" })

    expect(assignmentQueue.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        assignmentId,
        title: "Biology Test",
        subject: "Biology",
        className: "10th",
        additionalInfo: "Focus on chapter 3",
      })
    )
  })
})

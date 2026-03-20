import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest"
import { setupDB, teardownDB, clearDB } from "./helpers"

const { mockEmbeddingsCreate } = vi.hoisted(() => {
  const mockEmbeddingsCreate = vi.fn()
  return { mockEmbeddingsCreate }
})

vi.mock("openai", () => {
  class MockOpenAI {
    embeddings = { create: mockEmbeddingsCreate }
    chat = { completions: { create: vi.fn() } }
  }
  return { default: MockOpenAI }
})

function fakeEmbedding(seed: number): number[] {
  return Array.from({ length: 1536 }, (_, i) => Math.sin(seed + i) * 0.1)
}

beforeAll(setupDB)
afterAll(teardownDB)
afterEach(clearDB)

describe("chunkText", () => {
  it("splits text into chunks of given size", async () => {
    const { chunkText } = await import("@/lib/embed")
    const text = "a".repeat(1100)
    const chunks = chunkText(text, 500, 50)
    expect(chunks.length).toBe(3)
    expect(chunks[0].text.length).toBe(500)
    expect(chunks[0].charStart).toBe(0)
    expect(chunks[0].charEnd).toBe(500)
  })

  it("last chunk covers remaining text", async () => {
    const { chunkText } = await import("@/lib/embed")
    const text = "x".repeat(600)
    const chunks = chunkText(text, 500, 50)
    expect(chunks[chunks.length - 1].charEnd).toBe(600)
  })

  it("returns single chunk for short text", async () => {
    const { chunkText } = await import("@/lib/embed")
    const chunks = chunkText("short text", 500, 50)
    expect(chunks.length).toBe(1)
    expect(chunks[0].text).toBe("short text")
  })

  it("chunks overlap by the given overlap amount", async () => {
    const { chunkText } = await import("@/lib/embed")
    const text = "a".repeat(1000)
    const chunks = chunkText(text, 500, 100)
    expect(chunks[1].charStart).toBe(400)
  })
})

describe("storeChunks", () => {
  it("creates knowledge chunks in the database", async () => {
    mockEmbeddingsCreate.mockResolvedValue({
      data: Array.from({ length: 3 }, (_, i) => ({ embedding: fakeEmbedding(i) })),
    })

    const { storeChunks } = await import("@/lib/embed")
    const { KnowledgeChunk } = await import("@/models/KnowledgeChunk")

    const text = "a".repeat(1100)
    const { sourceId, chunksStored } = await storeChunks("test.pdf", text)

    expect(sourceId).toBeTruthy()
    expect(chunksStored).toBe(3)

    const stored = await KnowledgeChunk.find({ sourceId })
    expect(stored.length).toBe(3)
    expect(stored[0].filename).toBe("test.pdf")
    expect(stored[0].embedding.length).toBe(1536)
  })

  it("all chunks share the same sourceId", async () => {
    mockEmbeddingsCreate.mockResolvedValue({
      data: Array.from({ length: 3 }, (_, i) => ({ embedding: fakeEmbedding(i) })),
    })

    const { storeChunks } = await import("@/lib/embed")
    const { KnowledgeChunk } = await import("@/models/KnowledgeChunk")

    const { sourceId } = await storeChunks("doc.pdf", "b".repeat(1100))
    const chunks = await KnowledgeChunk.find({ sourceId })
    expect(chunks.every((c) => c.sourceId === sourceId)).toBe(true)
  })
})

describe("embedTexts", () => {
  it("returns one embedding per input text", async () => {
    const texts = ["hello", "world", "foo"]
    mockEmbeddingsCreate.mockResolvedValue({
      data: texts.map((_, i) => ({ embedding: fakeEmbedding(i) })),
    })

    const { embedTexts } = await import("@/lib/embed")
    const result = await embedTexts(texts)

    expect(result.length).toBe(3)
    expect(result[0].length).toBe(1536)
    expect(mockEmbeddingsCreate).toHaveBeenCalledWith({
      model: "text-embedding-3-small",
      input: texts,
    })
  })
})

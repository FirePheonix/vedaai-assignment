import OpenAI from "openai"
import mongoose from "mongoose"
import { KnowledgeChunk } from "@/models/KnowledgeChunk"
import { logger } from "@/lib/logger"

const openai = new OpenAI()

export function chunkText(
  text: string,
  size = 500,
  overlap = 50
): Array<{ text: string; charStart: number; charEnd: number }> {
  const chunks: Array<{ text: string; charStart: number; charEnd: number }> = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + size, text.length)
    chunks.push({ text: text.slice(start, end), charStart: start, charEnd: end })
    if (end === text.length) break
    start += size - overlap
  }
  return chunks
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  })
  return response.data.map((d) => d.embedding)
}

export async function storeChunks(
  filename: string,
  text: string
): Promise<{ sourceId: string; chunksStored: number }> {
  const chunks = chunkText(text)
  const sourceId = new mongoose.Types.ObjectId().toString()

  logger.info({ filename, chunkCount: chunks.length }, "Embedding chunks for knowledge base")

  const embeddings = await embedTexts(chunks.map((c) => c.text))

  await KnowledgeChunk.insertMany(
    chunks.map((c, i) => ({
      sourceId,
      filename,
      chunkIndex: i,
      text: c.text,
      embedding: embeddings[i],
      charStart: c.charStart,
      charEnd: c.charEnd,
    }))
  )

  logger.info({ sourceId, chunksStored: chunks.length }, "Chunks stored in knowledge base")
  return { sourceId, chunksStored: chunks.length }
}

export async function retrieveChunks(
  queryEmbedding: number[],
  sourceIds: string[],
  topK = 10
): Promise<string[]> {
  if (!sourceIds.length) return []

  const results = await KnowledgeChunk.aggregate([
    {
      $vectorSearch: {
        index: "knowledge_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: topK * 10,
        limit: topK,
        filter: { sourceId: { $in: sourceIds } },
      },
    },
    { $project: { text: 1, _id: 0 } },
  ])

  return results.map((r: { text: string }) => r.text)
}

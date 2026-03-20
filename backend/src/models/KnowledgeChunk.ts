import { Schema, model, Document } from "mongoose"

export interface IKnowledgeChunk extends Document {
  sourceId: string
  filename: string
  chunkIndex: number
  text: string
  embedding: number[]
  charStart: number
  charEnd: number
  uploadedAt: Date
}

const KnowledgeChunkSchema = new Schema<IKnowledgeChunk>({
  sourceId: { type: String, required: true, index: true },
  filename: { type: String, required: true },
  chunkIndex: { type: Number, required: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  charStart: { type: Number, required: true },
  charEnd: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
})

export const KnowledgeChunk = model<IKnowledgeChunk>("KnowledgeChunk", KnowledgeChunkSchema)

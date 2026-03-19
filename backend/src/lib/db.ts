import mongoose from "mongoose"
import { env } from "../env"
import { logger } from "./logger"

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI)
    logger.info({ uri: env.MONGODB_URI.split("@").pop() }, "MongoDB connected")
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed")
    process.exit(1)
  }

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected")
  })
}

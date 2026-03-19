import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import { vi } from "vitest"

// Mock ioredis before any imports touch it
vi.mock("ioredis", async () => {
  const { default: RedisMock } = await import("ioredis-mock")
  return { default: RedisMock }
})

// Mock pino to silence logs during tests
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

let mongod: MongoMemoryServer

export async function setupDB() {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
}

export async function teardownDB() {
  await mongoose.disconnect()
  await mongod.stop()
}

export async function clearDB() {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}

import "./env"
import express from "express"
import cors from "cors"
import http from "http"
import { Server as SocketIOServer } from "socket.io"
import { createExpressMiddleware } from "@trpc/server/adapters/express"
import { createBullBoard } from "@bull-board/api"
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter"
import { ExpressAdapter } from "@bull-board/express"
import { appRouter } from "./routers/_app"
import { createContext } from "./trpc"
import { connectDB } from "./lib/db"
import { redis } from "./lib/redis"
import { logger } from "./lib/logger"
import { env } from "./env"
import { assignmentQueue } from "./lib/queue"
import { startWorker } from "./workers/generateWorker"
import { uploadRouter } from "./routes/upload"

const app = express()
const httpServer = http.createServer(app)

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
})

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json({ limit: "10mb" }))

app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() })
})

const bullBoardAdapter = new ExpressAdapter()
bullBoardAdapter.setBasePath("/admin/queues")
createBullBoard({
  queues: [new BullMQAdapter(assignmentQueue)],
  serverAdapter: bullBoardAdapter,
})
app.use("/admin/queues", bullBoardAdapter.getRouter())
app.use("/upload", uploadRouter)

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ path, error }) {
      logger.error({ path, err: error }, "tRPC error")
    },
  })
)

io.on("connection", (socket) => {
  logger.debug({ socketId: socket.id }, "Client connected")

  socket.on("join:job", (jobId: string) => {
    socket.join(jobId)
    logger.debug({ socketId: socket.id, jobId }, "Client joined job room")
  })

  socket.on("disconnect", () => {
    logger.debug({ socketId: socket.id }, "Client disconnected")
  })
})

async function start() {
  await connectDB()
  await redis.connect()
  startWorker(io)

  httpServer.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Server running")
    logger.info(`Bull Board: http://localhost:${env.PORT}/admin/queues`)
  })
}

start()

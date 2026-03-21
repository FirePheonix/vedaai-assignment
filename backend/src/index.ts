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
import { startDeadlineWorker } from "./workers/deadlineWorker"
import { uploadRouter } from "./routes/upload"
import { webhookRouter } from "./routes/webhook"

const app = express()
const httpServer = http.createServer(app)

export const io = new SocketIOServer(httpServer, {
  transports: ["websocket"],
  cors: {
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
})

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))

// Webhook must be mounted before express.json() — Svix needs raw body
app.use("/webhook", webhookRouter)

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
    onError({ path, error, req }) {
      logger.error(
        {
          path,
          code: error.code,
          message: error.message,
          stack: error.stack,
          cause: error.cause,
          method: req.method,
        },
        "tRPC error"
      )
    },
  })
)

io.engine.on("connection_error", (err) => {
  logger.error({ code: err.code, message: err.message, context: err.context }, "Socket.IO connection error")
})

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id, transport: socket.conn.transport.name }, "Client connected")

  socket.conn.on("upgrade", (transport) => {
    logger.info({ socketId: socket.id, transport: transport.name }, "Socket transport upgraded")
  })

  socket.on("join:job", (jobId: string) => {
    socket.join(jobId)
    logger.info({ socketId: socket.id, jobId }, "Client joined job room")
  })

  socket.on("disconnect", (reason) => {
    logger.info({ socketId: socket.id, reason }, "Client disconnected")
  })
})

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection")
})

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception")
  process.exit(1)
})

async function start() {
  await connectDB()
  await redis.connect()
  startWorker(io)
  startDeadlineWorker()

  httpServer.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Server running")
    logger.info(`Bull Board: http://localhost:${env.PORT}/admin/queues`)
  })
}

start()

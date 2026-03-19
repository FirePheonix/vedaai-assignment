import { router } from "../trpc"
import { assignmentRouter } from "./assignment"
import { paperRouter } from "./paper"

export const appRouter = router({
  assignment: assignmentRouter,
  paper: paperRouter,
})

export type AppRouter = typeof appRouter

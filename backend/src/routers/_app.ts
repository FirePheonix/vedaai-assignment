import { router } from "../trpc"
import { assignmentRouter } from "./assignment"
import { paperRouter } from "./paper"
import { classRouter } from "./class"
import { userRouter } from "./user"
import { submissionRouter } from "./submission"

export const appRouter = router({
  assignment: assignmentRouter,
  paper: paperRouter,
  class: classRouter,
  user: userRouter,
  submission: submissionRouter,
})

export type AppRouter = typeof appRouter

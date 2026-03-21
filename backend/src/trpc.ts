import { initTRPC, TRPCError } from "@trpc/server"
import type { Request, Response } from "express"
import { ZodError } from "zod"
import { verifyToken } from "@clerk/backend"
import { env } from "@/env"
import { User } from "@/models/User"

export interface Context {
  req: Request
  res: Response
  userId: string | null
}

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<Context> {
  let userId: string | null = null

  const authHeader = req.headers.authorization
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    try {
      const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY })
      userId = payload.sub
    } catch {
      // invalid token — userId stays null
    }
  }

  return { req, res, userId }
}

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})

export const teacherProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await User.findOne({ clerkId: ctx.userId }).lean()
  if (!user || user.role !== "teacher") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Teachers only" })
  }
  return next({ ctx: { ...ctx, user } })
})

export const studentProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await User.findOne({ clerkId: ctx.userId }).lean()
  if (!user || user.role !== "student") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Students only" })
  }
  return next({ ctx: { ...ctx, user } })
})

export const createCallerFactory = t.createCallerFactory
export { TRPCError }

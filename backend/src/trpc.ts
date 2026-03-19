import { initTRPC, TRPCError } from "@trpc/server"
import type { Request, Response } from "express"
import { ZodError } from "zod"

export interface Context {
  req: Request
  res: Response
}

export function createContext({ req, res }: { req: Request; res: Response }): Context {
  return { req, res }
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
export { TRPCError }

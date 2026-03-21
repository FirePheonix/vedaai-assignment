import { z } from "zod"
import { createClerkClient } from "@clerk/backend"
import { router, protectedProcedure, TRPCError } from "../trpc"
import { User } from "../models/User"
import { env } from "@/env"

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })

export const userRouter = router({
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const user = await User.findOne({ clerkId: ctx.userId }).lean()
    if (!user) return null
    return {
      id: user._id.toString(),
      clerkId: user.clerkId,
      role: user.role,
      name: user.name,
      email: user.email,
      schoolName: user.schoolName ?? null,
    }
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1).max(60).optional(),
        lastName: z.string().max(60).optional(),
        schoolName: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const name = [input.firstName, input.lastName].filter(Boolean).join(" ").trim()

      await User.findOneAndUpdate(
        { clerkId: ctx.userId },
        {
          $set: {
            ...(name ? { name } : {}),
            ...(input.schoolName !== undefined ? { schoolName: input.schoolName } : {}),
          },
        },
        { upsert: true }
      )

      if (input.firstName || input.lastName !== undefined) {
        await clerk.users.updateUser(ctx.userId, {
          ...(input.firstName ? { firstName: input.firstName } : {}),
          ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
        })
      }

      return { success: true }
    }),

  setRole: protectedProcedure
    .input(
      z.object({
        role: z.enum(["teacher", "student"]),
        schoolName: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Upsert User doc
      await User.findOneAndUpdate(
        { clerkId: ctx.userId },
        {
          $set: {
            role: input.role,
            ...(input.schoolName ? { schoolName: input.schoolName } : {}),
          },
        },
        { upsert: true }
      )

      // Sync role into Clerk publicMetadata
      try {
        await clerk.users.updateUser(ctx.userId, {
          publicMetadata: { role: input.role },
        })
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update Clerk metadata",
        })
      }

      return { success: true, role: input.role }
    }),
})

import { z } from "zod"
import { router, protectedProcedure, teacherProcedure, studentProcedure, TRPCError } from "../trpc"
import { Class } from "../models/Class"
import { User } from "../models/User"

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no ambiguous chars (0/O, 1/I)
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

async function uniqueJoinCode(): Promise<string> {
  for (let attempts = 0; attempts < 10; attempts++) {
    const code = generateJoinCode()
    const existing = await Class.findOne({ joinCode: code }).lean()
    if (!existing) return code
  }
  throw new Error("Could not generate unique join code")
}

export const classRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const classes = await Class.find({ userId: ctx.userId }).sort({ createdAt: -1 }).lean()
    return classes.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      joinCode: c.joinCode,
      studentCount: (c.studentIds ?? []).length,
      createdAt: c.createdAt.toISOString(),
    }))
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ input, ctx }) => {
      const joinCode = await uniqueJoinCode()
      const cls = await Class.create({ userId: ctx.userId, name: input.name, joinCode })
      return { id: cls._id.toString(), name: cls.name, joinCode: cls.joinCode }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const cls = await Class.findOneAndDelete({ _id: input.id, userId: ctx.userId })
      if (!cls) throw new TRPCError({ code: "NOT_FOUND", message: "Class not found" })
      return { success: true }
    }),

  joinByCode: studentProcedure
    .input(z.object({ code: z.string().min(1).max(10) }))
    .mutation(async ({ input, ctx }) => {
      const cls = await Class.findOneAndUpdate(
        { joinCode: input.code.toUpperCase() },
        { $addToSet: { studentIds: ctx.userId } },
        { new: true }
      )
      if (!cls) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid class code" })
      return { classId: cls._id.toString(), className: cls.name }
    }),

  getStudents: teacherProcedure
    .input(z.object({ classId: z.string() }))
    .query(async ({ input, ctx }) => {
      const cls = await Class.findOne({ _id: input.classId, userId: ctx.userId }).lean()
      if (!cls) throw new TRPCError({ code: "NOT_FOUND", message: "Class not found" })

      const students = await User.find({ clerkId: { $in: cls.studentIds ?? [] } }).lean()
      return students.map((s) => ({
        studentId: s.clerkId,
        name: s.name,
        email: s.email,
      }))
    }),
})

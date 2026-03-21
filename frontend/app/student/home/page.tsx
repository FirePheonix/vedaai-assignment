"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { BookOpen, Clock, CheckCircle, Hash, Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc"

function statusConfig(status: string | null) {
  if (status === "graded") return { label: "Graded", color: "bg-green-100 text-green-700" }
  if (status === "submitted") return { label: "Submitted", color: "bg-blue-100 text-blue-700" }
  return { label: "Not submitted", color: "bg-orange-100 text-orange-600" }
}

export default function StudentHomePage() {
  const router = useRouter()
  const { user } = useUser()
  const { data: assignments = [], isLoading } = trpc.assignment.listForStudent.useQuery()

  const firstName = user?.firstName ?? "Student"

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#f2f4f7] md:bg-transparent overflow-hidden px-4 md:px-0 py-4 md:pr-4 pb-24 md:pb-4">
      <div className="flex-1 overflow-y-auto">
        {/* Greeting */}
        <div className="mb-6">
          <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
            Student Dashboard
          </p>
          <h1 className="text-[22px] font-extrabold text-gray-900">Hey, {firstName} 👋</h1>
        </div>

        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 font-medium mb-1">No assignments yet</p>
            <p className="text-gray-400 text-[13px] mb-5">Ask your teacher for a class join code</p>
            <button
              onClick={() => router.push("/student/join")}
              className="flex items-center gap-2 bg-[#111] text-white font-bold px-5 py-2.5 rounded-[16px] hover:bg-gray-800 transition-colors text-[14px]"
            >
              <Hash size={14} strokeWidth={2.5} />
              Join a Class
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-extrabold text-gray-900">Your Assignments</h2>
              <button
                onClick={() => router.push("/student/join")}
                className="flex items-center gap-1.5 text-orange-500 font-semibold text-[13px] hover:text-orange-600"
              >
                <Hash size={13} strokeWidth={2.5} />
                Join class
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {assignments.map((a) => {
                const { label, color } = statusConfig(a.submissionStatus)
                const isGraded = a.submissionStatus === "graded"
                const isSubmitted = a.submissionStatus === "submitted"

                const handleClick = () => {
                  if (isGraded && a.submissionId) router.push(`/student/results/${a.submissionId}`)
                  else if (!isSubmitted) router.push(`/student/paper/${a.id}`)
                }

                return (
                  <div
                    key={a.id}
                    onClick={handleClick}
                    className={`bg-white rounded-[20px] p-5 shadow-sm flex items-start gap-4 ${!isSubmitted ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen size={18} className="text-orange-400" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-extrabold text-gray-900 text-[14px] leading-tight">
                            {a.title}
                          </p>
                          <p className="text-gray-400 text-[12px] mt-0.5">
                            {a.subject} · {a.className}
                          </p>
                        </div>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${color}`}
                        >
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-[12px] text-gray-400">
                        <Clock size={11} strokeWidth={2.5} />
                        <span>
                          Due{" "}
                          {new Date(a.dueDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      {isGraded && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-green-600 font-semibold">
                          <CheckCircle size={11} strokeWidth={2.5} />
                          <span>Graded — tap to see results</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, CheckCircle, Clock, Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc"

export default function SubmissionsPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = use(params)
  const router = useRouter()

  const { data: assignment } = trpc.assignment.getById.useQuery({ id: assignmentId })
  const { data: submissions = [], isLoading } = trpc.submission.getForAssignment.useQuery({
    assignmentId,
  })

  const gradedCount = submissions.filter((s) => s.status === "graded").length

  return (
    <div className="flex flex-col h-full bg-[#f2f4f7] md:bg-transparent overflow-hidden px-4 md:px-0 py-4 md:pr-4 pb-24 md:pb-4">
      <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full">
        <button
          onClick={() => router.push("/assignments")}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors text-[13px] font-semibold mb-5"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Assignments
        </button>

        {/* Header */}
        <div className="bg-[#2a2a2a] rounded-[28px] p-6 mb-5">
          <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
            {assignment?.subject}
          </p>
          <h1 className="text-[20px] font-extrabold text-white mb-3">
            {assignment?.title ?? "Submissions"}
          </h1>
          <div className="flex items-center gap-4 text-[13px] font-semibold">
            <span className="text-gray-300">{submissions.length} submitted</span>
            <span className="text-gray-500">·</span>
            <span className="text-green-400">{gradedCount} graded</span>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={22} className="animate-spin text-gray-400" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 text-gray-200" strokeWidth={1.5} />
            <p className="font-medium">No submissions yet</p>
            <p className="text-[13px] mt-1">Students will appear here once they submit</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {submissions.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-[20px] p-5 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/grade/${s.id}`)}
              >
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-gray-400" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-gray-900 text-[14px]">{s.studentName}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    Submitted{" "}
                    {new Date(s.submittedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {s.status === "graded" ? (
                    <>
                      <span className="text-[13px] font-bold text-gray-700">
                        {s.totalMarksAwarded}/{s.maxMarks}
                      </span>
                      <div className="flex items-center gap-1 text-green-600 bg-green-50 rounded-full px-2.5 py-1 text-[11px] font-bold">
                        <CheckCircle size={11} strokeWidth={2.5} />
                        Graded
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1 text-orange-500 bg-orange-50 rounded-full px-2.5 py-1 text-[11px] font-bold">
                      <Clock size={11} strokeWidth={2.5} />
                      Review
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

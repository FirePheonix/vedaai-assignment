"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Clock, MessageSquare, ArrowLeft, Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc"

export default function StudentResultsPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = use(params)
  const router = useRouter()

  const { data: submission, isLoading } = trpc.submission.getById.useQuery({ id: submissionId })

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Submission not found.
      </div>
    )
  }

  const isPending = submission.status !== "graded"
  const percent = submission.totalMarksAwarded != null
    ? Math.round((submission.totalMarksAwarded / submission.maxMarks) * 100)
    : null

  return (
    <div className="flex flex-col h-full bg-[#f2f4f7] md:bg-transparent overflow-hidden px-4 md:px-0 py-4 md:pr-4 pb-24 md:pb-4">
      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full">

        <button
          onClick={() => router.push("/student/home")}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors text-[13px] font-semibold mb-5"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Dashboard
        </button>

        <div className="bg-white rounded-[28px] p-6 shadow-sm mb-4">
          <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{submission.subject}</p>
          <h1 className="text-[19px] font-extrabold text-gray-900 mb-4">{submission.assignmentTitle}</h1>

          {isPending ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <Clock size={26} className="text-blue-400" strokeWidth={1.5} />
              </div>
              <p className="font-bold text-gray-700 mb-1">Awaiting Review</p>
              <p className="text-gray-400 text-[13px]">Your teacher hasn&apos;t graded this yet.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center py-6">
                <div className="text-center">
                  <div className="text-[52px] font-extrabold text-gray-900 leading-none">
                    {submission.totalMarksAwarded}
                    <span className="text-[24px] font-medium text-gray-400">/{submission.maxMarks}</span>
                  </div>
                  <p className="text-[14px] font-semibold text-gray-500 mt-1">{percent}% · {
                    percent! >= 80 ? "Excellent" : percent! >= 60 ? "Good" : percent! >= 40 ? "Needs improvement" : "Below average"
                  }</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[12px] text-green-600 font-semibold bg-green-50 rounded-xl px-3 py-2 w-fit">
                <CheckCircle size={12} strokeWidth={2.5} />
                Graded on {new Date(submission.gradedAt!).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </>
          )}
        </div>

        {submission.feedback && (
          <div className="bg-white rounded-[28px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={15} className="text-gray-400" strokeWidth={2} />
              <p className="text-[13px] font-extrabold text-gray-700">Teacher&apos;s Feedback</p>
            </div>
            <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">{submission.feedback}</p>
          </div>
        )}
      </div>
    </div>
  )
}

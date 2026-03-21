"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, Loader2, CheckCircle } from "lucide-react"
import { trpc } from "@/lib/trpc"

export default function GradePage({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = use(params)
  const router = useRouter()

  const { data: submission, isLoading } = trpc.submission.getById.useQuery({ id: submissionId })
  const [marks, setMarks] = useState<string>("")
  const [feedback, setFeedback] = useState("")
  const [saved, setSaved] = useState(false)

  const gradeMutation = trpc.submission.grade.useMutation({
    onSuccess: () => setSaved(true),
  })

  // Pre-fill if already graded
  const initialMarks = submission?.totalMarksAwarded?.toString() ?? ""
  const initialFeedback = submission?.feedback ?? ""

  const handleSave = () => {
    const m = parseFloat(marks || initialMarks)
    if (isNaN(m) || !submission) return
    gradeMutation.mutate({
      id: submissionId,
      totalMarksAwarded: m,
      feedback: (feedback || initialFeedback).trim() || undefined,
    })
  }

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-white shrink-0">
        <button
          onClick={() => router.push(`/submissions/${submission.assignmentId}`)}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-gray-900 text-[14px] truncate">{submission.studentName}</p>
          <p className="text-gray-400 text-[11px]">{submission.subject} · {submission.assignmentTitle}</p>
        </div>
        {saved && (
          <div className="flex items-center gap-1.5 text-green-600 text-[12px] font-bold">
            <CheckCircle size={13} strokeWidth={2.5} />
            Saved
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* File viewer — left panel */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden">
          {submission.fileType === "pdf" ? (
            <iframe
              src={submission.fileUrl}
              className="w-full h-full border-0"
              title="Student submission"
            />
          ) : (
            <div className="w-full h-full overflow-auto flex items-start justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={submission.fileUrl}
                alt="Student submission"
                className="max-w-full rounded-lg shadow"
              />
            </div>
          )}
          <a
            href={submission.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-gray-700 shadow hover:shadow-md transition-shadow"
          >
            <ExternalLink size={12} strokeWidth={2.5} />
            Open full
          </a>
        </div>

        {/* Grading panel — right */}
        <div className="md:w-80 shrink-0 bg-white border-t md:border-t-0 md:border-l border-gray-100 flex flex-col p-5 gap-5 overflow-y-auto">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Submitted</p>
            <p className="text-[13px] font-semibold text-gray-700">
              {new Date(submission.submittedAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>

          <div>
            <label className="block text-[13px] font-extrabold text-gray-800 mb-2">
              Marks Awarded
              <span className="font-normal text-gray-400 ml-1">/ {submission.maxMarks}</span>
            </label>
            <input
              type="number"
              min={0}
              max={submission.maxMarks}
              step={0.5}
              value={marks || initialMarks}
              onChange={(e) => setMarks(e.target.value)}
              placeholder={`0 – ${submission.maxMarks}`}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-[16px] font-extrabold text-gray-900 text-center focus:outline-none focus:border-orange-300"
            />
          </div>

          <div className="flex-1">
            <label className="block text-[13px] font-extrabold text-gray-800 mb-2">
              Feedback <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={feedback || initialFeedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write feedback for the student…"
              rows={6}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-orange-300 resize-none"
            />
          </div>

          {gradeMutation.isError && (
            <p className="text-red-500 text-[12px]">{gradeMutation.error.message}</p>
          )}

          <button
            onClick={handleSave}
            disabled={gradeMutation.isPending || (!marks && !initialMarks)}
            className="w-full bg-[#111] text-white font-extrabold text-[14px] py-3 rounded-[16px] hover:bg-gray-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {gradeMutation.isPending ? (
              <><Loader2 size={14} className="animate-spin" /> Saving…</>
            ) : saved ? (
              <><CheckCircle size={14} strokeWidth={2.5} /> Grade Saved</>
            ) : (
              "Save Grade"
            )}
          </button>

          {saved && (
            <button
              onClick={() => router.push(`/submissions/${submission.assignmentId}`)}
              className="w-full text-center text-[13px] text-gray-400 hover:text-gray-700 font-semibold transition-colors"
            >
              Back to all submissions
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { useAssignmentStore } from "@/store/assignmentStore"
import { useSocket } from "@/lib/hooks/useSocket"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

export default function LoadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { jobStatus, jobProgress, jobSteps, paperId, setJobStatus, setPaperId, setJobProgress } =
    useAssignmentStore()

  useSocket(id)

  // Polling fallback — if socket misses job:done, poll every 4s
  const { data: assignment } = trpc.assignment.getById.useQuery(
    { id },
    {
      refetchInterval: jobStatus === "done" ? false : 4000,
      enabled: jobStatus !== "done",
    }
  )

  useEffect(() => {
    if (assignment?.status === "done" && assignment.paperId && jobStatus !== "done") {
      setJobProgress(100)
      setJobStatus("done")
      setPaperId(assignment.paperId)
    }
    if (assignment?.status === "failed" && jobStatus !== "failed") {
      setJobStatus("failed")
    }
  }, [assignment, jobStatus, setJobProgress, setJobStatus, setPaperId])

  useEffect(() => {
    if (jobStatus === "done" && paperId) {
      const t = setTimeout(() => router.push(`/paper/${paperId}`), 800)
      return () => clearTimeout(t)
    }
  }, [jobStatus, paperId, router])

  const failed = jobStatus === "failed"

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 w-full max-w-md">
        {failed ? (
          <div className="text-center">
            <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Generation Failed</h2>
            <p className="text-sm text-gray-500 mb-5">Something went wrong. Please try again.</p>
            <button
              onClick={() => router.push("/create")}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Loader2
                size={22}
                className={cn("text-orange-500 shrink-0", jobStatus !== "done" && "animate-spin")}
              />
              <h2 className="text-base font-semibold text-gray-800">
                {jobStatus === "done" ? "Paper ready! Redirecting..." : "Generating your paper..."}
              </h2>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Progress</span>
                <span>{jobProgress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${jobProgress}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-2.5">
              {jobSteps.map((step, i) => {
                const isLast = i === jobSteps.length - 1 && jobStatus !== "done"
                return (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    {isLast ? (
                      <Loader2 size={15} className="text-orange-400 animate-spin shrink-0" />
                    ) : (
                      <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                    )}
                    <span className={cn(isLast ? "text-gray-700 font-medium" : "text-gray-500")}>
                      {step}
                    </span>
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

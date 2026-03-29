"use client"

import { useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2, Sparkles } from "lucide-react"
import { useAssignmentStore, type StreamedQuestion } from "@/store/assignmentStore"
import { useSocket } from "@/lib/hooks/useSocket"
import { trpc } from "@/lib/trpc"

// Group flat question list into sections preserving order
function groupBySections(questions: StreamedQuestion[]) {
  const sections: { id: string; title: string; questionType: string; questions: StreamedQuestion[] }[] = []
  const seen = new Map<string, number>()
  for (const q of questions) {
    if (!seen.has(q.sectionId)) {
      seen.set(q.sectionId, sections.length)
      sections.push({ id: q.sectionId, title: q.sectionTitle, questionType: q.questionType, questions: [] })
    }
    sections[seen.get(q.sectionId)!].questions.push(q)
  }
  return sections
}

export default function LoadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const {
    jobStatus,
    jobProgress,
    jobSteps,
    paperId,
    streamedQuestions,
    currentStreamText,
    totalQuestions,
    setJobStatus,
    setPaperId,
    setJobProgress,
  } = useAssignmentStore()

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
      const t = setTimeout(() => router.push(`/paper/${paperId}`), 600)
      return () => clearTimeout(t)
    }
  }, [jobStatus, paperId, router])

  const failed = jobStatus === "failed"
  const sections = groupBySections(streamedQuestions)
  const isStreaming = streamedQuestions.length > 0
  const isGenerating = jobStatus !== "done" && jobStatus !== "failed"

  if (failed) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 w-full max-w-md text-center">
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
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Top bar — mirrors paper page header style */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white">
        <Sparkles size={16} strokeWidth={2.5} className="text-orange-500" />
        <span className="text-sm font-semibold text-gray-700">Generating Question Paper</span>
        {isGenerating && (
          <Loader2 size={14} className="text-orange-400 animate-spin ml-1" />
        )}
        {isStreaming && totalQuestions > 0 && (
          <span className="ml-auto text-xs text-gray-400">
            {streamedQuestions.length} / {totalQuestions} questions
          </span>
        )}
        {/* Progress bar */}
        <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-2">
          <div
            className={`h-full bg-orange-500 rounded-full transition-all ${
              jobProgress >= 85 && jobProgress < 90 ? "duration-[8000ms]" : "duration-500"
            }`}
            style={{ width: `${jobProgress >= 85 && jobProgress < 90 ? 89 : jobProgress}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-8 text-right">{jobProgress}%</span>
      </div>

      {/* Main — same dark card as paper page */}
      <div className="flex-1 overflow-y-auto px-0 md:px-1 py-0 md:py-4">
        <div className="bg-[#464646] rounded-none md:rounded-[36px] min-h-full flex flex-col shadow-sm mx-0 md:mx-1">

          {/* Banner */}
          <div className="px-5 py-6 md:px-10 md:py-8 md:pb-6 flex flex-col items-start gap-3">
            <p className="text-sidebar-item leading-relaxed text-white">
              {isStreaming
                ? <>Generating your <span className="font-extrabold">Question Paper</span>...</>
                : <>Preparing your <span className="font-extrabold">Question Paper</span>...</>
              }
            </p>
            {/* Step log */}
            <div className="flex flex-col gap-1">
              {jobSteps.map((step, i) => (
                <p key={i} className="text-white/50 text-xs">{step}</p>
              ))}
            </div>
          </div>

          {/* Paper content area — white card, same as final paper */}
          <div className="flex-1 bg-white rounded-t-[32px] md:rounded-[32px] mx-0 md:mx-3 mb-0 md:mb-3 p-5 md:p-12 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] md:shadow-[0_4px_24px_rgba(0,0,0,0.05)] pb-32 md:pb-12">
            <div className="max-w-4xl mx-auto px-1 md:px-4">

              {/* Header — same as paper page */}
              <div className="text-center mb-8 md:mb-10 border-gray-200 pb-2">
                <h1 className="text-[17px] md:text-heading md:text-[25px] font-extrabold text-gray-900 mb-2 tracking-tight">
                  Delhi Public School, Sector-4, Bokaro
                </h1>
              </div>

              {/* Meta */}
              <div className="flex justify-between text-normal text-gray-900 mb-6 font-medium">
                <span>Time Allowed: <span className="font-extrabold">—</span></span>
                <span>Maximum Marks: <span className="font-extrabold">—</span></span>
              </div>

              <p className="text-normal font-bold text-gray-900 mb-8">
                All questions are compulsory unless stated otherwise.
              </p>

              {/* Student info placeholders */}
              <div className="mb-14 space-y-2 text-normal text-gray-900 font-extrabold">
                <div className="flex items-end gap-1">
                  <span className="shrink-0 -mb-px">Name:</span>
                  <span className="inline-block w-48 border-b-[1.5px] border-gray-900 mx-1" />
                </div>
                <div className="flex items-end gap-1">
                  <span className="shrink-0 -mb-px">Roll Number:</span>
                  <span className="inline-block w-48 border-b-[1.5px] border-gray-900 mx-1" />
                </div>
              </div>

              {/* Sections with streamed questions */}
              {!isStreaming ? (
                /* Not yet streaming — show skeleton pulsing placeholders */
                <div className="flex flex-col gap-6 animate-pulse">
                  <div className="h-5 w-32 bg-gray-100 rounded-full mx-auto" />
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-5 h-4 bg-gray-100 rounded shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded-full w-full" />
                        <div className="h-4 bg-gray-100 rounded-full w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                sections.map((section, si) => (
                  <div key={section.id} className={si < sections.length - 1 ? "mb-10" : "mb-4"}>
                    <h2 className="text-center text-heading text-[20px] font-extrabold text-gray-900 mb-6">
                      {section.title}
                    </h2>
                    <p className="text-normal font-extrabold text-gray-900 mb-1">
                      {section.questionType}
                    </p>

                    <ol className="flex flex-col gap-4 text-normal font-medium text-gray-900 mt-6">
                      {section.questions.map((q, qi) => (
                        <li
                          key={q.id}
                          className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pl-2 animate-in fade-in slide-in-from-bottom-1 duration-300"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <span className="shrink-0 w-4 text-right">{qi + 1}.</span>
                            <div className="flex-1">
                              <span className="leading-[1.6]">
                                [{q.difficulty}] {q.text} [{q.marks} Mark{q.marks !== 1 ? "s" : ""}]
                              </span>
                              {/* MCQ options */}
                              {q.options && q.options.length > 0 && (
                                <ol className="mt-2 flex flex-col gap-1 pl-1">
                                  {q.options.map((opt, oi) => (
                                    <li key={oi} className="text-sm text-gray-700">{opt}</li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}

                      {/* Live typing — current question being generated */}
                      {isGenerating && si === sections.length - 1 && (
                        <li className="flex items-start gap-3 pl-2">
                          <span className="shrink-0 w-4 text-right text-gray-400">
                            {section.questions.length + 1}.
                          </span>
                          <div className="flex-1">
                            {currentStreamText ? (
                              <span className="leading-[1.6] text-gray-500">
                                {currentStreamText}
                                <span className="inline-block w-0.5 h-4 bg-orange-400 animate-pulse ml-0.5 align-middle" />
                              </span>
                            ) : (
                              <div className="space-y-2 animate-pulse mt-1">
                                <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                                <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                              </div>
                            )}
                          </div>
                        </li>
                      )}
                    </ol>
                  </div>
                ))
              )}

              {/* Pulsing placeholder before first section appears */}
              {isGenerating && !isStreaming && (
                <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Questions generating...</span>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

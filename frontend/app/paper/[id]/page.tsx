"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Download, Sparkles } from "lucide-react"
import { useAssignmentStore } from "@/store/assignmentStore"
import Header from "@/components/ui/Header"

export default function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { paper, setJobStatus, setJobProgress } = useAssignmentStore()

  const handleRegenerate = () => {
    setJobStatus("queued")
    setJobProgress(0)
    router.push(`/loading/${id}`)
  }

  if (!paper) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400 text-sm">
          <p className="mb-3">No paper found.</p>
          <button
            onClick={() => router.push("/create")}
            className="text-orange-500 hover:underline"
          >
            Create a new assignment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      <Header
        breadcrumb="Create New"
        showBack
        backHref="/create"
        icon={<Sparkles size={16} strokeWidth={2.5} />}
      />

      <div className="flex-1 overflow-y-auto px-1 py-4 relative">
        <div className="bg-[#464646] rounded-[36px] min-h-full flex flex-col shadow-sm mx-1">
          {/* AI Banner Text */}
          <div className="px-10 py-8 pb-6 flex flex-col items-start gap-4">
            <p className="text-sidebar-item leading-relaxed text-white">
              Certainly, Lakshya! Here are customized{" "}
              <span className="font-extrabold">Question Paper</span> for your{" "}
              <span className="font-extrabold">{paper.subject || "CBSE Grade 8 Science"}</span>{" "}
              classes on the <span className="font-extrabold">NCERT</span> chapters:
            </p>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2.5 bg-white text-gray-900 text-normal font-extrabold px-6 py-2.5 rounded-[20px] transition-colors"
            >
              <Download size={16} strokeWidth={2.5} />
              Download as PDF
            </button>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2.5 bg-white/10 text-white text-normal font-extrabold px-6 py-2.5 rounded-[20px] hover:bg-white/20 transition-colors"
            >
              <Sparkles size={16} strokeWidth={2.5} />
              Regenerate
            </button>
          </div>

          {/* Paper Content Wrapper */}
          <div className="flex-1 bg-white rounded-[32px] mx-3 mb-3 p-12 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <div className="max-w-4xl mx-auto px-4 print:px-0">
              {/* Header */}
              <div className="text-center mb-10 border-gray-200 pb-2">
                <h1 className="text-heading text-[25px] font-extrabold text-gray-900 mb-2 tracking-tight">
                  Delhi Public School, Sector-4, Bokaro
                </h1>
                <p className="text-[20px] font-bold text-gray-800 tracking-tight leading-snug">
                  Subject: {paper.subject}
                </p>
                <p className="text-[19px] font-bold text-gray-800 tracking-tight">
                  Class: {paper.className}
                </p>
              </div>

              {/* Meta row */}
              <div className="flex justify-between text-normal text-gray-900 mb-6 font-medium">
                <span>
                  Time Allowed: <span className="font-extrabold text-gray-900">45 minutes</span>
                </span>
                <span>
                  Maximum Marks:{" "}
                  <span className="font-extrabold text-gray-900">{paper.maximumMarks || 20}</span>
                </span>
              </div>

              <p className="text-normal font-bold text-gray-900 mb-8">
                All questions are compulsory unless stated otherwise.
              </p>

              {/* Student Info */}
              <div className="mb-14 space-y-2 text-normal text-gray-900 font-extrabold">
                <div className="flex items-end gap-1">
                  <span className="shrink-0 -mb-px">Name:</span>
                  <span className="inline-block w-48 border-b-[1.5px] border-gray-900 mx-1"></span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="shrink-0 -mb-px">Roll Number:</span>
                  <span className="inline-block w-48 border-b-[1.5px] border-gray-900 mx-1"></span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="shrink-0 -mb-px">Class: {paper.className} Section:</span>
                  <span className="inline-block w-48 border-b-[1.5px] border-gray-900 mx-1"></span>
                </div>
              </div>

              {/* Sections */}
              {paper.sections.map((section) => (
                <div key={section.id} className="mb-10">
                  <h2 className="text-center text-heading text-[20px] font-extrabold text-gray-900 mb-6">
                    {section.title || "Section A"}
                  </h2>
                  <p className="text-normal font-extrabold text-gray-900 mb-1">
                    {section.questionType}
                  </p>
                  <p className="text-normal italic text-gray-600 mb-6">
                    {section.instruction ||
                      "Attempt all questions. Each question carries marks as indicated."}
                  </p>

                  <ol className="flex flex-col gap-4 text-normal font-medium text-gray-900">
                    {section.questions.map((q, qi) => (
                      <li
                        key={q.id}
                        className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 pl-2"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <span className="shrink-0 w-4 text-right">{qi + 1}.</span>
                          <span className="leading-[1.6]">
                            [
                            {q.difficulty
                              ? q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)
                              : "Easy"}
                            ] {q.text} [{q.marks} Marks]
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="text-normal font-extrabold text-gray-900 mt-8">
                    End of Question Paper
                  </p>
                </div>
              ))}

              {/* Answer Key */}
              {paper.answerKey && paper.answerKey.length > 0 && (
                <div className="pt-8">
                  <h2 className="text-[17.5px] font-extrabold text-gray-900 tracking-tight mb-5">
                    Answer Key:
                  </h2>
                  <ol className="flex flex-col gap-4 text-normal text-gray-800 pl-2">
                    {paper.answerKey.map((ak, i) => (
                      <li key={ak.questionId} className="flex items-start gap-3">
                        <span className="shrink-0 w-4 text-right">{i + 1}.</span>
                        <span className="leading-[1.6]">{ak.answer}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

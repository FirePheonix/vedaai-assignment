"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Sparkles, Pencil, Check, X, Plus, Trash2, Send, ChevronDown, Loader2 } from "lucide-react"
import { useAssignmentStore } from "@/store/assignmentStore"
import Header from "@/components/ui/Header"
import { trpc } from "@/lib/trpc"
import { downloadPaperPDF } from "@/lib/buildPaperPdf"

type Difficulty = "Easy" | "Moderate" | "Challenging"

interface Question {
  id: string
  text: string
  difficulty: Difficulty
  marks: number
}

interface Section {
  id: string
  title: string
  questionType: string
  instruction: string
  marksPerQuestion: number
  questions: Question[]
}

function EditableQuestion({
  question,
  index,
  editMode,
  onChange,
  onDelete,
}: {
  question: Question
  index: number
  editMode: boolean
  onChange: (q: Question) => void
  onDelete: () => void
}) {
  if (!editMode) {
    return (
      <li className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 pl-2">
        <div className="flex items-start gap-3 flex-1">
          <span className="shrink-0 w-4 text-right">{index + 1}.</span>
          <span className="leading-[1.6]">
            [{question.difficulty}] {question.text} [{question.marks} Marks]
          </span>
        </div>
      </li>
    )
  }

  return (
    <li className="flex flex-col gap-2 pl-2 bg-orange-50/50 rounded-2xl p-3 border border-orange-100">
      <div className="flex items-start gap-2">
        <span className="shrink-0 w-4 text-right mt-2 text-gray-500">{index + 1}.</span>
        <textarea
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-normal text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
          rows={2}
        />
        <button onClick={onDelete} className="text-gray-300 hover:text-red-400 transition-colors mt-2 shrink-0">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex items-center gap-3 pl-6">
        <select
          value={question.difficulty}
          onChange={(e) => onChange({ ...question, difficulty: e.target.value as Difficulty })}
          className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none"
        >
          <option>Easy</option>
          <option>Moderate</option>
          <option>Challenging</option>
        </select>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500">Marks:</label>
          <input
            type="number"
            min={1}
            value={question.marks}
            onChange={(e) => onChange({ ...question, marks: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-14 bg-white border border-gray-200 rounded-xl px-2 py-1.5 text-xs text-gray-700 focus:outline-none text-center"
          />
        </div>
      </div>
    </li>
  )
}

export default function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { paper: storePaper, setJobStatus, setJobProgress } = useAssignmentStore()

  const { data: fetchedPaper, isLoading, refetch } = trpc.paper.getById.useQuery(
    { id },
    { enabled: !storePaper }
  )

  const paper = storePaper ?? fetchedPaper

  const [editMode, setEditMode] = useState(false)
  const [editedSections, setEditedSections] = useState<Section[]>([])
  const [showPublish, setShowPublish] = useState(false)
  const [publishedClassName, setPublishedClassName] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!paper) return
    setDownloading(true)
    try {
      await downloadPaperPDF(paper)
    } finally {
      setDownloading(false)
    }
  }

  const updateMutation = trpc.paper.update.useMutation({
    onSuccess: () => {
      setEditMode(false)
      refetch()
    },
  })

  const { data: classes = [] } = trpc.class.list.useQuery()
  const { data: assignment } = trpc.assignment.getById.useQuery(
    { id: paper?.assignmentId ?? "" },
    { enabled: !!paper?.assignmentId }
  )

  const publishMutation = trpc.assignment.publish.useMutation({
    onSuccess: (data) => {
      setPublishedClassName(data.className)
      setShowPublish(false)
    },
  })

  const enterEdit = () => {
    if (!paper) return
    setEditedSections(paper.sections.map((s) => ({
      id: s.id,
      title: s.title,
      questionType: s.questionType,
      instruction: s.instruction,
      marksPerQuestion: s.marksPerQuestion,
      questions: s.questions.map((q) => ({
        id: q.id,
        text: q.text,
        difficulty: (q.difficulty ?? "Easy") as Difficulty,
        marks: q.marks,
      })),
    })))
    setEditMode(true)
  }

  const cancelEdit = () => {
    setEditMode(false)
    setEditedSections([])
  }

  const saveEdit = () => {
    if (!paper) return
    updateMutation.mutate({ id: paper.id, sections: editedSections })
  }

  const updateQuestion = (sectionIdx: number, questionIdx: number, q: Question) => {
    setEditedSections((prev) =>
      prev.map((s, si) =>
        si !== sectionIdx
          ? s
          : { ...s, questions: s.questions.map((qq, qi) => (qi === questionIdx ? q : qq)) }
      )
    )
  }

  const deleteQuestion = (sectionIdx: number, questionIdx: number) => {
    setEditedSections((prev) =>
      prev.map((s, si) =>
        si !== sectionIdx ? s : { ...s, questions: s.questions.filter((_, qi) => qi !== questionIdx) }
      )
    )
  }

  const addQuestion = (sectionIdx: number) => {
    setEditedSections((prev) =>
      prev.map((s, si) =>
        si !== sectionIdx
          ? s
          : {
              ...s,
              questions: [
                ...s.questions,
                {
                  id: `q_new_${Date.now()}`,
                  text: "New question",
                  difficulty: "Easy" as Difficulty,
                  marks: s.marksPerQuestion || 1,
                },
              ],
            }
      )
    )
  }

  const handleRegenerate = () => {
    setJobStatus("queued")
    setJobProgress(0)
    router.push(`/loading/${id}`)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400 text-sm">
          <p className="mb-3">No paper found.</p>
          <button onClick={() => router.push("/create")} className="text-orange-500 hover:underline">
            Create a new assignment
          </button>
        </div>
      </div>
    )
  }

  const displaySections = editMode ? editedSections : paper.sections

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      <Header
        breadcrumb="Create New"
        showBack
        backHref="/create"
        icon={<Sparkles size={16} strokeWidth={2.5} />}
      />

      <div className="flex-1 overflow-y-auto px-0 md:px-1 py-0 md:py-4 relative">
        <div className="bg-[#464646] rounded-none md:rounded-[36px] min-h-full flex flex-col shadow-sm mx-0 md:mx-1">
          {/* Banner */}
          <div className="px-5 py-6 md:px-10 md:py-8 md:pb-6 flex flex-col items-start gap-4">
            <p className="text-sidebar-item leading-relaxed text-white">
              Here is your customized{" "}
              <span className="font-extrabold">Question Paper</span> for{" "}
              <span className="font-extrabold">{paper.subject || "your subject"}</span>:
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2.5 bg-white text-gray-900 text-[14px] md:text-normal font-extrabold px-5 md:px-6 py-2.5 rounded-[20px] transition-colors shadow-sm disabled:opacity-60"
              >
                {downloading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    <Download size={16} strokeWidth={2.5} className="hidden md:block" />
                    <Download size={14} strokeWidth={2.5} className="md:hidden block" />
                  </>
                )}
                {downloading ? "Generating…" : <>Download <span className="hidden md:inline">as PDF</span></>}
              </button>
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2.5 bg-white/10 text-white text-[14px] md:text-normal font-extrabold px-5 md:px-6 py-2.5 rounded-[20px] hover:bg-white/20 transition-colors"
              >
                <Sparkles size={16} strokeWidth={2.5} />
                Regenerate
              </button>
              {/* Publish button — only when paper is done and not yet published */}
              {!editMode && assignment?.status === "done" && (
                publishedClassName || assignment?.isPublished ? (
                  <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-[14px] font-extrabold px-5 py-2.5 rounded-[20px]">
                    <Check size={15} strokeWidth={2.5} />
                    Published{publishedClassName ? ` to ${publishedClassName}` : ""}
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowPublish((v) => !v)}
                      className="flex items-center gap-2.5 bg-emerald-500 text-white text-[14px] md:text-normal font-extrabold px-5 md:px-6 py-2.5 rounded-[20px] hover:bg-emerald-600 transition-colors"
                    >
                      <Send size={15} strokeWidth={2.5} />
                      Publish
                      <ChevronDown size={13} strokeWidth={2.5} />
                    </button>
                    {showPublish && (
                      <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-50 z-50">
                        {classes.length === 0 ? (
                          <p className="text-[12px] text-gray-400 px-3 py-2">No classes yet. Create one first.</p>
                        ) : (
                          classes.map((cls) => (
                            <button
                              key={cls.id}
                              disabled={publishMutation.isPending}
                              onClick={() => publishMutation.mutate({ id: paper.assignmentId, classId: cls.id })}
                              className="w-full text-left px-3 py-2 text-[13px] font-semibold text-gray-800 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
                            >
                              {cls.name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )
              )}

              {!editMode ? (
                <button
                  onClick={enterEdit}
                  className="flex items-center gap-2.5 bg-white/10 text-white text-[14px] md:text-normal font-extrabold px-5 md:px-6 py-2.5 rounded-[20px] hover:bg-white/20 transition-colors"
                >
                  <Pencil size={16} strokeWidth={2.5} />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={saveEdit}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2.5 bg-emerald-500 text-white text-[14px] md:text-normal font-extrabold px-5 md:px-6 py-2.5 rounded-[20px] hover:bg-emerald-600 transition-colors disabled:opacity-60"
                  >
                    <Check size={16} strokeWidth={2.5} />
                    {updateMutation.isPending ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-2.5 bg-white/10 text-white text-[14px] md:text-normal font-extrabold px-5 md:px-6 py-2.5 rounded-[20px] hover:bg-white/20 transition-colors"
                  >
                    <X size={16} strokeWidth={2.5} />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Paper Content */}
          <div className="flex-1 bg-white rounded-t-[32px] md:rounded-[32px] mx-0 md:mx-3 mb-0 md:mb-3 p-5 md:p-12 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] md:shadow-[0_4px_24px_rgba(0,0,0,0.05)] pb-32 md:pb-12">
            <div className="max-w-4xl mx-auto px-1 md:px-4 print:px-0">
              {/* Header */}
              <div className="text-center mb-8 md:mb-10 border-gray-200 pb-2">
                <h1 className="text-[17px] md:text-heading md:text-[25px] font-extrabold text-gray-900 mb-2 tracking-tight">
                  Delhi Public School, Sector-4, Bokaro
                </h1>
                <p className="text-[15px] md:text-[20px] font-bold text-gray-800 tracking-tight leading-snug">
                  Subject: {paper.subject}
                </p>
                <p className="text-[14px] md:text-[19px] font-bold text-gray-800 tracking-tight">
                  Class: {paper.className}
                </p>
              </div>

              {/* Meta */}
              <div className="flex justify-between text-normal text-gray-900 mb-6 font-medium">
                <span>Time Allowed: <span className="font-extrabold">{paper.timeAllowed}</span></span>
                <span>Maximum Marks: <span className="font-extrabold">{paper.maximumMarks}</span></span>
              </div>

              <p className="text-normal font-bold text-gray-900 mb-8">
                All questions are compulsory unless stated otherwise.
              </p>

              {/* Student Info */}
              <div className="mb-14 space-y-2 text-normal text-gray-900 font-extrabold">
                <div className="flex items-end gap-1">
                  <span className="shrink-0 -mb-px">Name:</span>
                  <span className="inline-block w-48 border-b-[1.5px] border-gray-900 mx-1" />
                </div>
                <div className="flex items-end gap-1">
                  <span className="shrink-0 -mb-px">Roll Number:</span>
                  <span className="inline-block w-48 border-b-[1.5px] border-gray-900 mx-1" />
                </div>
                <div className="flex items-end gap-1">
                  <span className="shrink-0 -mb-px">Class: {paper.className} Section:</span>
                  <span className="inline-block w-48 border-b-[1.5px] border-gray-900 mx-1" />
                </div>
              </div>

              {/* Sections */}
              {displaySections.map((section, si) => (
                <div key={section.id} className={si < displaySections.length - 1 ? "mb-10" : "mb-4"}>
                  <h2 className="text-center text-heading text-[20px] font-extrabold text-gray-900 mb-6">
                    {section.title}
                  </h2>
                  <p className="text-normal font-extrabold text-gray-900 mb-1">{section.questionType}</p>
                  <p className="text-normal italic text-gray-600 mb-6">{section.instruction}</p>

                  <ol className="flex flex-col gap-4 text-normal font-medium text-gray-900">
                    {section.questions.map((q, qi) => (
                      <EditableQuestion
                        key={q.id}
                        question={q}
                        index={qi}
                        editMode={editMode}
                        onChange={(updated) => updateQuestion(si, qi, updated)}
                        onDelete={() => deleteQuestion(si, qi)}
                      />
                    ))}
                  </ol>

                  {editMode && (
                    <button
                      onClick={() => addQuestion(si)}
                      className="mt-4 flex items-center gap-2 text-orange-500 hover:text-orange-600 font-bold text-normal transition-colors"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      Add Question
                    </button>
                  )}

                  {!editMode && si === displaySections.length - 1 && (
                    <p className="text-normal font-extrabold text-gray-900 mt-8">End of Question Paper</p>
                  )}
                </div>
              ))}

              {/* Answer Key */}
              {!editMode && paper.answerKey && paper.answerKey.length > 0 && (
                <div className="pt-8">
                  <h2 className="text-[17.5px] font-extrabold text-gray-900 tracking-tight mb-5">Answer Key:</h2>
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

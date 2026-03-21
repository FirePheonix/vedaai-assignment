"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Upload, CheckCircle, Loader2, ArrowLeft } from "lucide-react"
import { trpc } from "@/lib/trpc"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export default function StudentPaperPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>
}) {
  const { assignmentId } = use(params)
  const router = useRouter()
  const { getToken } = useAuth()

  const { data: paper, isLoading } = trpc.paper.getByAssignmentId.useQuery({ assignmentId })

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const createSubmission = trpc.submission.create.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => setUploadError(e.message),
  })

  const handleUpload = async () => {
    if (!file || !paper) return
    setUploading(true)
    setUploadError(null)
    try {
      const token = await getToken()
      const form = new FormData()
      form.append("file", file)

      const res = await fetch(`${API_URL}/upload/submission`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Upload failed")
      }

      const { fileUrl, filename, fileType } = await res.json()
      createSubmission.mutate({ assignmentId, fileUrl, filename, fileType })
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Paper not found.
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" strokeWidth={2} />
          </div>
          <h2 className="text-[22px] font-extrabold text-gray-900 mb-1">Submitted!</h2>
          <p className="text-gray-400 text-[14px] mb-6">
            Your answer sheet has been sent to your teacher.
          </p>
          <button
            onClick={() => router.push("/student/home")}
            className="bg-[#111] text-white font-extrabold px-8 py-3 rounded-[18px] hover:bg-gray-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white shrink-0">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <div>
          <p className="text-[13px] font-bold text-gray-900">{paper.subject}</p>
          <p className="text-[11px] text-gray-400">{paper.className}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Paper content */}
        <div className="bg-white mx-0 md:mx-4 md:my-4 md:rounded-[28px] p-5 md:p-10 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 pb-4 border-b border-gray-100">
              <h1 className="text-[18px] font-extrabold text-gray-900 mb-1">{paper.schoolName}</h1>
              <p className="text-[16px] font-bold text-gray-800">Subject: {paper.subject}</p>
              <p className="text-[14px] font-semibold text-gray-700">Class: {paper.className}</p>
            </div>
            <div className="flex justify-between text-[14px] text-gray-700 mb-5 font-medium">
              <span>
                Time: <strong>{paper.timeAllowed}</strong>
              </span>
              <span>
                Max Marks: <strong>{paper.maximumMarks}</strong>
              </span>
            </div>
            <p className="text-[13px] font-bold text-gray-800 mb-6">
              All questions are compulsory unless stated otherwise.
            </p>

            {paper.sections.map((section, si) => (
              <div key={section.id} className="mb-8">
                <h2 className="text-center text-[16px] font-extrabold text-gray-900 mb-3">
                  {section.title}
                </h2>
                <p className="text-[13px] font-bold text-gray-800 mb-1">{section.questionType}</p>
                <p className="text-[13px] italic text-gray-500 mb-4">{section.instruction}</p>
                <ol className="flex flex-col gap-3 text-[14px] text-gray-800">
                  {section.questions.map((q, qi) => (
                    <li key={q.id} className="flex gap-3">
                      <span className="shrink-0 font-semibold text-gray-500 w-5 text-right">
                        {qi + 1}.
                      </span>
                      <span className="leading-relaxed">
                        [{q.difficulty}] {q.text}{" "}
                        <span className="text-gray-400 text-[12px]">[{q.marks} marks]</span>
                      </span>
                    </li>
                  ))}
                </ol>
                {si === paper.sections.length - 1 && (
                  <p className="text-[13px] font-extrabold text-gray-800 mt-6">
                    End of Question Paper
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upload section */}
        <div className="mx-0 md:mx-4 mb-0 md:mb-4 bg-[#2a2a2a] md:rounded-[28px] p-6 md:p-8">
          <h3 className="text-white font-extrabold text-[17px] mb-1">Upload Your Answer Sheet</h3>
          <p className="text-gray-400 text-[13px] mb-5">
            Take a clear photo or scan of your handwritten answers, then upload here.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragActive(false)
              const f = e.dataTransfer.files[0]
              if (f) setFile(f)
            }}
            onClick={() => document.getElementById("submission-file")?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-orange-400 bg-orange-500/10"
                : "border-gray-600 hover:border-gray-500"
            }`}
          >
            <Upload size={24} className="text-gray-500 mx-auto mb-2" strokeWidth={1.5} />
            {file ? (
              <p className="text-white font-semibold text-[14px]">{file.name}</p>
            ) : (
              <>
                <p className="text-gray-400 text-[13px]">Drag & drop or click to choose file</p>
                <p className="text-gray-600 text-[11px] mt-1">
                  PDF or image (JPG, PNG, WEBP) · max 20 MB
                </p>
              </>
            )}
          </div>
          <input
            id="submission-file"
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          {uploadError && <p className="text-red-400 text-[13px] mt-3">{uploadError}</p>}

          <button
            onClick={handleUpload}
            disabled={!file || uploading || createSubmission.isPending}
            className="mt-4 w-full bg-orange-500 text-white font-extrabold text-[15px] py-3.5 rounded-[18px] hover:bg-orange-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {uploading || createSubmission.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Submitting…
              </>
            ) : (
              "Submit Answer Sheet"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

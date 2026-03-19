"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X, Minus, Mic, CalendarDays, UploadCloud } from "lucide-react"
import Header from "@/components/ui/Header"
import { AssignmentFormSchema, type AssignmentFormData } from "@/lib/schemas"
import { useAssignmentStore } from "@/store/assignmentStore"
import { cn } from "@/lib/utils"

const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Answer Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "True/False Questions",
  "Fill in the Blanks",
  "Match the Following",
]

export default function CreateAssignmentPage() {
  const router = useRouter()
  const { setFormData, setJobId, setJobStatus } = useAssignmentStore()
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    control,
    handleSubmit,
setValue,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(AssignmentFormSchema),
    defaultValues: {
      title: "",
      dueDate: "",
      questionTypes: [
        { id: "1", type: "Multiple Choice Questions", count: 4, marks: 1 },
        { id: "2", type: "Short Questions", count: 3, marks: 2 },
        { id: "3", type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
        { id: "4", type: "Numerical Problems", count: 5, marks: 5 },
      ],
      additionalInfo: "",
      file: null,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questionTypes",
  })

  const watchedTypes = useWatch({ control, name: "questionTypes" })
  const watchedFile = useWatch({ control, name: "file" })

  const totalQuestions = watchedTypes?.reduce((s, t) => s + (t.count || 0), 0) ?? 0
  const totalMarks = watchedTypes?.reduce((s, t) => s + (t.count || 0) * (t.marks || 0), 0) ?? 0

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files[0]
      if (file) setValue("file", file)
    },
    [setValue]
  )

  const onSubmit = async (data: AssignmentFormData) => {
    setFormData(data)
    // Simulate job creation — will be replaced with real API call
    const mockJobId = crypto.randomUUID()
    setJobId(mockJobId)
    setJobStatus("queued")
    router.push(`/loading/${mockJobId}`)
  }

  return (
    <>
      <Header breadcrumb="Assignment" showBack backHref="/assignments" />

      <main className="flex-1 overflow-y-auto px-6 py-5">
        {/* Page header */}
        <div className="hidden md:block mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <h1 className="text-heading text-gray-900 mt-1">Create Assignment</h1>
          </div>
          <p className="text-normal text-gray-400 ml-4.5 mt-1.5">
            Set up a new assignment for your students
          </p>
        </div>

        {/* Mobile Page Header equivalent */}
        <div className="md:hidden flex flex-col items-center justify-center relative mb-6">
          <div className="flex items-center w-full justify-center relative mb-5">
            <button type="button" onClick={() => router.back()} className="absolute left-0 w-10 h-10 bg-gray-200/50 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <h1 className="text-heading text-[16px] text-gray-900 font-extrabold tracking-tight">Create Assignment</h1>
          </div>
          <div className="w-full flex justify-center mt-2 px-2">
            <div className="w-full flex mx-auto gap-2">
              <div className="h-1 lg:h-1.5 w-1/2 rounded-full bg-[#5f5f5f]" />
              <div className="h-1 lg:h-1.5 w-1/2 rounded-full bg-gray-200/50" />
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="hidden md:block mb-8 ml-4">
          <div className="w-[850px] flex mx-auto justify-center">
            <div className="h-1 w-1/2 rounded-full bg-[#1c1c1c]" />
            <div className="h-1 w-1/2 rounded-full bg-gray-200" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full md:w-[850px] mx-auto pb-32">
          {/* Assignment Details card */}
          <div className="bg-[#eaecee] md:bg-[#f2f4f6] rounded-[32px] p-6 lg:p-10 mb-4 shadow-sm md:shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-white/50 md:border-transparent">
            <h2 className="text-[18px] md:text-[20px] font-extrabold text-gray-900 mb-1 tracking-tight">
              Assignment Details
            </h2>
            <p className="text-[12px] md:text-normal text-gray-400 md:text-gray-400 mb-6 lg:mb-8 font-medium">
              Basic information about your assignment
            </p>

            {/* File upload */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center cursor-pointer transition-colors mb-2 bg-white",
                dragActive
                  ? "border-orange-400 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <UploadCloud size={32} className="text-[#1c1c1c] mb-3" strokeWidth={1.5} />
              {watchedFile ? (
                <div className="flex items-center gap-2 text-normal text-gray-700">
                  <span className="font-medium">{(watchedFile as File).name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setValue("file", null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-normal text-gray-900 font-extrabold mb-1">
                    Choose a file or drag & drop it here
                  </p>
                  <p className="text-normal text-gray-400">JPEG, PNG, upto 10MB</p>
                  <button
                    type="button"
                    className="mt-6 px-6 py-2 bg-[#f4f5f7] rounded-full text-normal font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Browse Files
                  </button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setValue("file", file)
                }}
              />
            </div>
            <p className="text-normal text-gray-500 text-center mb-10">
              Upload images of your preferred document/image
            </p>

            {/* Due Date (Mocked to match image design) */}
            <div className="mb-8">
              <label className="block text-normal font-extrabold text-gray-900 mb-3">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register("dueDate")}
                  className={cn(
                    "w-full bg-transparent md:bg-white border border-gray-300 md:border-gray-100/50 rounded-2xl px-5 py-3.5 text-normal text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 shadow-sm appearance-none",
                    errors.dueDate && "border-red-400"
                  )}
                />
                <CalendarDays
                  size={18}
                  strokeWidth={2}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none"
                />
              </div>
              {errors.dueDate && (
                <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>
              )}
            </div>

            {/* Question Types */}
            <div>
              <label className="block text-normal font-extrabold text-gray-900 mb-3 md:hidden">Question Type</label>
              <div className="hidden md:grid grid-cols-[1fr_auto_auto] gap-x-12 mb-4 text-normal font-extrabold text-gray-900 px-1">
                <span>Question Type</span>
                <span className="text-center w-36">No. of Questions</span>
                <span className="text-center w-28">Marks</span>
              </div>

              <div className="flex flex-col gap-4 md:gap-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-y-2 md:gap-y-0 md:gap-x-12 items-center bg-white md:bg-transparent p-4 md:p-0 rounded-[24px] md:rounded-none relative"
                  >
                    {/* Header line on mobile = Type + Close icon */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="flex-1 relative">
                        <Controller
                          control={control}
                          name={`questionTypes.${index}.type`}
                          render={({ field: f }) => (
                            <select
                              {...f}
                              className="w-full bg-transparent md:bg-white border md:border-gray-100/50 border-transparent rounded-full md:px-6 md:py-3.5 text-[13px] md:text-normal font-bold md:font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 shadow-none md:shadow-sm appearance-none"
                            >
                              {QUESTION_TYPE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        <div className="absolute right-2 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none hidden md:block">
                          <svg
                            width="12"
                            height="8"
                            viewBox="0 0 12 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.5 1.5L6 6L10.5 1.5"
                              stroke="#171717"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none md:hidden block">
                          <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.5 1.5L6 6L10.5 1.5" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="text-gray-800 hover:text-red-500 disabled:opacity-30 shrink-0 mx-2 absolute top-4 right-2 md:static"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Mobile Stepper Wrapper */}
                    <div className="flex flex-row md:contents bg-[#eeeff1] md:bg-transparent rounded-[24px] p-2 mt-2 md:mt-0 gap-2 items-center justify-between w-full">
                      {/* Count stepper */}
                      <div className="flex flex-col md:block items-center justify-center w-full md:w-auto">
                        <span className="text-[11px] font-extrabold text-gray-800 md:hidden mb-2 pt-1">No. of Questions</span>
                        <Controller
                          control={control}
                          name={`questionTypes.${index}.count`}
                          render={({ field: f }) => (
                            <div className="flex items-center gap-1 md:gap-2 bg-white border border-transparent md:border-gray-100/50 rounded-full px-1.5 md:px-2 py-1 w-full md:w-36 justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] md:shadow-sm">
                              <button
                                type="button"
                                onClick={() => f.onChange(Math.max(1, f.value - 1))}
                                className="text-gray-300 hover:text-gray-800 w-8 h-8 flex items-center justify-center"
                              >
                                <Minus size={16} strokeWidth={2.5} />
                              </button>
                              <span className="text-normal font-extrabold text-gray-900 w-6 text-center">
                                {f.value}
                              </span>
                              <button
                                type="button"
                                onClick={() => f.onChange(Math.min(50, f.value + 1))}
                                className="text-gray-300 hover:text-gray-800 w-8 h-8 flex items-center justify-center"
                              >
                                <Plus size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          )}
                        />
                      </div>

                      {/* Marks stepper */}
                      <div className="flex flex-col md:block items-center justify-center w-full md:w-auto">
                        <span className="text-[11px] font-extrabold text-gray-800 md:hidden mb-2 pt-1">Marks</span>
                        <Controller
                          control={control}
                          name={`questionTypes.${index}.marks`}
                          render={({ field: f }) => (
                            <div className="flex items-center gap-1 md:gap-2 bg-white border border-transparent md:border-gray-100/50 rounded-full px-1.5 md:px-2 py-1 w-full md:w-28 justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] md:shadow-sm">
                              <button
                                type="button"
                                onClick={() => f.onChange(Math.max(1, f.value - 1))}
                                className="text-gray-300 hover:text-gray-800 w-8 h-8 flex items-center justify-center"
                              >
                                <Minus size={16} strokeWidth={2.5} />
                              </button>
                              <span className="text-normal font-extrabold text-gray-900 w-4 text-center">
                                {f.value}
                              </span>
                              <button
                                type="button"
                                onClick={() => f.onChange(f.value + 1)}
                                className="text-gray-300 hover:text-gray-800 w-8 h-8 flex items-center justify-center"
                              >
                                <Plus size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {errors.questionTypes && (
                <p className="text-red-500 text-xs mt-1">
                  {typeof errors.questionTypes.message === "string"
                    ? errors.questionTypes.message
                    : "Fix question type errors"}
                </p>
              )}

              {/* Add row */}
              <button
                type="button"
                onClick={() =>
                  append({
                    id: crypto.randomUUID(),
                    type: QUESTION_TYPE_OPTIONS[0],
                    count: 3,
                    marks: 2,
                  })
                }
                className="flex items-center gap-3 mt-6 text-normal text-gray-900 font-extrabold hover:text-gray-600 transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-[#1c1c1c] flex items-center justify-center shrink-0">
                  <Plus size={18} strokeWidth={2.5} className="text-white" />
                </span>
                Add Question Type
              </button>

              {/* Totals */}
              <div className="mt-8 text-right text-normal text-gray-900">
                <p className="mb-2">
                  Total Questions : <span className="font-extrabold">{totalQuestions}</span>
                </p>
                <p>
                  Total Marks : <span className="font-extrabold">{totalMarks}</span>
                </p>
              </div>
            </div>

            {/* Additional info */}
            <div className="mt-10">
              <label className="block text-normal font-extrabold text-gray-900 mb-3">
                Additional Information{" "}
                <span className="font-medium text-gray-500">(For better output)</span>
              </label>
              <div className="relative">
                <textarea
                  {...register("additionalInfo")}
                  rows={4}
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  className="w-full bg-[#f4f5f7] border-2 border-dashed border-gray-200 rounded-[20px] px-6 py-5 text-normal focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none text-gray-700 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  className="absolute right-5 bottom-5 text-gray-500 hover:text-gray-800 bg-white shadow-sm border border-gray-100 p-2 rounded-full"
                >
                  <Mic size={18} strokeWidth={2} />
                </button>
              </div>
              {errors.additionalInfo && (
                <p className="text-red-500 text-xs mt-1">{errors.additionalInfo.message}</p>
              )}
            </div>
          </div>

          {/* Navigation Overlay Container */}
          <div className="fixed bottom-0 left-0 md:left-[260px] right-0 h-40 bg-gradient-to-t from-[#f5f6f8] via-[#f5f6f8]/90 to-transparent pointer-events-none z-20"></div>

          {/* Navigation floating logic */}
          <div className="fixed bottom-28 md:bottom-8 left-1/2 md:left-[calc(40%+130px)] -translate-x-1/2 flex items-center justify-center md:justify-between w-full md:w-[850px] z-30 px-6 max-w-[400px] md:max-w-none gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 w-full md:w-auto md:px-8 py-3.5 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-full text-normal font-extrabold text-gray-700 hover:bg-gray-50 transition-colors pointer-events-auto"
            >
              ← Previous
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full md:w-auto md:px-10 py-3.5 bg-[#1c1c1c] shadow-[0_8px_24px_rgba(0,0,0,0.15)] text-white rounded-full text-normal font-extrabold hover:bg-black transition-colors disabled:opacity-60 pointer-events-auto"
            >
              {isSubmitting ? "Generating..." : "Next →"}
            </button>
          </div>
        </form>
      </main>
    </>
  )
}

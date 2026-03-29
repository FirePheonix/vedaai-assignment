import { create } from "zustand"
import type { AssignmentFormData, QuestionPaper } from "@/lib/schemas"

type JobStatus = "idle" | "queued" | "processing" | "done" | "failed"

export interface StreamedQuestion {
  id: string
  text: string
  difficulty: "Easy" | "Moderate" | "Challenging"
  marks: number
  options?: string[]
  sectionId: string
  sectionTitle: string
  questionType: string
}

interface AssignmentStore {
  formData: AssignmentFormData | null
  assignmentId: string | null
  jobId: string | null
  jobStatus: JobStatus
  jobProgress: number
  jobSteps: string[]
  paperId: string | null
  paper: QuestionPaper | null
  errorMessage: string | null

  // Streaming state
  streamedQuestions: StreamedQuestion[]
  totalQuestions: number
  currentStreamText: string

  setFormData: (data: AssignmentFormData) => void
  setAssignmentId: (id: string) => void
  setJobId: (id: string) => void
  setJobStatus: (status: JobStatus) => void
  setJobProgress: (progress: number) => void
  addJobStep: (step: string) => void
  setPaperId: (id: string) => void
  setPaper: (paper: QuestionPaper) => void
  setError: (msg: string) => void
  reset: () => void

  setTotalQuestions: (n: number) => void
  setCurrentStreamText: (text: string) => void
  addStreamedQuestion: (q: StreamedQuestion) => void
}

const initialState = {
  formData: null,
  assignmentId: null,
  jobId: null,
  jobStatus: "idle" as JobStatus,
  jobProgress: 0,
  jobSteps: [],
  paperId: null,
  paper: null,
  errorMessage: null,
  streamedQuestions: [],
  totalQuestions: 0,
  currentStreamText: "",
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  ...initialState,

  setFormData: (data) => set({ formData: data }),
  setAssignmentId: (id) => set({ assignmentId: id }),
  setJobId: (id) => set({ jobId: id }),
  setJobStatus: (status) => set({ jobStatus: status }),
  setJobProgress: (progress) => set({ jobProgress: progress }),
  addJobStep: (step) => set((state) => ({ jobSteps: [...state.jobSteps, step] })),
  setPaperId: (id) => set({ paperId: id }),
  setPaper: (paper) => set({ paper }),
  setError: (msg) => set({ errorMessage: msg }),
  reset: () => set(initialState),

  setTotalQuestions: (n) => set({ totalQuestions: n }),
  setCurrentStreamText: (text) => set({ currentStreamText: text }),
  addStreamedQuestion: (q) =>
    set((state) => ({
      streamedQuestions: [...state.streamedQuestions, q],
      currentStreamText: "",
      jobProgress: Math.min(
        85,
        Math.round(((state.streamedQuestions.length + 1) / Math.max(state.totalQuestions, 1)) * 85)
      ),
    })),
}))

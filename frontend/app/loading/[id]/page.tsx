"use client"

import { useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { useAssignmentStore } from "@/store/assignmentStore"
import { useSocket } from "@/lib/hooks/useSocket"
import { cn } from "@/lib/utils"

// frontend only mocked simulation of job progress, will be replaced by real Socket.IO later
function useJobSimulation(jobId: string) {
  const { setJobProgress, addJobStep, setJobStatus, setPaper } = useAssignmentStore()

  // Zustand actions are stable references — safe to include in deps
  useEffect(() => {
    const steps = [
      { msg: "Structuring your prompt...", pct: 15 },
      { msg: "Sending to AI model...", pct: 30 },
      { msg: "Generating Section A...", pct: 50 },
      { msg: "Generating Section B...", pct: 70 },
      { msg: "Validating output schema...", pct: 85 },
      { msg: "Saving to database...", pct: 95 },
    ]

    setJobStatus("processing")
    let i = 0

    const interval = setInterval(() => {
      if (i < steps.length) {
        setJobProgress(steps[i].pct)
        addJobStep(steps[i].msg)
        i++
      } else {
        clearInterval(interval)
        setJobProgress(100)
        setJobStatus("done")

        // Mock paper data
        setPaper({
          id: jobId,
          schoolName: "Delhi Public School, Sector-4, Bokaro",
          subject: "Science",
          className: "Class: 8th",
          timeAllowed: "45 minutes",
          maximumMarks: 20,
          totalQuestions: 10,
          createdAt: new Date().toISOString(),
          sections: [
            {
              id: "a",
              title: "Section A",
              questionType: "Short Answer Questions",
              instruction: "Attempt all questions. Each question carries 2 marks",
              marksPerQuestion: 2,
              questions: [
                {
                  id: "q1",
                  text: "Define electroplating. Explain its purpose.",
                  difficulty: "Easy",
                  marks: 2,
                },
                {
                  id: "q2",
                  text: "What is the role of a conductor in the process of electrolysis?",
                  difficulty: "Moderate",
                  marks: 2,
                },
                {
                  id: "q3",
                  text: "Why does a solution of copper sulfate conduct electricity?",
                  difficulty: "Easy",
                  marks: 2,
                },
                {
                  id: "q4",
                  text: "Describe one example of the chemical effect of electric current in daily life.",
                  difficulty: "Moderate",
                  marks: 2,
                },
                {
                  id: "q5",
                  text: "Explain why electric current is said to have chemical effects.",
                  difficulty: "Moderate",
                  marks: 2,
                },
              ],
            },
            {
              id: "b",
              title: "Section B",
              questionType: "Long Answer Questions",
              instruction: "Attempt any 3 questions. Each question carries 5 marks",
              marksPerQuestion: 5,
              questions: [
                {
                  id: "q6",
                  text: "How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved.",
                  difficulty: "Challenging",
                  marks: 5,
                },
                {
                  id: "q7",
                  text: "What happens at the cathode and anode during the electrolysis of water? Name the gases evolved.",
                  difficulty: "Challenging",
                  marks: 5,
                },
                {
                  id: "q8",
                  text: "Explain how copper is deposited during the electroplating of an object.",
                  difficulty: "Easy",
                  marks: 5,
                },
              ],
            },
          ],
          answerKey: [
            {
              questionId: "q1",
              answer:
                "Electroplating is the process of coating a metal object with a thin layer of another metal using electrolysis.",
            },
            {
              questionId: "q2",
              answer:
                "A conductor allows the flow of electric current by providing free electrons or ions.",
            },
          ],
        })
      }
    }, 900)

    return () => clearInterval(interval)
  }, [jobId, setJobProgress, addJobStep, setJobStatus, setPaper])
}

export default function LoadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { jobStatus, jobProgress, jobSteps } = useAssignmentStore()

  useJobSimulation(id)
  useSocket(id) // will connect to backend Socket.IO in real implementation

  useEffect(() => {
    if (jobStatus === "done") {
      const t = setTimeout(() => router.push(`/paper/${id}`), 800)
      return () => clearTimeout(t)
    }
  }, [jobStatus, id, router])

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

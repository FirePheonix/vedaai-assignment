"use client"

import { BarChart2, CheckCircle, Clock } from "lucide-react"
import { trpc } from "@/lib/trpc"

function ScoreBar({ label, score, marks, maxMarks, gradedAt }: {
  label: string
  score: number
  marks: number
  maxMarks: number
  gradedAt: string
}) {
  const color = score >= 80 ? "#4ebf7b" : score >= 60 ? "#f5c842" : score >= 40 ? "#fe8c2b" : "#e02424"
  return (
    <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-white text-[15px]"
        style={{ backgroundColor: color }}
      >
        {score}%
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-[13px] truncate">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
          </div>
          <span className="text-[11px] font-bold text-gray-500 shrink-0">{marks}/{maxMarks}</span>
        </div>
      </div>
      <p className="text-[11px] text-gray-400 shrink-0">
        {new Date(gradedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
      </p>
    </div>
  )
}

export default function StudentAnalyticsPage() {
  const { data: stats, isLoading } = trpc.submission.getStudentAnalytics.useQuery()

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats || stats.gradedCount === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 text-center px-8">
        <BarChart2 size={48} className="text-gray-200" strokeWidth={1.5} />
        <p className="text-gray-400 font-medium">No graded results yet.</p>
        <p className="text-gray-300 text-[13px]">
          Submit your assignments and wait for your teacher to grade them.
        </p>
      </div>
    )
  }

  const grade = stats.avgScore >= 80 ? "A" : stats.avgScore >= 60 ? "B" : stats.avgScore >= 40 ? "C" : stats.avgScore >= 20 ? "D" : "F"
  const gradeColor = stats.avgScore >= 80 ? "#4ebf7b" : stats.avgScore >= 60 ? "#f5c842" : stats.avgScore >= 40 ? "#fe8c2b" : "#e02424"

  const arcLen = 141.37
  const gaugeFraction = stats.avgScore / 100

  return (
    <div className="flex flex-col h-full bg-[#f2f4f7] md:bg-transparent overflow-hidden px-4 md:px-0 py-4 md:pr-4 pb-24 md:pb-4 gap-4">
      <div className="flex-1 overflow-y-auto w-full h-[calc(100vh-2rem)]">
        <div className="w-full flex flex-col xl:flex-row gap-5">

          {/* Left */}
          <div className="flex flex-col flex-1 gap-5">

            {/* Performance overview */}
            <div className="bg-[#dee1e5] rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.06)] border border-white/40">
              <h2 className="text-center text-[17px] font-extrabold text-gray-900 mb-6">Your Performance Overview</h2>

              <div className="flex flex-col lg:flex-row gap-4">
                {/* Gauge */}
                <div className="bg-[#2a2a2a] rounded-[24px] p-6 lg:w-[38%] flex flex-col items-center justify-between text-white shadow-[0_12px_40px_rgba(0,0,0,0.2)] shrink-0 min-h-[260px]">
                  <h3 className="text-[13px] font-semibold text-gray-300 self-start">Average Score</h3>
                  <div className="relative w-full max-w-[180px] aspect-[2/1] flex flex-col items-center justify-end my-4">
                    <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 50">
                      <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="#3a3a3a" strokeWidth="18" strokeLinecap="round" />
                      <path
                        d="M 5 50 A 45 45 0 0 1 95 50"
                        fill="none"
                        strokeWidth="18"
                        strokeLinecap="round"
                        strokeDasharray={arcLen}
                        strokeDashoffset={arcLen * (1 - gaugeFraction)}
                        style={{ stroke: gradeColor }}
                      />
                    </svg>
                    <div className="absolute w-full bottom-0 flex flex-col items-center justify-end translate-y-2">
                      <div className="text-[40px] font-extrabold leading-none tracking-tight" style={{ color: gradeColor }}>
                        {stats.avgScore}%
                      </div>
                      <div className="text-[12px] font-bold text-gray-400 mt-1">Grade {grade}</div>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full justify-center text-[12px] font-medium mt-2">
                    <div className="text-center">
                      <div className="text-white font-extrabold text-[20px]">{stats.gradedCount}</div>
                      <div className="text-gray-400">Graded</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-extrabold text-[20px]">{stats.totalSubmissions}</div>
                      <div className="text-gray-400">Submitted</div>
                    </div>
                    <div className="text-center">
                      <div className="font-extrabold text-[20px]" style={{ color: gradeColor }}>{stats.topScore}%</div>
                      <div className="text-gray-400">Best</div>
                    </div>
                  </div>
                </div>

                {/* Score tiles */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {[
                    { label: "Average Score", value: `${stats.avgScore}%`, color: gradeColor },
                    { label: "Best Score", value: `${stats.topScore}%`, color: "#4ebf7b" },
                    { label: "Papers Submitted", value: stats.totalSubmissions, color: "#111" },
                    { label: "Results Received", value: stats.gradedCount, color: "#fe5b2b" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-[20px] p-5 flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="text-[32px] font-extrabold leading-tight mb-1" style={{ color }}>{value}</span>
                      <span className="text-[12px] font-semibold text-gray-500">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Score history list */}
            <div className="bg-white rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.04)] border border-gray-50/50">
              <h2 className="text-[17px] font-extrabold text-gray-900 mb-5">Score History</h2>
              {stats.history.length === 0 ? (
                <p className="text-gray-400 text-[13px]">No graded results yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {stats.history.map((item) => (
                    <ScoreBar
                      key={item.id}
                      label={`${item.assignmentTitle} · ${item.subject}`}
                      score={item.score}
                      marks={item.marks}
                      maxMarks={item.maxMarks}
                      gradedAt={item.gradedAt}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="xl:w-[340px] shrink-0 flex flex-col gap-5">

            {/* Quick stats */}
            <div className="bg-white rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.04)] border border-gray-50/50">
              <h2 className="text-[17px] font-extrabold text-gray-900 mb-5">Quick Stats</h2>
              <div className="flex flex-col gap-4">
                {[
                  { icon: CheckCircle, label: "Assignments Graded", value: stats.gradedCount, color: "#4ebf7b" },
                  { icon: BarChart2, label: "Average Score", value: `${stats.avgScore}%`, color: gradeColor },
                  { icon: Clock, label: "Pending Results", value: stats.totalSubmissions - stats.gradedCount, color: "#fe5b2b" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
                      <Icon size={16} strokeWidth={2.5} style={{ color }} />
                    </div>
                    <span className="flex-1 text-[13px] font-semibold text-gray-700">{label}</span>
                    <span className="text-[15px] font-extrabold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher feedback */}
            {stats.history.some((h) => h.feedback) && (
              <div className="bg-[#dee1e5] rounded-[32px] p-6 flex-1 shadow-[0_12px_44px_rgba(0,0,0,0.06)] border border-white/40">
                <h2 className="text-[17px] font-extrabold text-gray-900 mb-4">Teacher Feedback</h2>
                <div className="flex flex-col gap-3">
                  {stats.history
                    .filter((h) => h.feedback)
                    .slice(0, 4)
                    .map((h) => (
                      <div key={h.id} className="bg-white rounded-[16px] p-3.5 shadow-sm">
                        <p className="text-[11px] font-bold text-gray-400 mb-1">{h.assignmentTitle}</p>
                        <p className="text-[12px] text-gray-600 leading-relaxed line-clamp-3">{h.feedback}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

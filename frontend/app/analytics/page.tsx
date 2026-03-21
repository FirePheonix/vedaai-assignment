"use client"

import { BarChart2 } from "lucide-react"
import { trpc } from "@/lib/trpc"

function ScoreTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-[20px] p-5 flex flex-col items-center justify-center shadow-sm">
      <span
        className="text-[32px] font-extrabold leading-tight tracking-tight mb-1"
        style={{ color }}
      >
        {value}
      </span>
      <span className="text-[12px] font-semibold text-gray-500 text-center">{label}</span>
    </div>
  )
}

const GRADE_COLORS: Record<string, string> = {
  A: "#4ebf7b",
  B: "#f5c842",
  C: "#fe8c2b",
  D: "#fe5b2b",
  belowD: "#e02424",
}
const GRADE_LABELS: Record<string, string> = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  belowD: "Below\nD",
}

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = trpc.submission.getTeacherAnalytics.useQuery()
  const { data: assignments = [], isLoading: assignmentsLoading } = trpc.assignment.list.useQuery()

  const isLoading = statsLoading || assignmentsLoading

  const papersGenerated = assignments.filter((a) => a.status === "done").length
  const timeSaved = Math.round(((papersGenerated * 15) / 60) * 10) / 10

  const gaugeFraction =
    stats && stats.totalSubmissions > 0 ? stats.gradedCount / stats.totalSubmissions : 0
  const arcLen = 141.37

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  const hasData = stats && stats.totalSubmissions > 0

  if (!hasData) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 text-center px-8">
        <BarChart2 size={48} className="text-gray-200" strokeWidth={1.5} />
        <p className="text-gray-400 font-medium">
          No submission data yet. Publish an assignment and grade some submissions to see analytics.
        </p>
      </div>
    )
  }

  const buckets = [
    { key: "A", count: stats.gradeBuckets.A, range: "≥ 80%" },
    { key: "B", count: stats.gradeBuckets.B, range: "60–79%" },
    { key: "C", count: stats.gradeBuckets.C, range: "40–59%" },
    { key: "D", count: stats.gradeBuckets.D, range: "20–39%" },
    { key: "belowD", count: stats.gradeBuckets.belowD, range: "< 20%" },
  ]

  return (
    <div className="flex flex-col h-full bg-[#f2f4f7] md:bg-transparent overflow-hidden px-4 md:px-0 py-4 md:pr-4 pb-24 md:pb-4 gap-4">
      <div className="flex-1 overflow-y-auto w-full relative h-[calc(100vh-2rem)]">
        <div className="w-full flex flex-col xl:flex-row gap-5">
          {/* ── Left Column ── */}
          <div className="flex flex-col flex-1 gap-5">
            {/* Class Performance Summary */}
            <div className="bg-[#dee1e5] rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.06)] border border-white/40">
              <h2 className="text-center text-[17px] font-extrabold text-gray-900 mb-6">
                Overall Class Performance Summary
              </h2>

              <div className="flex flex-col lg:flex-row gap-4">
                {/* Gauge */}
                <div className="bg-[#2a2a2a] rounded-[24px] p-6 lg:w-[38%] flex flex-col items-center justify-between text-white shadow-[0_12px_40px_rgba(0,0,0,0.2)] shrink-0 min-h-[280px]">
                  <h3 className="text-[13px] font-semibold text-gray-300 self-start">
                    Submissions
                  </h3>
                  <div className="relative w-full max-w-[180px] aspect-[2/1] flex flex-col items-center justify-end my-4">
                    <svg
                      className="absolute inset-0 w-full h-full overflow-visible"
                      viewBox="0 0 100 50"
                    >
                      <path
                        d="M 5 50 A 45 45 0 0 1 95 50"
                        fill="none"
                        stroke="#3a3a3a"
                        strokeWidth="18"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 5 50 A 45 45 0 0 1 95 50"
                        fill="none"
                        stroke="#ff5a22"
                        strokeWidth="18"
                        strokeLinecap="round"
                        strokeDasharray={arcLen}
                        strokeDashoffset={arcLen * (1 - gaugeFraction)}
                      />
                    </svg>
                    <div className="absolute w-full bottom-0 flex flex-col items-center justify-end translate-y-2">
                      <div className="text-[36px] font-extrabold leading-none tracking-tight">
                        {stats.gradedCount}
                        <span className="text-[15px] font-medium text-gray-400">
                          /{stats.totalSubmissions}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-gray-400 mt-0.5">
                        Graded / Total
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full px-2 text-[12px] font-medium mt-auto">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-sm bg-[#ff5a22]" />
                      <span className="text-gray-100">Graded</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-sm bg-[#3a3a3a]" />
                      <span className="text-gray-400">Submitted</span>
                    </div>
                  </div>
                </div>

                {/* Score tiles */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <ScoreTile label="Average Score" value={`${stats.avgScore}%`} color="#4ebf7b" />
                  <ScoreTile label="Top Score" value={`${stats.topScore}%`} color="#fe5b2b" />
                  <ScoreTile label="Class Median" value={`${stats.medianScore}%`} color="#111" />
                  <ScoreTile label="Lowest Score" value={`${stats.lowestScore}%`} color="#a0a5b1" />
                </div>
              </div>
            </div>

            {/* Student Segmentation */}
            <div className="bg-[#fe5b2b] rounded-[32px] p-6 shadow-[0_12px_44px_rgba(254,91,43,0.2)]">
              <h2 className="text-[17px] font-extrabold text-white mb-5">
                Student Segmentation{" "}
                <span className="text-white/70 font-medium text-[13px]">(Based on grades)</span>
              </h2>
              <div className="flex items-end gap-3 justify-between">
                {buckets.map(({ key, count }) => (
                  <div key={key} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className="w-full rounded-[16px] flex flex-col items-center justify-center py-5 gap-1"
                      style={{ backgroundColor: GRADE_COLORS[key] }}
                    >
                      <span className="text-white text-[22px] font-extrabold leading-none whitespace-pre-line text-center">
                        {GRADE_LABELS[key]}
                      </span>
                    </div>
                    <span className="text-white font-extrabold text-[15px]">{count}</span>
                    <span className="text-white/60 text-[11px] font-medium">Students</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI usage */}
            <div className="bg-white rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.04)] border border-gray-50/50">
              <h2 className="text-[17px] font-extrabold text-gray-900 mb-5">AI Time Savings</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Papers Generated", value: papersGenerated, color: "#fe5b2b" },
                  { label: "Assignments Graded", value: stats.gradedCount, color: "#4ebf7b" },
                  {
                    label: "Est. Time Saved",
                    value: timeSaved > 0 ? `${timeSaved}h` : "—",
                    color: "#111",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <div
                      className="text-[32px] font-extrabold leading-tight mb-1"
                      style={{ color }}
                    >
                      {value}
                    </div>
                    <div className="text-[12px] font-semibold text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="xl:w-[360px] shrink-0 flex flex-col gap-5">
            {/* Learning Gaps Analysis */}
            <div className="bg-white rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.04)] border border-gray-50/50">
              <h2 className="text-[17px] font-extrabold text-gray-900 mb-1">
                Learning Gaps Analysis
              </h2>
              <p className="text-[12px] text-gray-400 mb-5">Based on grade distribution</p>

              {/* Score bands as "problem areas" */}
              <div className="mb-6">
                <p className="text-[13px] font-bold text-gray-700 mb-3">Grade band breakdown</p>
                <div className="flex flex-col gap-3">
                  {buckets.map(({ key, count, range }) => {
                    const total = Object.values(stats.gradeBuckets).reduce((a, b) => a + b, 0)
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span
                          className="text-[12px] font-bold w-14 text-right shrink-0"
                          style={{ color: GRADE_COLORS[key] }}
                        >
                          {GRADE_LABELS[key].replace("\n", " ")}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: GRADE_COLORS[key] }}
                          />
                        </div>
                        <span className="text-[12px] font-bold text-gray-500 w-8 text-right shrink-0">
                          {pct}%
                        </span>
                        <span className="text-[11px] text-gray-400 w-14 shrink-0">{range}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recommended actions based on data */}
              <div>
                <p className="text-[13px] font-bold text-gray-700 mb-3">Recommended Actions</p>
                <div className="flex flex-col gap-3">
                  {stats.gradeBuckets.belowD > 0 && (
                    <div className="flex gap-2.5 text-[12px] text-gray-600">
                      <span className="font-bold text-red-500 shrink-0">1.</span>
                      <span>
                        {stats.gradeBuckets.belowD} student
                        {stats.gradeBuckets.belowD > 1 ? "s" : ""} scored below 20% — consider
                        remedial sessions.
                      </span>
                    </div>
                  )}
                  {stats.gradeBuckets.D > 0 && (
                    <div className="flex gap-2.5 text-[12px] text-gray-600">
                      <span className="font-bold text-orange-500 shrink-0">
                        {stats.gradeBuckets.belowD > 0 ? "2." : "1."}
                      </span>
                      <span>
                        {stats.gradeBuckets.D} student{stats.gradeBuckets.D > 1 ? "s" : ""} in D
                        band — revisit core concepts with real-life examples.
                      </span>
                    </div>
                  )}
                  {stats.avgScore < 60 && (
                    <div className="flex gap-2.5 text-[12px] text-gray-600">
                      <span className="font-bold text-yellow-600 shrink-0">•</span>
                      <span>
                        Class average is below 60% — consider re-teaching key topics before the next
                        assessment.
                      </span>
                    </div>
                  )}
                  {stats.gradeBuckets.A >= stats.gradedCount * 0.5 && (
                    <div className="flex gap-2.5 text-[12px] text-gray-600">
                      <span className="font-bold text-green-600 shrink-0">•</span>
                      <span>
                        Over half the class scored A — great performance! Consider moving to
                        advanced topics.
                      </span>
                    </div>
                  )}
                  {stats.gradedCount === 0 && (
                    <p className="text-[12px] text-gray-400">
                      Grade some submissions to see recommendations.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Feedback Summary */}
            <div className="bg-[#dee1e5] rounded-[32px] p-6 flex-1 shadow-[0_12px_44px_rgba(0,0,0,0.06)] border border-white/40">
              <h2 className="text-[17px] font-extrabold text-gray-900 mb-1">AI Feedback Summary</h2>
              <p className="text-[12px] text-gray-500 mb-4">
                {stats.feedbacks.length} feedback note{stats.feedbacks.length !== 1 ? "s" : ""} from
                graded submissions
              </p>
              {stats.feedbacks.length === 0 ? (
                <p className="text-[13px] text-gray-400">
                  No feedback written yet. Add notes when grading to see a summary here.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {stats.feedbacks.slice(0, 4).map((fb, i) => (
                    <div key={i} className="bg-white rounded-[16px] p-3.5 shadow-sm">
                      <p className="text-[12px] text-gray-600 leading-relaxed line-clamp-3">{fb}</p>
                    </div>
                  ))}
                  {stats.feedbacks.length > 4 && (
                    <p className="text-[11px] text-gray-400 text-center">
                      +{stats.feedbacks.length - 4} more feedback notes
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

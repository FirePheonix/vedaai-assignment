"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { trpc } from "@/lib/trpc"
import Header from "@/components/ui/Header"
import { fadeUp, fadeIn, fadeRight, scaleIn, stagger } from "@/lib/motion"

function ScoreTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      variants={scaleIn}
      className="bg-white rounded-[20px] p-5 flex flex-col items-center justify-center shadow-sm"
    >
      <span
        className="text-[32px] font-extrabold leading-tight tracking-tight mb-1"
        style={{ color }}
      >
        {value}
      </span>
      <span className="text-[12px] font-semibold text-gray-500 text-center">{label}</span>
    </motion.div>
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
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  const { data: stats, isLoading: statsLoading } = trpc.submission.getTeacherAnalytics.useQuery(
    selectedClassId ? { classId: selectedClassId } : {}
  )
  const { data: classes = [], isLoading: classesLoading } = trpc.class.list.useQuery()

  const isLoading = statsLoading || classesLoading

  const classOptions = classes.map((c) => ({ id: c.id, name: c.name }))

  const totalSubmissions = stats?.totalSubmissions ?? 0
  const totalStudents = stats?.totalStudents ?? 0
  const gradedCount = stats?.gradedCount ?? 0
  const avgScore = stats?.avgScore ?? 0
  const topScore = stats?.topScore ?? 0
  const medianScore = stats?.medianScore ?? 0
  const lowestScore = stats?.lowestScore ?? 0
  const gradeBuckets = stats?.gradeBuckets ?? { A: 0, B: 0, C: 0, D: 0, belowD: 0 }
  const feedbacks = stats?.feedbacks ?? []

  const gaugeSubmitted = totalSubmissions
  const gaugeTotal = Math.max(totalStudents || totalSubmissions, 1)
  const gaugeFraction = gaugeSubmitted / gaugeTotal
  const arcLen = 141.37

  const buckets = [
    { key: "A", count: gradeBuckets.A, range: "≥ 80%" },
    { key: "B", count: gradeBuckets.B, range: "60–79%" },
    { key: "C", count: gradeBuckets.C, range: "40–59%" },
    { key: "D", count: gradeBuckets.D, range: "20–39%" },
    { key: "belowD", count: gradeBuckets.belowD, range: "< 20%" },
  ]

  const conceptUnderstanding =
    gradedCount === 0 ? "—" : avgScore >= 70 ? "Strong" : avgScore >= 50 ? "Average" : "Needs Work"

  const suggestedImprovement =
    gradedCount === 0
      ? "—"
      : gradeBuckets.belowD > 0
        ? "Remedial sessions for low scorers"
        : gradeBuckets.D > 0
          ? `Revise core concepts`
          : avgScore < 60
            ? "Re-teach key topics"
            : "Introduce advanced topics"

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#f2f4f7] md:bg-transparent overflow-hidden px-4 md:px-0 py-4 md:pr-4 pb-24 md:pb-4 gap-4">
      <motion.div variants={fadeIn} initial="hidden" animate="show">
        <Header
          breadcrumb="Analytics"
          showBack={false}
          classes={classOptions}
          selectedClassId={selectedClassId}
          onClassChange={setSelectedClassId}
        />
      </motion.div>

      <div className="flex-1 overflow-y-auto w-full relative h-[calc(100vh-2rem)]">
        <div className="w-full flex flex-col xl:flex-row gap-5">
          {/* ── Left Column ── */}
          <motion.div
            variants={stagger(0.12)}
            initial="hidden"
            animate="show"
            className="flex flex-col flex-1 gap-5"
          >
            {/* Class Performance Summary */}
            <motion.div
              variants={fadeUp}
              className="bg-[#dee1e5] rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.06)] border border-white/40"
            >
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
                      <motion.path
                        d="M 5 50 A 45 45 0 0 1 95 50"
                        fill="none"
                        stroke="#ff5a22"
                        strokeWidth="18"
                        strokeLinecap="round"
                        strokeDasharray={arcLen}
                        initial={{ strokeDashoffset: arcLen }}
                        animate={{ strokeDashoffset: arcLen * (1 - gaugeFraction) }}
                        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                      />
                    </svg>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                      className="absolute w-full bottom-0 flex flex-col items-center justify-end translate-y-2"
                    >
                      <div className="text-[36px] font-extrabold leading-none tracking-tight">
                        {gaugeSubmitted}
                        <span className="text-[15px] font-medium text-gray-400">
                          /{totalStudents > 0 ? totalStudents : gaugeSubmitted}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-gray-400 mt-0.5">
                        Submissions
                      </div>
                    </motion.div>
                  </div>
                  <div className="flex flex-col gap-2 w-full px-2 text-[12px] font-medium mt-auto">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-sm bg-[#ff5a22]" />
                      <span className="text-gray-100">Submitted</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-sm bg-[#3a3a3a]" />
                      <span className="text-gray-400">Not Submitted</span>
                    </div>
                  </div>
                </div>

                {/* Score tiles */}
                <motion.div
                  variants={stagger(0.08)}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 gap-3 flex-1"
                >
                  <ScoreTile label="Average Score" value={`${avgScore}%`} color="#4ebf7b" />
                  <ScoreTile label="Top Score" value={`${topScore}%`} color="#fe5b2b" />
                  <ScoreTile label="Class Median" value={`${medianScore}%`} color="#111" />
                  <ScoreTile label="Lowest Score" value={`${lowestScore}%`} color="#a0a5b1" />
                </motion.div>
              </div>
            </motion.div>

            {/* Student Segmentation */}
            <motion.div
              variants={fadeUp}
              className="bg-[#fe5b2b] rounded-[32px] p-6 shadow-[0_12px_44px_rgba(254,91,43,0.2)]"
            >
              <h2 className="text-[17px] font-extrabold text-white mb-5">
                Student Segmentation{" "}
                <span className="text-white/70 font-medium text-[13px]">(Based on grades)</span>
              </h2>
              <motion.div
                variants={stagger(0.07)}
                initial="hidden"
                animate="show"
                className="flex items-end gap-3 justify-between"
              >
                {buckets.map(({ key, count }) => (
                  <motion.div
                    key={key}
                    variants={fadeUp}
                    className="flex flex-col items-center gap-2 flex-1"
                  >
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
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* AI Feedback Summary */}
            <motion.div
              variants={fadeUp}
              className="bg-white rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.04)] border border-gray-50/50"
            >
              <h2 className="text-[17px] font-extrabold text-gray-900 mb-5">AI Feedback Summary</h2>
              <motion.div
                variants={stagger(0.1)}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-3"
              >
                {[
                  {
                    bg: "#4ebf7b",
                    icon: "✓",
                    label: "Assignment Graded",
                    value: gradedCount,
                  },
                  {
                    bg: "#1c1c1c",
                    icon: "◉",
                    label: "Concept Understanding",
                    value: conceptUnderstanding,
                  },
                  {
                    bg: "#fe5b2b",
                    icon: "!",
                    label: "Suggested Improvement",
                    value: suggestedImprovement,
                  },
                ].map(({ bg, icon, label, value }) => (
                  <motion.div
                    key={label}
                    variants={fadeUp}
                    className="flex items-center gap-3 bg-[#f9fafb] rounded-[16px] px-4 py-3"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: bg }}
                    >
                      <span className="text-white text-[12px] font-bold">{icon}</span>
                    </div>
                    <span className="text-[14px] text-gray-700">
                      {label}: <span className="font-bold text-gray-900">{value}</span>
                    </span>
                  </motion.div>
                ))}
                {feedbacks.length > 0 && (
                  <p className="text-[11px] text-gray-400 px-1 mt-1">
                    Based on {feedbacks.length} AI feedback note{feedbacks.length !== 1 ? "s" : ""}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ── Right Column ── */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2 }}
            className="xl:w-[360px] shrink-0 flex flex-col gap-5"
          >
            {/* Learning Gaps Analysis - spans full height */}
            <div className="bg-white rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.04)] border border-gray-50/50 flex-1">
              <h2 className="text-[17px] font-extrabold text-gray-900 mb-1">
                Learning Gaps Analysis
              </h2>
              <p className="text-[12px] text-gray-400 mb-5">Based on grade distribution</p>

              {/* Frequently missed concepts */}
              <div className="mb-6">
                <p className="text-[13px] font-bold text-gray-700 mb-3">
                  Frequently missed concepts
                </p>
                <motion.div
                  variants={stagger(0.09)}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-3"
                >
                  {buckets
                    .filter((b) => b.count > 0)
                    .map(({ key, count }, i) => {
                      const total = Object.values(gradeBuckets).reduce((a, b) => a + b, 0)
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0
                      const conceptNames: Record<string, string> = {
                        belowD: "Foundational concepts",
                        D: "Core topic application",
                        C: "Concept understanding",
                        B: "Advanced application",
                        A: "Mastery level",
                      }
                      return (
                        <motion.div key={key} variants={fadeUp} className="flex items-center gap-3">
                          <span className="text-[12px] font-bold text-gray-500 w-4 shrink-0">
                            {i + 1}.
                          </span>
                          <span className="text-[12px] font-medium text-gray-700 flex-1 truncate">
                            {conceptNames[key]}
                          </span>
                          <span
                            className="text-[12px] font-extrabold w-10 text-right shrink-0"
                            style={{ color: GRADE_COLORS[key] }}
                          >
                            {pct}%
                          </span>
                        </motion.div>
                      )
                    })}
                  {Object.values(gradeBuckets).every((v) => v === 0) && (
                    <p className="text-[12px] text-gray-400">No data yet — 0%</p>
                  )}
                </motion.div>
              </div>

              {/* Recommended Actions */}
              <div>
                <p className="text-[13px] font-bold text-gray-700 mb-3">
                  Recommended Actions for teachers
                </p>
                <motion.div
                  variants={stagger(0.08)}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-3"
                >
                  {gradedCount === 0 ? (
                    <>
                      <motion.div variants={fadeUp} className="flex gap-2.5 text-[12px] text-gray-500">
                        <span className="font-bold text-gray-400 shrink-0">1.</span>
                        <span>Publish an assignment and grade submissions to see insights.</span>
                      </motion.div>
                      <motion.div variants={fadeUp} className="flex gap-2.5 text-[12px] text-gray-500">
                        <span className="font-bold text-gray-400 shrink-0">2.</span>
                        <span>Use the AI Toolkit to create curriculum-aligned question papers.</span>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      {gradeBuckets.belowD > 0 && (
                        <motion.div variants={fadeUp} className="flex gap-2.5 text-[12px] text-gray-600">
                          <span className="font-bold text-red-500 shrink-0">1.</span>
                          <span>
                            {gradeBuckets.belowD} student{gradeBuckets.belowD > 1 ? "s" : ""} scored
                            below 20% — consider remedial sessions.
                          </span>
                        </motion.div>
                      )}
                      {gradeBuckets.D > 0 && (
                        <motion.div variants={fadeUp} className="flex gap-2.5 text-[12px] text-gray-600">
                          <span className="font-bold text-orange-500 shrink-0">
                            {gradeBuckets.belowD > 0 ? "2." : "1."}
                          </span>
                          <span>
                            {gradeBuckets.D} student{gradeBuckets.D > 1 ? "s" : ""} in D band —
                            revisit core concepts with real-life examples.
                          </span>
                        </motion.div>
                      )}
                      {avgScore < 60 && (
                        <motion.div variants={fadeUp} className="flex gap-2.5 text-[12px] text-gray-600">
                          <span className="font-bold text-yellow-600 shrink-0">•</span>
                          <span>
                            Class average is below 60% — consider re-teaching key topics before the
                            next assessment.
                          </span>
                        </motion.div>
                      )}
                      {gradeBuckets.A >= gradedCount * 0.5 && (
                        <motion.div variants={fadeUp} className="flex gap-2.5 text-[12px] text-gray-600">
                          <span className="font-bold text-green-600 shrink-0">•</span>
                          <span>
                            Over half the class scored A — great performance! Consider moving to
                            advanced topics.
                          </span>
                        </motion.div>
                      )}
                      <motion.div variants={fadeUp} className="flex gap-2.5 text-[12px] text-gray-600">
                        <span className="font-bold text-gray-400 shrink-0">•</span>
                        <span>Extra classes for students who scored less than D.</span>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

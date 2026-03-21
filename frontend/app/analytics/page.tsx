"use client"

import { BarChart2, FileText, Sparkles, Clock, CheckCircle, AlertCircle, Loader } from "lucide-react"
import { trpc } from "@/lib/trpc"

function StatCard({ label, value, sub, color = "#111111" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_24px_rgba(0,0,0,0.03)] border border-gray-50">
      <span className="text-[42px] font-extrabold leading-tight tracking-tight mb-1" style={{ color }}>{value}</span>
      <span className="text-[14px] font-semibold text-gray-600">{label}</span>
      {sub && <span className="text-[11px] text-gray-400 mt-1">{sub}</span>}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: assignments = [], isLoading } = trpc.assignment.list.useQuery()

  const total = assignments.length
  const done = assignments.filter((a) => a.status === "done").length
  const pending = assignments.filter((a) => ["pending", "queued", "processing"].includes(a.status)).length
  const failed = assignments.filter((a) => a.status === "failed").length
  const timeSaved = Math.round((done * 15) / 60 * 10) / 10

  // Subject breakdown
  const subjectMap: Record<string, number> = {}
  assignments.forEach((a) => {
    subjectMap[a.subject] = (subjectMap[a.subject] ?? 0) + 1
  })
  const topSubjects = Object.entries(subjectMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Papers generated per day (last 7 days)
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString("en-GB", { weekday: "short" })
  })
  const dayCounts = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dayStr = d.toDateString()
    return assignments.filter(
      (a) => a.status === "done" && new Date(a.assignedOn).toDateString() === dayStr
    ).length
  })
  const maxDay = Math.max(...dayCounts, 1)

  const gaugeFraction = total > 0 ? done / total : 0
  const arcLen = 141.37

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 text-center px-8">
        <BarChart2 size={48} className="text-gray-200" strokeWidth={1.5} />
        <p className="text-gray-400 font-medium">No data yet. Create your first assignment to see analytics.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#f2f4f7] md:bg-transparent overflow-hidden px-4 md:px-0 py-4 md:pr-4 pb-24 md:pb-4 gap-4">
      <div className="flex-1 overflow-y-auto w-full relative h-[calc(100vh-2rem)]">
        <div className="w-full flex flex-col xl:flex-row gap-5">

          {/* Left Column */}
          <div className="flex flex-col flex-1 gap-5">

            {/* Summary header */}
            <div className="bg-[#dee1e5] rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.06)] border border-white/40">
              <h2 className="text-center text-subheading text-gray-900 mb-6">Paper Generation Summary</h2>

              <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
                {/* Gauge */}
                <div className="bg-[#2a2a2a] rounded-[24px] p-6 lg:w-[38%] flex flex-col items-center justify-between text-white shadow-[0_12px_40px_rgba(0,0,0,0.2)] shrink-0 min-h-[300px]">
                  <h3 className="text-normal mb-auto self-start text-gray-100">Papers Generated</h3>
                  <div className="relative w-full max-w-[200px] aspect-[2/1] mb-6 mt-6 flex flex-col items-center justify-end">
                    <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 50">
                      <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="#3a3a3a" strokeWidth="18" strokeLinecap="round" />
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
                      <div className="text-[40px] font-extrabold leading-none tracking-tight">
                        {done}<span className="text-[18px] font-medium text-gray-400">/{total}</span>
                      </div>
                      <div className="text-[12px] font-medium text-gray-400 mt-0.5">Papers / Assignments</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 mt-auto w-full px-2 text-[12px] font-medium">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-sm bg-[#ff5a22]" />
                      <span className="text-gray-100">Generated</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-sm bg-[#3a3a3a]" />
                      <span className="text-gray-400">Pending</span>
                    </div>
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-4 lg:gap-5 flex-1 w-full">
                  <StatCard label="Papers Generated" value={done} color="#11b76b" />
                  <StatCard label="Pending" value={pending} color="#fc582e" />
                  <StatCard label="Time Saved" value={timeSaved > 0 ? `${timeSaved}h` : "—"} sub="~15 min per paper" color="#2a2a2a" />
                  <StatCard label="Failed" value={failed} color={failed > 0 ? "#e02424" : "#a0a5b1"} />
                </div>
              </div>
            </div>

            {/* 7-day bar chart */}
            <div className="bg-white rounded-[32px] p-6 lg:p-8 shadow-[0_12px_44px_rgba(0,0,0,0.04)] border border-gray-50/50">
              <h2 className="text-[17px] font-extrabold text-gray-900 mb-6">Papers Generated — Last 7 Days</h2>
              <div className="flex items-end gap-3 h-40">
                {dayCounts.map((count, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-[11px] font-bold text-gray-500">{count > 0 ? count : ""}</span>
                    <div className="w-full rounded-t-xl bg-orange-100 relative" style={{ height: "100px" }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t-xl bg-[#fe5b2b] transition-all"
                        style={{ height: `${(count / maxDay) * 100}%`, minHeight: count > 0 ? "8px" : "0" }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-gray-400">{dayLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status breakdown */}
            <div className="bg-white rounded-[32px] p-6 lg:p-8 shadow-[0_12px_44px_rgba(0,0,0,0.04)] border border-gray-50/50">
              <h2 className="text-[17px] font-extrabold text-gray-900 mb-5">Assignment Status Breakdown</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Generated", count: done, color: "#4ebf7b", icon: CheckCircle },
                  { label: "Pending / Queued", count: pending, color: "#fc582e", icon: Loader },
                  { label: "Failed", count: failed, color: "#e02424", icon: AlertCircle },
                ].map(({ label, count, color, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-4">
                    <Icon size={18} strokeWidth={2.5} style={{ color }} className="shrink-0" />
                    <span className="text-[14px] font-semibold text-gray-700 w-40">{label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%", backgroundColor: color }}
                      />
                    </div>
                    <span className="text-[13px] font-bold text-gray-500 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:w-[380px] shrink-0 flex flex-col gap-5">

            {/* Top subjects */}
            <div className="bg-[#dee1e5] rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.06)] border border-white/40">
              <h2 className="text-subheading text-gray-900 mb-5">Top Subjects</h2>
              {topSubjects.length === 0 ? (
                <p className="text-gray-400 text-normal">No assignments yet.</p>
              ) : (
                <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                  <ul className="flex flex-col gap-4">
                    {topSubjects.map(([subject, count], i) => (
                      <li key={subject} className="flex items-center gap-3">
                        <span className="text-[13px] font-bold text-gray-400 w-4">{i + 1}.</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-[13px] font-semibold text-gray-800">{subject}</span>
                            <span className="text-[13px] font-bold text-gray-500">{count}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-full rounded-full bg-[#fe5b2b]"
                              style={{ width: `${(count / (topSubjects[0]?.[1] ?? 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* AI usage stats */}
            <div className="bg-white rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.04)] flex-1">
              <h2 className="text-[17px] font-extrabold text-gray-900 mb-5">AI Usage Stats</h2>
              <div className="flex flex-col gap-4">
                {[
                  { icon: FileText, label: "Total Assignments", value: total, color: "#111111" },
                  { icon: Sparkles, label: "Papers Generated", value: done, color: "#fe5b2b" },
                  { icon: Clock, label: "Est. Time Saved", value: timeSaved > 0 ? `${timeSaved} hrs` : "—", color: "#4ebf7b" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
                      <Icon size={16} strokeWidth={2.5} style={{ color }} />
                    </div>
                    <span className="flex-1 text-[14px] font-semibold text-gray-700">{label}</span>
                    <span className="text-[15px] font-extrabold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { FileText, CheckCircle2, Clock, Sparkles, Plus, ArrowRight, TrendingUp } from "lucide-react"
import Header from "@/components/ui/Header"
import { trpc } from "@/lib/trpc"
import { useRouter } from "next/navigation"

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  accent: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-[28px] p-6 border border-gray-100/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${accent}`}>
        <Icon size={18} strokeWidth={2.5} className="text-white" />
      </div>
      <div>
        <p className="text-[32px] font-extrabold text-gray-900 leading-none tracking-tight">{value}</p>
        {sub && <p className="text-normal text-orange-500 mt-1 font-semibold">{sub}</p>}
        <p className="text-normal text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  )
}

function RecentRow({
  title,
  subject,
  dueDate,
  status,
  paperId,
}: {
  title: string
  subject: string
  dueDate: string
  status: string
  paperId: string | null
}) {
  const router = useRouter()
  const isDone = status === "done"

  return (
    <div
      onClick={() => paperId && router.push(`/paper/${paperId}`)}
      className={`flex items-center gap-4 py-4 px-1 border-b border-gray-100/60 last:border-0 ${isDone && paperId ? "cursor-pointer hover:bg-gray-50/50 -mx-1 px-2 rounded-xl transition-colors" : ""}`}
    >
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${isDone ? "bg-emerald-50" : "bg-orange-50"}`}
      >
        {isDone ? (
          <CheckCircle2 size={16} strokeWidth={2.5} className="text-emerald-500" />
        ) : (
          <Clock size={16} strokeWidth={2.5} className="text-orange-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-normal font-bold text-gray-900 truncate">{title}</p>
        <p className="text-normal text-[12px] text-gray-400 truncate">{subject}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-normal text-[12px] text-gray-400">
          Due {new Date(dueDate).toLocaleDateString("en-GB").replace(/\//g, "-")}
        </p>
        <p
          className={`text-[11px] font-semibold mt-0.5 ${isDone ? "text-emerald-500" : "text-orange-400"}`}
        >
          {isDone ? "Generated" : status === "processing" ? "Processing…" : "Pending"}
        </p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data: assignments = [] } = trpc.assignment.list.useQuery()

  const total = assignments.length
  const done = assignments.filter((a) => a.status === "done").length
  const pending = assignments.filter((a) => a.status !== "done").length

  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(now.getDate() + 7)
  const dueThisWeek = assignments.filter((a) => {
    const d = new Date(a.dueDate)
    return d >= now && d <= weekEnd
  }).length

  const recent = assignments.slice(0, 5)

  return (
    <>
      <Header breadcrumb="Home" showBack={false} />

      <main className="flex-1 overflow-y-auto px-5 md:px-8 py-4 md:py-7 h-[calc(100vh-70px)] md:h-full">
        {/* Mobile title */}
        <div className="md:hidden mb-6">
          <p className="text-normal text-gray-400">Good morning,</p>
          <h1 className="text-heading text-gray-900">Delhi Public School</h1>
        </div>

        {/* Desktop title */}
        <div className="hidden md:block mb-7 ml-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <h1 className="text-heading text-gray-900 mt-1">Dashboard</h1>
          </div>
          <p className="text-normal text-gray-400 ml-4 mt-1.5">Here&apos;s a snapshot of your classroom activity.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <StatCard
            label="Total Assignments"
            value={total}
            icon={FileText}
            accent="bg-[#1c1c1c]"
          />
          <StatCard
            label="Papers Generated"
            value={done}
            icon={CheckCircle2}
            accent="bg-emerald-500"
          />
          <StatCard
            label="In Progress"
            value={pending}
            icon={Clock}
            accent="bg-orange-500"
          />
          <StatCard
            label="Due This Week"
            value={dueThisWeek}
            icon={TrendingUp}
            accent="bg-violet-500"
            sub={dueThisWeek > 0 ? "Needs attention" : undefined}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 pb-40 md:pb-10">
          {/* Recent assignments */}
          <div className="md:col-span-2 bg-white rounded-[28px] p-6 border border-gray-100/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sidebar-item font-extrabold text-gray-900">Recent Assignments</h2>
              <Link
                href="/assignments"
                className="text-normal text-orange-500 hover:text-orange-600 flex items-center gap-1 font-semibold transition-colors"
              >
                View all <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-normal text-gray-400">No assignments yet.</p>
                <Link
                  href="/create"
                  className="mt-3 inline-flex items-center gap-1.5 text-normal font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  <Plus size={14} strokeWidth={2.5} /> Create one
                </Link>
              </div>
            ) : (
              recent.map((a) => (
                <RecentRow
                  key={a.id}
                  title={a.title}
                  subject={a.subject}
                  dueDate={a.dueDate}
                  status={a.status}
                  paperId={a.paperId}
                />
              ))
            )}
          </div>

          {/* Quick actions */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[28px] p-6 border border-gray-100/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h2 className="text-sidebar-item font-extrabold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex flex-col gap-3">
                <Link
                  href="/create"
                  className="flex items-center gap-3.5 px-4 py-3.5 bg-[#1c1c1c] text-white rounded-2xl text-normal font-semibold hover:bg-black transition-colors"
                >
                  <Sparkles size={16} fill="currentColor" />
                  Create Assignment
                </Link>
                <Link
                  href="/assignments"
                  className="flex items-center gap-3.5 px-4 py-3.5 bg-gray-50 text-gray-700 rounded-2xl text-normal font-semibold hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <FileText size={16} strokeWidth={2.5} />
                  View Assignments
                </Link>
                <Link
                  href="/library"
                  className="flex items-center gap-3.5 px-4 py-3.5 bg-gray-50 text-gray-700 rounded-2xl text-normal font-semibold hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                  Generated Papers
                </Link>
              </div>
            </div>

            {/* Tip card */}
            <div className="bg-gradient-to-br from-orange-500 to-[#f47f42] rounded-[28px] p-6 text-white">
              <Sparkles size={22} fill="white" className="mb-3" />
              <p className="text-sidebar-item font-extrabold leading-snug mb-2">
                Pro tip
              </p>
              <p className="text-normal text-white/80 leading-snug">
                Upload a PDF or image of your syllabus to let VedaAI generate targeted questions automatically.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

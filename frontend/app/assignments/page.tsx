"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ListFilter, MoreVertical, Plus } from "lucide-react"
import Header from "@/components/ui/Header"
import { useRouter } from "next/navigation"
import { useAssignmentStore } from "@/store/assignmentStore"

const MOCK_ASSIGNMENTS = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  title: "Quiz on Electricity",
  assignedOn: "20-06-2025",
  dueDate: "21-06-2025",
}))

function AssignmentCard({
  id,
  title,
  assignedOn,
  dueDate,
}: {
  id: string
  title: string
  assignedOn: string
  dueDate: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const setPaper = useAssignmentStore((state) => state.setPaper)

  const handleCardClick = () => {
    // Generate an exact mock paper structure matching the UI screenshot
    setPaper({
      id: id,
      schoolName: "Delhi Public School, Sector-4, Bokaro",
      subject: "Science", // it is just for now
      className: "8th grade",
      timeAllowed: "45 minutes",
      maximumMarks: 20,
      totalQuestions: 5,
      createdAt: new Date().toISOString(),
      sections: [
        {
          id: "1",
          title: "Section A",
          questionType: "Short Answer Questions",
          instruction: "Attempt all questions. Each question carries 2 marks",
          marksPerQuestion: 2,
          questions: [
            {
              id: "q1",
              text: "Define electroplating. Explain its purpose.",
              marks: 2,
              difficulty: "Easy",
            },
            {
              id: "q2",
              text: "What is the role of a conductor in the process of electrolysis?",
              marks: 2,
              difficulty: "Moderate",
            },
            {
              id: "q3",
              text: "Why does a solution of copper sulfate conduct electricity?",
              marks: 2,
              difficulty: "Easy",
            },
            {
              id: "q4",
              text: "Describe one example of the chemical effect of electric current in daily life.",
              marks: 2,
              difficulty: "Moderate",
            },
            {
              id: "q5",
              text: "Explain why electric current is said to have chemical effects.",
              marks: 2,
              difficulty: "Moderate",
            },
          ],
        },
      ],
      answerKey: [
        {
          questionId: "q1",
          answer:
            "Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness.",
        },
      ],
    })
    router.push(`/paper/${id}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-[32px] p-7 pt-6 relative shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100/30 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer flex flex-col justify-between h-[210px]"
    >
      {/* Title row */}
      <div className="flex items-start justify-between">
        <h3 className="text-heading text-gray-900 line-clamp-2 pr-4">{title}</h3>
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((v) => !v)
            }}
            className="text-gray-300 hover:text-gray-500 transition-colors p-1 mt-0.5"
          >
            <MoreVertical size={22} strokeWidth={2.5} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                }}
              />
              <div className="absolute right-0 top-9 z-20 bg-white border border-gray-100/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 w-48 overflow-hidden">
                <Link
                  href={`/paper/${id}`}
                  className="block px-5 py-3 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  View Assignment
                </Link>
                <div className="h-px bg-gray-100 mx-2"></div>
                <button className="block w-full text-left px-5 py-3 text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors">
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Dates */}
      <div className="flex items-center justify-between text-normal">
        <div>
          <span className="font-extrabold text-gray-900">Assigned on</span>
          <span className="text-gray-400"> : {assignedOn}</span>
        </div>
        <div>
          <span className="font-extrabold text-gray-900">Due</span>
          <span className="text-gray-400"> : {dueDate}</span>
        </div>
      </div>
    </div>
  )
}

export default function AssignmentsPage() {
  const [search, setSearch] = useState("")

  const filtered = MOCK_ASSIGNMENTS.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Header breadcrumb="Assignment" />

      <main className="flex-1 overflow-y-auto px-8 py-7 relative">
        {/* Page title */}
        <div className="mb-6 ml-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <h1 className="text-heading text-gray-900 mt-1">Assignments</h1>
          </div>
          <p className="text-normal text-gray-400 ml-4 mt-1.5">
            Manage and create assignments for your classes.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mx-1 mb-8 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] pl-6 pr-2 py-2 border border-gray-100/30">
          <button className="flex items-center gap-2.5 text-normal text-gray-400 hover:text-gray-700 transition-colors shrink-0">
            <ListFilter size={18} strokeWidth={2} />
            Filter By
          </button>
          <div className="relative max-w-[360px] w-full">
            <div className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-full px-5 py-3 w-full shadow-sm">
              <Search size={18} className="text-gray-300" strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Search Assignment"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent w-full text-normal text-gray-700 placeholder:text-gray-300 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-5 px-1 pb-40">
          {filtered.map((a) => (
            <AssignmentCard key={a.id} {...a} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-16 text-gray-400 font-medium">
              No assignments found.
            </div>
          )}
        </div>
      </main>

      {/* Fade mask for bottom area */}
      <div className="fixed bottom-0 left-[260px] right-0 h-40 bg-gradient-to-t from-[#f5f6f8] via-[#f5f6f8]/90 to-transparent pointer-events-none z-20"></div>

      {/* Floating CTA */}
      <div className="fixed bottom-10 left-[calc(50%+130px)] -translate-x-1/2 z-30">
        <Link
          href="/create"
          className="flex items-center gap-2.5 bg-[#1c1c1c] text-white rounded-[24px] px-7 py-4 text-sidebar-item shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:bg-black transition-all hover:-translate-y-1"
        >
          <Plus size={20} className="text-white" />
          Create Assignment
        </Link>
      </div>
    </>
  )
}

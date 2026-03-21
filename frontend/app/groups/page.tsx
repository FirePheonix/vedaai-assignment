"use client"

import { useState } from "react"
import { Users, BookOpen, Search, MoreVertical } from "lucide-react"
import Header from "@/components/ui/Header"
import { useRouter } from "next/navigation"

const GROUPS = [
  {
    id: "1",
    name: "Class 8A",
    subject: "Mathematics",
    students: 34,
    color: "bg-violet-100 text-violet-600",
  },
  {
    id: "2",
    name: "Class 9B",
    subject: "Science",
    students: 28,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "3",
    name: "Class 10A",
    subject: "English",
    students: 31,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "4",
    name: "Class 7C",
    subject: "History",
    students: 29,
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: "5",
    name: "Class 11 Science",
    subject: "Physics",
    students: 22,
    color: "bg-pink-100 text-pink-600",
  },
  {
    id: "6",
    name: "Class 12 Arts",
    subject: "Political Science",
    students: 18,
    color: "bg-orange-100 text-orange-600",
  },
]

function GroupCard({
  name,
  subject,
  students,
  color,
}: {
  name: string
  subject: string
  students: number
  color: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-white rounded-[28px] p-6 border border-gray-100/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-orange-200 transition-all flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
          <Users size={18} strokeWidth={2.5} />
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-gray-300 hover:text-gray-500 p-1 transition-colors"
          >
            <MoreVertical size={20} strokeWidth={2.5} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 bg-white border border-gray-100/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 w-40 overflow-hidden">
                <button className="block w-full text-left px-5 py-3 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  View Group
                </button>
                <div className="h-px bg-gray-100 mx-2" />
                <button className="block w-full text-left px-5 py-3 text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors">
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sidebar-item font-extrabold text-gray-900">{name}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          <BookOpen size={13} strokeWidth={2.5} className="text-gray-400" />
          <p className="text-normal text-gray-400">{subject}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100/60">
        <div className="flex -space-x-2">
          {[...Array(Math.min(3, students))].map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-500"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <span className="text-normal text-gray-500 font-semibold">{students} students</span>
      </div>
    </div>
  )
}

export default function GroupsPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const filtered = GROUPS.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <Header breadcrumb="My Groups" showBack={false} />

      <main className="flex-1 overflow-y-auto px-5 md:px-8 py-4 md:py-7 h-[calc(100vh-70px)] md:h-full">
        {/* Mobile title */}
        <div className="md:hidden flex items-center justify-center relative mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-0 w-10 h-10 bg-gray-200/50 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-800"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-heading text-[16px] text-gray-900 font-extrabold">My Groups</h1>
        </div>

        {/* Desktop title */}
        <div className="hidden md:block mb-6 ml-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            <h1 className="text-heading text-gray-900 mt-1">My Groups</h1>
          </div>
          <p className="text-normal text-gray-400 ml-4 mt-1.5">
            Manage your classes and student groups.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex items-center mx-0 md:mx-1 mb-6 md:mb-8 bg-white rounded-2xl md:rounded-full shadow-sm md:shadow-[0_2px_10px_rgba(0,0,0,0.02)] pl-5 md:pl-6 pr-2 py-1 md:py-2 border border-gray-100/30">
          <div className="flex items-center gap-2 bg-transparent w-full">
            <Search size={18} className="text-gray-300" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search groups"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent w-full py-3 text-normal text-gray-700 placeholder:text-gray-300 outline-none"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 px-1 pb-40">
          {filtered.map((g) => (
            <GroupCard key={g.id} {...g} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-1 md:col-span-3 text-center py-16 text-gray-400 font-medium">
              No groups found.
            </div>
          )}
        </div>
      </main>
    </>
  )
}

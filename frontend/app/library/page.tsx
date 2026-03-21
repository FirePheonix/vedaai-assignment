"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, FileText, Download, Eye } from "lucide-react"
import Header from "@/components/ui/Header"
import { trpc } from "@/lib/trpc"
import { useRouter } from "next/navigation"

function PaperCard({
  title,
  subject,
  generatedOn,
  paperId,
}: {
  id: string
  title: string
  subject: string
  generatedOn: string
  paperId: string
}) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/paper/${paperId}`)}
      className="bg-white rounded-[28px] p-6 border border-gray-100/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-orange-200 transition-all cursor-pointer flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
          <FileText size={18} strokeWidth={2.5} className="text-orange-500" />
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1 shrink-0 self-start">
          Generated
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-sidebar-item font-extrabold text-gray-900 line-clamp-2">{title}</h3>
        <p className="text-normal text-gray-400 mt-1">{subject}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100/60">
        <p className="text-normal text-[12px] text-gray-400">
          {new Date(generatedOn).toLocaleDateString("en-GB").replace(/\//g, "-")}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={`/paper/${paperId}`}
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Eye size={14} strokeWidth={2.5} className="text-gray-500" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.print()
            }}
            className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center hover:bg-orange-100 transition-colors"
          >
            <Download size={14} strokeWidth={2.5} className="text-orange-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LibraryPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const { data: assignments = [] } = trpc.assignment.list.useQuery()

  const papers = assignments.filter((a) => a.paperId !== null && a.status === "done")
  const filtered = papers.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Header breadcrumb="My Library" showBack={false} />

      <main className="flex-1 overflow-y-auto px-5 md:px-8 py-4 md:py-7 h-[calc(100vh-70px)] md:h-full">
        {/* Mobile title */}
        <div className="md:hidden flex items-center justify-center relative mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-0 w-10 h-10 bg-gray-200/50 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <h1 className="text-heading text-[16px] text-gray-900 font-extrabold">My Library</h1>
        </div>

        {/* Desktop title */}
        <div className="hidden md:block mb-6 ml-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            <h1 className="text-heading text-gray-900 mt-1">My Library</h1>
          </div>
          <p className="text-normal text-gray-400 ml-4 mt-1.5">All your generated question papers in one place.</p>
        </div>

        {/* Search */}
        <div className="flex items-center mx-0 md:mx-1 mb-6 md:mb-8 bg-white rounded-2xl md:rounded-full shadow-sm md:shadow-[0_2px_10px_rgba(0,0,0,0.02)] pl-5 md:pl-6 pr-2 py-1 md:py-2 border border-gray-100/30">
          <div className="flex items-center gap-2 bg-transparent w-full">
            <Search size={18} className="text-gray-300" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search papers"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent w-full py-3 text-normal text-gray-700 placeholder:text-gray-300 outline-none"
            />
          </div>
        </div>

        {/* Count */}
        {filtered.length > 0 && (
          <p className="text-normal text-gray-400 mb-4 ml-2">
            {filtered.length} paper{filtered.length !== 1 ? "s" : ""} generated
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 px-1 pb-40">
          {filtered.map((a) => (
            <PaperCard
              key={a.id}
              id={a.id}
              title={a.title}
              subject={a.subject}
              generatedOn={a.assignedOn}
              paperId={a.paperId!}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-1 md:col-span-3 text-center py-16">
              <p className="text-gray-400 font-medium">
                {papers.length === 0 ? "No papers generated yet." : "No papers match your search."}
              </p>
              {papers.length === 0 && (
                <p className="text-normal text-gray-300 mt-2">
                  Create an assignment and generate a paper to see it here.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

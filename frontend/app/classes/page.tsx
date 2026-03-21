"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Users, X, Copy, Check } from "lucide-react"
import Header from "@/components/ui/Header"
import { trpc } from "@/lib/trpc"

export default function ClassesPage() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const { data: classes = [], refetch } = trpc.class.list.useQuery()
  const createMutation = trpc.class.create.useMutation({ onSuccess: () => { setName(""); setShowForm(false); refetch() } })
  const deleteMutation = trpc.class.delete.useMutation({ onSuccess: () => refetch() })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) createMutation.mutate({ name: name.trim() })
  }

  return (
    <>
      <Header breadcrumb="My Classes" />

      <main className="flex-1 overflow-y-auto px-5 md:px-8 py-4 md:py-7 h-[calc(100vh-70px)] md:h-full">
        {/* Mobile title */}
        <div className="md:hidden flex items-center justify-center relative mb-8">
          <button type="button" onClick={() => router.back()} className="absolute left-0 w-10 h-10 bg-gray-200/50 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-heading text-[16px] text-gray-900 font-extrabold">My Classes</h1>
        </div>

        {/* Desktop title */}
        <div className="hidden md:flex items-center justify-between mb-6 ml-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
              <h1 className="text-heading text-gray-900 mt-1">My Classes</h1>
            </div>
            <p className="text-normal text-gray-400 ml-4 mt-1.5">Manage your class groups for quick assignment creation.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#1c1c1c] text-white px-5 py-3 rounded-2xl text-normal font-bold hover:bg-black transition-colors shadow-sm"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Class
          </button>
        </div>

        {/* Add class form */}
        {showForm && (
          <div className="mb-6 bg-white rounded-[28px] p-6 border border-gray-100/50 shadow-sm mx-0 md:mx-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sidebar-item font-extrabold text-gray-900">New Class</h3>
              <button onClick={() => { setShowForm(false); setName("") }} className="text-gray-300 hover:text-gray-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grade 8B Science"
                autoFocus
                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-normal text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <button
                type="submit"
                disabled={createMutation.isPending || !name.trim()}
                className="bg-[#1c1c1c] text-white px-6 py-3 rounded-2xl text-normal font-bold hover:bg-black transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? "Saving…" : "Save"}
              </button>
            </form>
          </div>
        )}

        {/* Classes grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 px-1 pb-40">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-[28px] p-6 border border-gray-100/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-4 group hover:border-violet-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0">
                    <Users size={17} strokeWidth={2.5} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sidebar-item font-extrabold text-gray-900">{cls.name}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {cls.studentCount} student{cls.studentCount !== 1 ? "s" : ""} enrolled
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate({ id: cls.id })}
                  className="text-gray-200 hover:text-red-400 transition-colors p-2 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              </div>

              {/* Join code row */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-2.5">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Class Code</p>
                  <p className="text-[18px] font-extrabold tracking-[0.18em] text-gray-900 font-mono">{cls.joinCode}</p>
                </div>
                <button
                  onClick={() => copyCode(cls.id, cls.joinCode)}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-violet-500 hover:text-violet-700 transition-colors"
                >
                  {copiedId === cls.id ? (
                    <><Check size={13} strokeWidth={2.5} />Copied!</>
                  ) : (
                    <><Copy size={13} strokeWidth={2.5} />Copy</>
                  )}
                </button>
              </div>
            </div>
          ))}

          {classes.length === 0 && !showForm && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16">
              <p className="text-gray-400 font-medium mb-3">No classes yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-orange-500 hover:underline font-bold text-normal"
              >
                Add your first class
              </button>
            </div>
          )}
        </div>

        {/* Mobile FAB */}
        <div className="fixed bottom-24 right-5 md:hidden z-30">
          <button
            onClick={() => setShowForm(true)}
            className="w-14 h-14 bg-white text-[#ff5722] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>
      </main>
    </>
  )
}

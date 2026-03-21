"use client"

import { useState } from "react"
import { GraduationCap, BookOpen, Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc"

export default function OnboardingPage() {
  const [selected, setSelected] = useState<"teacher" | "student" | null>(null)
  const [schoolName, setSchoolName] = useState("")

  const setRole = trpc.user.setRole.useMutation({
    onSuccess: (data) => {
      // Force a full reload so Clerk session claims update
      window.location.href = data.role === "student" ? "/student/join" : "/home"
    },
  })

  const handleSubmit = () => {
    if (!selected) return
    setRole.mutate({
      role: selected,
      schoolName: selected === "teacher" && schoolName.trim() ? schoolName.trim() : undefined,
    })
  }

  return (
    <div className="min-h-screen bg-[#f2f4f7] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight mb-2">Welcome to VedaAI</h1>
          <p className="text-gray-500 text-[15px]">Tell us who you are to get started</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setSelected("teacher")}
            className={`rounded-[24px] p-6 flex flex-col items-center gap-3 border-2 transition-all ${
              selected === "teacher"
                ? "border-orange-400 bg-orange-50 shadow-md"
                : "border-transparent bg-white shadow-sm hover:shadow-md"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
              <BookOpen size={26} className="text-orange-500" strokeWidth={2} />
            </div>
            <div className="text-center">
              <p className="font-extrabold text-gray-900 text-[15px]">I&apos;m a Teacher</p>
              <p className="text-gray-400 text-[12px] mt-0.5">Create & grade papers</p>
            </div>
          </button>

          <button
            onClick={() => setSelected("student")}
            className={`rounded-[24px] p-6 flex flex-col items-center gap-3 border-2 transition-all ${
              selected === "student"
                ? "border-orange-400 bg-orange-50 shadow-md"
                : "border-transparent bg-white shadow-sm hover:shadow-md"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
              <GraduationCap size={26} className="text-orange-500" strokeWidth={2} />
            </div>
            <div className="text-center">
              <p className="font-extrabold text-gray-900 text-[15px]">I&apos;m a Student</p>
              <p className="text-gray-400 text-[12px] mt-0.5">Take tests & submit work</p>
            </div>
          </button>
        </div>

        {selected === "teacher" && (
          <div className="bg-white rounded-[20px] p-5 mb-6 shadow-sm">
            <label className="block text-[13px] font-semibold text-gray-700 mb-2">
              School name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Delhi Public School, Sector 4"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selected || setRole.isPending}
          className="w-full bg-[#111] text-white font-extrabold text-[15px] py-3.5 rounded-[20px] hover:bg-gray-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {setRole.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Setting up…
            </>
          ) : (
            "Continue"
          )}
        </button>

        {setRole.isError && (
          <p className="text-center text-red-500 text-[13px] mt-3">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </div>
  )
}

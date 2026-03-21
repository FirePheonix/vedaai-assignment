"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Hash, CheckCircle, Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc"

export default function JoinClassPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [joined, setJoined] = useState<{ className: string } | null>(null)

  const joinMutation = trpc.class.joinByCode.useMutation({
    onSuccess: (data) => setJoined({ className: data.className }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length < 4) return
    joinMutation.mutate({ code: trimmed })
  }

  if (joined) {
    return (
      <div className="min-h-screen bg-[#f2f4f7] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" strokeWidth={2} />
          </div>
          <h2 className="text-[22px] font-extrabold text-gray-900 mb-1">Joined!</h2>
          <p className="text-gray-500 text-[15px] mb-6">
            You&apos;re now in <span className="font-bold text-gray-800">{joined.className}</span>
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={() => router.push("/student/home")}
              className="bg-[#111] text-white font-extrabold px-8 py-3 rounded-[18px] hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setJoined(null)
                setCode("")
                joinMutation.reset()
              }}
              className="text-orange-500 font-semibold text-[14px] hover:underline"
            >
              Join another class
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f2f4f7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Hash size={26} className="text-orange-500" strokeWidth={2.5} />
          </div>
          <h1 className="text-[24px] font-extrabold text-gray-900 tracking-tight">Join a Class</h1>
          <p className="text-gray-400 text-[14px] mt-1">
            Ask your teacher for the 6-character class code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[24px] p-6 shadow-sm">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 8))}
            placeholder="e.g. AX7K2M"
            className="w-full text-center text-[28px] font-extrabold tracking-[0.3em] border-2 border-gray-200 rounded-2xl px-4 py-4 text-gray-900 focus:outline-none focus:border-orange-300 uppercase"
            autoFocus
          />

          {joinMutation.isError && (
            <p className="text-red-500 text-[13px] text-center mt-3">
              Invalid code. Check with your teacher and try again.
            </p>
          )}

          <button
            type="submit"
            disabled={code.trim().length < 4 || joinMutation.isPending}
            className="mt-4 w-full bg-[#111] text-white font-extrabold text-[15px] py-3.5 rounded-[18px] hover:bg-gray-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {joinMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Joining…
              </>
            ) : (
              "Join Class"
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-[13px] text-gray-400">
          Already joined?{" "}
          <button
            onClick={() => router.push("/student/home")}
            className="text-orange-500 font-semibold hover:underline"
          >
            Go to dashboard
          </button>
        </p>
      </div>
    </div>
  )
}

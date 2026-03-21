"use client"

import { useRouter } from "next/navigation"
import {
  Sparkles,
  FileQuestion,
  ClipboardList,
  BookOpen,
  BarChart2,
  MessageSquare,
  Lightbulb,
  PenLine,
} from "lucide-react"
import Header from "@/components/ui/Header"
import Link from "next/link"

const TOOLS = [
  {
    icon: FileQuestion,
    label: "Question Paper Generator",
    description: "AI-crafted exam papers tailored to your syllabus.",
    accent: "bg-orange-500",
    href: "/create",
    available: true,
  },
  {
    icon: ClipboardList,
    label: "Rubric Builder",
    description: "Generate detailed marking rubrics for any assignment.",
    accent: "bg-violet-500",
    href: "#",
    available: false,
  },
  {
    icon: BookOpen,
    label: "Lesson Planner",
    description: "Create structured lesson plans in seconds.",
    accent: "bg-blue-500",
    href: "#",
    available: false,
  },
  {
    icon: BarChart2,
    label: "Progress Tracker",
    description: "Visualise student performance across assessments.",
    accent: "bg-emerald-500",
    href: "#",
    available: false,
  },
  {
    icon: MessageSquare,
    label: "Feedback Generator",
    description: "Personalised student feedback at the click of a button.",
    accent: "bg-pink-500",
    href: "#",
    available: false,
  },
  {
    icon: Lightbulb,
    label: "Concept Explainer",
    description: "Break down complex topics for different grade levels.",
    accent: "bg-amber-500",
    href: "#",
    available: false,
  },
  {
    icon: PenLine,
    label: "Essay Prompt Generator",
    description: "Creative and analytical essay prompts on any subject.",
    accent: "bg-teal-500",
    href: "#",
    available: false,
  },
  {
    icon: Sparkles,
    label: "More coming soon",
    description: "We're building more tools for your classroom.",
    accent: "bg-gray-300",
    href: "#",
    available: false,
    dim: true,
  },
]

export default function ToolkitPage() {
  const router = useRouter()

  return (
    <>
      <Header breadcrumb="AI Teacher's Toolkit" showBack={false} />

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
          <h1 className="text-heading text-[16px] text-gray-900 font-extrabold">AI Toolkit</h1>
        </div>

        {/* Desktop title */}
        <div className="hidden md:block mb-6 ml-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
            <h1 className="text-heading text-gray-900 mt-1">AI Teacher&apos;s Toolkit</h1>
          </div>
          <p className="text-normal text-gray-400 ml-4 mt-1.5">
            A growing suite of AI tools built for educators.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 px-1 pb-40">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            const card = (
              <div
                className={`bg-white rounded-[28px] p-6 border border-gray-100/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-4 transition-all h-full ${
                  tool.dim
                    ? "opacity-50"
                    : tool.available
                      ? "hover:shadow-md hover:border-orange-200 cursor-pointer"
                      : "cursor-default"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tool.accent}`}
                  >
                    <Icon size={18} strokeWidth={2.5} className="text-white" />
                  </div>
                  {!tool.available && !tool.dim && (
                    <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                      Coming soon
                    </span>
                  )}
                  {tool.available && (
                    <span className="text-[11px] font-semibold text-orange-500 bg-orange-50 rounded-full px-3 py-1">
                      Available
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sidebar-item font-extrabold text-gray-900">{tool.label}</h3>
                  <p className="text-normal text-gray-400 mt-1">{tool.description}</p>
                </div>
              </div>
            )

            return tool.available && tool.href !== "#" ? (
              <Link key={tool.label} href={tool.href} className="flex">
                {card}
              </Link>
            ) : (
              <div key={tool.label} className="flex">
                {card}
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}

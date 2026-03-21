"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Users, BookOpen, Sparkles, BarChart2, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"

const teacherNav = [
  { label: "Home", href: "/home", icon: LayoutGrid },
  { label: "Classes", href: "/classes", icon: Users },
  { label: "Library", href: "/library", icon: BookOpen },
  { label: "AI Toolkit", href: "/assignments", icon: Sparkles },
]

const studentNav = [
  { label: "Home", href: "/student/home", icon: LayoutGrid },
  { label: "Join", href: "/student/join", icon: Hash },
  { label: "Analytics", href: "/student/analytics", icon: BarChart2 },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useUser()
  const role = (user?.publicMetadata as Record<string, string> | undefined)?.role ?? null
  const navItems = role === "student" ? studentNav : teacherNav

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-[#1c1c1c] rounded-full px-2 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center justify-around border border-white/10">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 min-w-[64px] transition-colors",
                isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-extrabold tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  Users,
  FileText,
  Smartphone,
  Settings,
  Sparkles,
  PieChart,
  BarChart2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Home", href: "/home", icon: LayoutGrid },
  { label: "My Classes", href: "/classes", icon: Users },
  { label: "Assignments", href: "/assignments", icon: FileText },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "My Library", href: "/library", icon: PieChart, badge: 32 },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[260px] h-full bg-white rounded-[32px] block flex flex-col py-8 px-6 shrink-0 shadow-sm border border-gray-100/30">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-1">
        <Image
          src="/vedaai-logo.svg"
          alt="VedaAI Logo"
          width={42}
          height={42}
          priority
          className="w-10.5 h-10.5 object-contain shrink-0 drop-shadow-sm"
        />
        <span className="text-heading text-gray-900 tracking-tight">VedaAI</span>
      </div>

      {/* Create Assignment CTA */}
      <div className="relative mb-9 rounded-3xl p-0.5 bg-linear-to-r from-[#e74c25] to-[#f47f42] shadow-[0_8px_16px_rgba(231,76,37,0.25)] flex shrink-0">
        <Link
          href="/create"
          className="flex-1 flex items-center justify-center gap-2.5 bg-[#252525] text-white rounded-[22px] py-3.5 px-4 text-sidebar-item hover:bg-black transition-colors"
        >
          <Sparkles size={16} fill="currentColor" />
          Create Assignment
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map(({ label, href, icon: Icon, badge }) => {
          const active = pathname === href || (href !== "/home" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sidebar-item transition-colors relative",
                active
                  ? "bg-[#f5f6f8] text-gray-900 font-bold"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              )}
            >
              {/* Optional tiny vertical colored bar on left if active - mimicking design details */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-transparent rounded-r-md"></div>
              )}

              <Icon
                size={18}
                strokeWidth={active ? 2.5 : 2}
                className={active ? "text-gray-900" : ""}
              />
              <span className="flex-1 leading-none">{label}</span>
              {badge !== undefined && (
                <span className="bg-orange-500 text-white text-[11px] rounded-full px-2 py-0.5 leading-none font-semibold">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-3">
        <Link
          href="/settings"
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sidebar-item text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          <Settings size={18} strokeWidth={2} />
          Settings
        </Link>

        {/* Teacher profile card */}
        <div className="flex items-center p-3 mt-1 bg-[#f4f4f6] rounded-2xl gap-3 shadow-inner">
          <div className="w-10.5 h-10.5 rounded-full bg-[#fddfae] flex items-center justify-center shrink-0 overflow-hidden border-2 border-white shadow-sm">
            <span className="text-[22px] leading-none">🐵</span>
          </div>
          <div className="min-w-0 pr-2">
            <p className="text-normal font-bold text-gray-900 truncate leading-tight">
              Delhi Public School
            </p>
            <p className="text-normal text-[11.5px] text-gray-500 truncate mt-0.75">
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

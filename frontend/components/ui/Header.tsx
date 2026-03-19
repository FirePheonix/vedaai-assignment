"use client"

import { Bell, ChevronDown, ArrowLeft, LayoutGrid } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import React from "react"

interface HeaderProps {
  breadcrumb?: string
  showBack?: boolean
  backHref?: string
  icon?: React.ReactNode
}

export default function Header({
  breadcrumb,
  showBack = true,
  backHref = "/assignments",
  icon,
}: HeaderProps) {
  return (
    <header className="hidden md:flex bg-white rounded-[32px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] items-center justify-between px-6 py-4 shrink-0 mx-2 mt-2">
      {/* Left: back + breadcrumb */}
      <div className="flex items-center gap-4">
        {showBack && (
          <Link href={backHref} className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={22} strokeWidth={2} />
          </Link>
        )}
        <div className="flex items-center gap-2 text-normal text-gray-400">
          {icon || <LayoutGrid size={18} strokeWidth={2} />}
          <span>{breadcrumb ?? "Assignment"}</span>
        </div>
      </div>

      {/* Right: bell + user */}
      <div className="flex items-center gap-6">
        {/* Bell */}
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors mt-1">
          <Bell size={22} strokeWidth={2} />
          <span className="absolute 1 top-0 right-0 w-2.5 h-2.5 bg-[#f25e36] rounded-full border-2 border-white translate-x-1/4 -translate-y-1/4" />
        </button>

        {/* User */}
        <button className="flex items-center gap-3">
          <Image
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=fddfae"
            alt="John Doe"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full border border-gray-100 bg-[#fddfae] object-cover"
          />
          <span className="text-normal font-bold text-gray-900">
            {/* Using text-normal base, bolding to match */}John Doe
          </span>
          <ChevronDown size={18} strokeWidth={2.5} className="text-gray-400 ml-1" />
        </button>
      </div>
    </header>
  )
}

"use client"

import { useUser } from "@clerk/nextjs"
import { Bell, ChevronDown, LayoutGrid } from "lucide-react"
import Image from "next/image"
import React, { useState, useRef, useEffect } from "react"

interface ClassOption {
  id: string
  name: string
}

interface HeaderProps {
  breadcrumb?: string
  showBack?: boolean
  backHref?: string
  icon?: React.ReactNode
  classes?: ClassOption[]
  selectedClassId?: string | null
  onClassChange?: (id: string | null) => void
}

export default function Header({
  breadcrumb,
  icon,
  classes,
  selectedClassId,
  onClassChange,
}: HeaderProps) {
  const { user } = useUser()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedClass = classes?.find((c) => c.id === selectedClassId)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="hidden md:flex bg-white rounded-[32px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] items-center justify-between px-6 py-4 shrink-0 mx-2 mt-2">
      {/* Left: breadcrumb + class toggle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-normal text-gray-400">
          {icon || <LayoutGrid size={18} strokeWidth={2} />}
          <span>{breadcrumb ?? "Home"}</span>
        </div>

        {classes && classes.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-4 py-2 text-[13px] font-bold text-gray-700"
            >
              {selectedClass?.name ?? "All Classes"}
              <ChevronDown size={14} strokeWidth={2.5} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-[16px] shadow-lg border border-gray-100 z-50 min-w-[150px] py-2 overflow-hidden">
                <button
                  onClick={() => {
                    onClassChange?.(null)
                    setDropdownOpen(false)
                  }}
                  className={`w-full px-4 py-2.5 text-left text-[13px] font-medium hover:bg-gray-50 transition-colors ${!selectedClassId ? "text-[#fe5b2b] font-bold" : "text-gray-700"}`}
                >
                  All Classes
                </button>
                {classes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onClassChange?.(c.id)
                      setDropdownOpen(false)
                    }}
                    className={`w-full px-4 py-2.5 text-left text-[13px] font-medium hover:bg-gray-50 transition-colors ${selectedClassId === c.id ? "text-[#fe5b2b] font-bold" : "text-gray-700"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: bell + user */}
      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors mt-1">
          <Bell size={22} strokeWidth={2} />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#f25e36] rounded-full border-2 border-white translate-x-1/4 -translate-y-1/4" />
        </button>

        <button className="flex items-center gap-3">
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.firstName ?? "User"}
              width={40}
              height={40}
              unoptimized
              className="w-10 h-10 rounded-full border border-gray-100 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#fddfae] flex items-center justify-center text-[16px] font-bold text-gray-700">
              {user?.firstName?.[0] ?? "T"}
            </div>
          )}
          <span className="text-normal font-bold text-gray-900">
            {user ? `${user.firstName ?? ""}${user.lastName ? ` ${user.lastName}` : ""}`.trim() || "Teacher" : "Teacher"}
          </span>
          <ChevronDown size={18} strokeWidth={2.5} className="text-gray-400 ml-1" />
        </button>
      </div>
    </header>
  )
}

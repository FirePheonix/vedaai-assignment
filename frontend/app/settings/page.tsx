"use client"

import { useState } from "react"
import { User, School, Bell, Shield, ChevronRight, Check } from "lucide-react"
import Header from "@/components/ui/Header"
import { useRouter } from "next/navigation"

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[28px] border border-gray-100/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="px-6 pt-5 pb-3">
        <h2 className="text-normal font-extrabold text-gray-500 uppercase tracking-wider text-[11px]">{title}</h2>
      </div>
      <div className="pb-2">{children}</div>
    </div>
  )
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  onClick,
  accent,
}: {
  icon: React.ElementType
  label: string
  value?: string
  onClick?: () => void
  accent?: string
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/70 transition-colors text-left"
    >
      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${accent ?? "bg-gray-100"}`}>
        <Icon size={16} strokeWidth={2.5} className={accent ? "text-white" : "text-gray-500"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-normal font-semibold text-gray-900">{label}</p>
        {value && <p className="text-normal text-[12px] text-gray-400 truncate">{value}</p>}
      </div>
      <ChevronRight size={16} strokeWidth={2.5} className="text-gray-300 shrink-0" />
    </button>
  )
}

function Toggle({ label, description, defaultOn }: { label: string; description?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn ?? false)
  return (
    <div className="flex items-center gap-4 px-6 py-3.5">
      <div className="flex-1 min-w-0">
        <p className="text-normal font-semibold text-gray-900">{label}</p>
        {description && <p className="text-normal text-[12px] text-gray-400">{description}</p>}
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-orange-500" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-5" : ""}`}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <Header breadcrumb="Settings" showBack={false} />

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
          <h1 className="text-heading text-[16px] text-gray-900 font-extrabold">Settings</h1>
        </div>

        {/* Desktop title */}
        <div className="hidden md:block mb-6 ml-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
            <h1 className="text-heading text-gray-900 mt-1">Settings</h1>
          </div>
          <p className="text-normal text-gray-400 ml-4 mt-1.5">Manage your profile and preferences.</p>
        </div>

        <div className="max-w-xl mx-auto md:mx-0 flex flex-col gap-4 pb-40">
          {/* Profile */}
          <div className="bg-white rounded-[28px] border border-gray-100/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-[#fddfae] flex items-center justify-center border-4 border-white shadow-md">
                <span className="text-3xl leading-none">🐵</span>
              </div>
              <div>
                <p className="text-sidebar-item font-extrabold text-gray-900">Delhi Public School</p>
                <p className="text-normal text-gray-400">Bokaro Steel City</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-normal text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">
                  School Name
                </label>
                <input
                  defaultValue="Delhi Public School"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-normal text-gray-900 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="text-normal text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">
                  City / Location
                </label>
                <input
                  defaultValue="Bokaro Steel City"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-normal text-gray-900 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <button
                onClick={handleSave}
                className={`flex items-center justify-center gap-2 mt-1 px-6 py-3 rounded-2xl text-normal font-semibold transition-all ${
                  saved ? "bg-emerald-500 text-white" : "bg-[#1c1c1c] text-white hover:bg-black"
                }`}
              >
                {saved ? (
                  <>
                    <Check size={15} strokeWidth={2.5} /> Saved
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>

          <SettingsSection title="Account">
            <SettingsRow icon={User} label="Profile" value="John Doe · Teacher" accent="bg-blue-500" />
            <SettingsRow icon={School} label="Institution" value="Delhi Public School" accent="bg-violet-500" />
          </SettingsSection>

          <SettingsSection title="Notifications">
            <Toggle label="Email Notifications" description="Get notified when paper is ready" defaultOn />
            <Toggle label="Push Notifications" description="Browser notifications for job updates" />
            <Toggle label="Weekly Summary" description="Weekly report of your activity" defaultOn />
          </SettingsSection>

          <SettingsSection title="Privacy & Security">
            <SettingsRow icon={Shield} label="Privacy Policy" accent="bg-emerald-500" />
            <SettingsRow icon={Bell} label="Data & Storage" accent="bg-orange-500" />
          </SettingsSection>

          <p className="text-normal text-[11px] text-gray-300 text-center mt-2">VedaAI v1.0 · Built with ❤️ for teachers</p>
        </div>
      </main>
    </>
  )
}

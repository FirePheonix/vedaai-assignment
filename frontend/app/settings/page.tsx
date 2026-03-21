"use client"

import { useState, useRef } from "react"
import { useClerk, useUser } from "@clerk/nextjs"
import {
  Camera, Check, Loader2, Shield, Bell, LogOut,
  ArrowLeftRight, AlertTriangle, X,
} from "lucide-react"
import Image from "next/image"
import Header from "@/components/ui/Header"
import { trpc } from "@/lib/trpc"

/* ── shared components ───────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider px-1 mb-2 mt-1">
      {children}
    </p>
  )
}

function Toggle({
  label,
  description,
  defaultOn,
}: {
  label: string
  description?: string
  defaultOn?: boolean
}) {
  const [on, setOn] = useState(defaultOn ?? false)
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-gray-900">{label}</p>
        {description && <p className="text-[12px] text-gray-400 mt-0.5">{description}</p>}
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

/* ── role switch confirmation modal ─────────────────────── */

function SwitchRoleModal({
  currentRole,
  onConfirm,
  onCancel,
  loading,
}: {
  currentRole: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  const targetRole = currentRole === "teacher" ? "Student" : "Teacher"
  const warn = currentRole === "teacher"
    ? "You'll lose access to paper creation, classes, and the library."
    : "You'll gain access to create and manage question papers."

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] p-7 max-w-sm w-full shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
          <AlertTriangle size={22} className="text-orange-500" strokeWidth={2.5} />
        </div>
        <h2 className="text-[18px] font-extrabold text-gray-900 mb-2">
          Switch to {targetRole}?
        </h2>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-6">{warn}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-[#111] text-white text-[14px] font-extrabold hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            {loading ? "Switching…" : `Yes, switch`}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── main page ───────────────────────────────────────────── */

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const { session, signOut } = useClerk()
  const { data: profile } = trpc.user.getMe.useQuery()

  const role = (user?.publicMetadata as Record<string, string> | undefined)?.role ?? profile?.role ?? null
  const isTeacher = role === "teacher"

  /* profile pic */
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingPhoto(true)
    try {
      await user.setProfileImage({ file })
    } finally {
      setUploadingPhoto(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  /* profile fields */
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [schoolName, setSchoolName] = useState("")
  const [fieldsInitialized, setFieldsInitialized] = useState(false)

  if (isLoaded && user && !fieldsInitialized) {
    setFirstName(user.firstName ?? "")
    setLastName(user.lastName ?? "")
    setSchoolName(profile?.schoolName ?? "")
    setFieldsInitialized(true)
  }
  // keep schoolName in sync once profile loads
  if (profile?.schoolName && schoolName === "" && fieldsInitialized) {
    setSchoolName(profile.schoolName)
  }

  const updateProfile = trpc.user.updateProfile.useMutation()
  const [profileSaved, setProfileSaved] = useState(false)

  const handleSaveProfile = async () => {
    await updateProfile.mutateAsync({
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      ...(isTeacher ? { schoolName: schoolName.trim() } : {}),
    })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  /* role switch */
  const [showSwitch, setShowSwitch] = useState(false)
  const switchRole = trpc.user.setRole.useMutation({
    onSuccess: async (data) => {
      await session?.reload()
      setShowSwitch(false)
      window.location.href = data.role === "student" ? "/student/home" : "/home"
    },
  })

  const handleConfirmSwitch = () => {
    const target = isTeacher ? "student" : "teacher"
    switchRole.mutate({ role: target })
  }

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-300" />
      </div>
    )
  }

  return (
    <>
      {showSwitch && role && (
        <SwitchRoleModal
          currentRole={role}
          onConfirm={handleConfirmSwitch}
          onCancel={() => setShowSwitch(false)}
          loading={switchRole.isPending}
        />
      )}

      <Header breadcrumb="Settings" showBack={false} />

      <main className="flex-1 overflow-y-auto px-5 md:px-8 py-4 md:py-7 h-[calc(100vh-70px)] md:h-full pb-40">

        {/* Mobile title */}
        <div className="md:hidden flex items-center justify-center relative mb-8">
          <h1 className="text-[16px] text-gray-900 font-extrabold">Settings</h1>
        </div>

        {/* Desktop title */}
        <div className="hidden md:block mb-6 ml-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
            <h1 className="text-heading text-gray-900 mt-1">Settings</h1>
          </div>
          <p className="text-normal text-gray-400 ml-4 mt-1.5">Manage your profile and preferences.</p>
        </div>

        <div className="max-w-xl mx-auto md:mx-0 flex flex-col gap-5">

          {/* ── Profile card ── */}
          <div className="bg-white rounded-[28px] border border-gray-100/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 flex flex-col gap-5">

            {/* Avatar + role badge */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-18 h-18 rounded-full overflow-hidden bg-orange-100 border-4 border-white shadow-md flex items-center justify-center">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt="Profile"
                      width={72}
                      height={72}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#111] flex items-center justify-center border-2 border-white shadow hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {uploadingPhoto
                    ? <Loader2 size={12} className="animate-spin text-white" />
                    : <Camera size={12} className="text-white" strokeWidth={2.5} />
                  }
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-gray-900 text-[16px] truncate">
                  {user?.fullName || user?.firstName || "Your Name"}
                </p>
                <p className="text-[12px] text-gray-400 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                <span className={`inline-block mt-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold ${
                  isTeacher
                    ? "bg-orange-100 text-orange-600"
                    : "bg-blue-100 text-blue-600"
                }`}>
                  {isTeacher ? "Teacher" : "Student"}
                </span>
              </div>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">
                  First Name
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-[14px] text-gray-900 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Last Name
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-[14px] text-gray-900 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            {/* School name — teachers only */}
            {isTeacher && (
              <div>
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">
                  School Name
                </label>
                <input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Delhi Public School"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-[14px] text-gray-900 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            )}

            {/* Email — read-only */}
            <div>
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <input
                value={user?.primaryEmailAddress?.emailAddress ?? ""}
                readOnly
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-[14px] text-gray-400 outline-none cursor-not-allowed"
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending || profileSaved}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-extrabold transition-all disabled:opacity-60 ${
                profileSaved
                  ? "bg-emerald-500 text-white"
                  : "bg-[#111] text-white hover:bg-gray-800"
              }`}
            >
              {updateProfile.isPending ? (
                <><Loader2 size={15} className="animate-spin" /> Saving…</>
              ) : profileSaved ? (
                <><Check size={15} strokeWidth={2.5} /> Saved</>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

          {/* ── Notifications ── */}
          <div>
            <SectionLabel>Notifications</SectionLabel>
            <div className="bg-white rounded-[28px] border border-gray-100/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-gray-50">
              <Toggle label="Email Notifications" description="Get notified when a paper is ready" defaultOn />
              <Toggle label="Push Notifications" description="Browser alerts for job updates" />
              <Toggle label="Weekly Summary" description="Weekly digest of your activity" defaultOn />
            </div>
          </div>

          {/* ── Account ── */}
          <div>
            <SectionLabel>Account</SectionLabel>
            <div className="bg-white rounded-[28px] border border-gray-100/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-gray-50">

              {/* Switch role */}
              <button
                onClick={() => setShowSwitch(true)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                  <ArrowLeftRight size={15} className="text-violet-600" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-900">Switch Role</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    Currently <span className="font-bold">{isTeacher ? "Teacher" : "Student"}</span> · tap to switch to {isTeacher ? "Student" : "Teacher"}
                  </p>
                </div>
                <ArrowLeftRight size={14} className="text-gray-300 shrink-0" strokeWidth={2} />
              </button>

              {/* Privacy */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Shield size={15} className="text-emerald-600" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-900">Privacy Policy</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">Your data is never shared</p>
                </div>
              </div>

              {/* Notifications placeholder */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Bell size={15} className="text-blue-600" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-900">Data & Storage</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">Manage your uploaded files</p>
                </div>
              </div>

              {/* Sign out */}
              <button
                onClick={() => signOut({ redirectUrl: "/" })}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50/60 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                  <LogOut size={15} className="text-red-500" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-red-500">Sign Out</p>
                </div>
                <X size={14} className="text-red-300 shrink-0" strokeWidth={2} />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-gray-300 text-center mt-2">VedaAI v1.0</p>
        </div>
      </main>
    </>
  )
}

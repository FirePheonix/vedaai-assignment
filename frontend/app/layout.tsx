import type { Metadata } from "next"
import { Bricolage_Grotesque } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/sidebar/Sidebar"
import MobileHeader from "@/components/ui/MobileHeader"
import MobileBottomNav from "@/components/ui/MobileBottomNav"
import Providers from "./providers"

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
})

export const metadata: Metadata = {
  title: "VedaAI – Assessment Creator",
  description: "AI-powered question paper generator for teachers",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-[100dvh] ${bricolage.variable}`}>
      <body className="h-[100dvh] flex flex-col md:flex-row bg-[#f5f6f8] md:p-4 md:gap-4 font-sans antialiased overflow-hidden text-gray-900 w-full">
        <Providers>
          {/* Mobile Shell */}
          <MobileHeader />
          <MobileBottomNav />

          {/* Desktop Shell */}
          <div className="hidden md:flex h-full shrink-0">
            <Sidebar />
          </div>

          <div className="flex flex-col flex-1 min-w-0 transition-all h-full bg-[#e8e9ec] md:bg-transparent overflow-y-auto">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}

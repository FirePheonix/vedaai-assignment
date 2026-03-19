import type { Metadata } from "next"
import { Bricolage_Grotesque } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/sidebar/Sidebar"
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
    <html lang="en" className={`h-full ${bricolage.variable}`}>
      <body className="h-screen flex bg-[#f5f6f8] p-4 gap-4 font-sans antialiased overflow-hidden text-gray-900">
        <Providers>
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 transition-all">{children}</div>
        </Providers>
      </body>
    </html>
  )
}

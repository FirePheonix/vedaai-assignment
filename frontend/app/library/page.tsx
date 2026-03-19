import Header from "@/components/ui/Header"

export default function LibraryPage() {
  return (
    <>
      <Header breadcrumb="My Library" showBack={false} />
      <main className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        My Library — coming soon
      </main>
    </>
  )
}

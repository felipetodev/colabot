
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative mt-5 py-5 px-4 bg-[#18181a] text-white rounded-lg">
      {children}
    </main>
  )
}

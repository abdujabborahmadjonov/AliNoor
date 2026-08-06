import AuthGate from '@/app/components/AuthGate'

// The sections that hold personal data share one gate. It lives in the layout
// rather than in each page so that moving between Today, Habits, Learning,
// Statistics and Settings keeps the same mounted instance — wrapping each page
// individually re-ran the session check and blocked every tab switch behind a
// full-screen "syncing your data" spinner.
export default function GatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGate>{children}</AuthGate>
}

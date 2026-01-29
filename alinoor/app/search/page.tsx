import { Suspense } from 'react'
import SearchClient from './SearchClient'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SearchClient />
    </Suspense>
  )
}
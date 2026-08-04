'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ThemeToggle from '@/app/components/ThemeToggle'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/login')
    router.refresh()
  }

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setQuery('')
  }

  const avatar = user?.email?.[0]?.toUpperCase() || 'A'

  return (
    <nav className="w-full backdrop-blur-xl bg-bg/90 sticky top-0 z-50 border-b border-line">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* LEFT — wordmark */}
          <Link href="/" className="group flex items-baseline gap-2 flex-shrink-0">
            <span className="font-semibold text-xl tracking-tight text-ink group-hover:text-ink2 transition-colors">
              alinoor
            </span>
            <span className="font-hand text-lg text-ember leading-none hidden sm:inline">
              in the light
            </span>
          </Link>

          {/* CENTER — search */}
          <form onSubmit={onSearch} className="flex-1 max-w-sm hidden md:block">
            <div className="relative group">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search essays…"
                className="w-full border border-line rounded-lg px-4 py-2 pl-9 text-sm bg-panel text-ink placeholder:text-faint focus:outline-none focus:border-linestrong transition-colors"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-faint group-focus-within:text-mute transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </form>

          {/* RIGHT — actions */}
          <div className="flex items-center gap-2 relative flex-shrink-0">
            <Link
              href="/today"
              className="hidden sm:block px-4 py-2 rounded-lg border border-line text-ink2 text-sm font-medium hover:border-linestrong hover:text-ink transition-colors"
            >
              Today
            </Link>
            <ThemeToggle />

            {!user && (
              <>
                <Link
                  href="/write"
                  className="hidden sm:block px-4 py-2 rounded-lg border border-line text-ink2 text-sm font-medium hover:border-linestrong hover:text-ink transition-colors"
                >
                  Write
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg bg-ink text-bg text-sm font-medium hover:opacity-85 transition-opacity"
                >
                  Sign in
                </Link>
              </>
            )}

            {user && (
              <>
                <Link
                  href="/write"
                  className="px-4 py-2 rounded-lg bg-ink text-bg text-sm font-medium hover:opacity-85 transition-opacity"
                >
                  Write
                </Link>

                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-lg border border-linestrong bg-panel text-ink flex items-center justify-center font-semibold text-sm hover:bg-panel2 transition-colors"
                >
                  {avatar}
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    ></div>

                    <div className="absolute right-0 top-12 w-64 bg-panel rounded-xl border border-line overflow-hidden z-50 shadow-pop animate-in">
                      <div className="px-5 py-4 border-b border-line bg-panel2">
                        <p className="font-medium text-ink truncate text-sm">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-mute truncate font-mono mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1.5">
                        <Link
                          href="/my-articles"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-2.5 text-sm text-ink2 hover:text-ink hover:bg-panel2 transition-colors"
                        >
                          My articles
                        </Link>
                        <Link
                          href="/bookmarks"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-2.5 text-sm text-ink2 hover:text-ink hover:bg-panel2 transition-colors"
                        >
                          Bookmarks
                        </Link>
                      </div>

                      <div className="border-t border-line">
                        <button
                          onClick={logout}
                          className="w-full text-left px-5 py-3 text-sm text-ember hover:bg-panel2 transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

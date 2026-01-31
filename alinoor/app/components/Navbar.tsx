'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
    <nav className="w-full backdrop-blur-xl bg-white/90 sticky top-0 z-50 border-b border-black/10">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between gap-8">
          {/* LEFT - Logo with elegant styling */}
          <Link
            href="/"
            className="group flex items-center gap-3 flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white text-xl font-black">A</span>
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-black group-hover:opacity-70 transition-opacity">
              AliNoor
            </span>
          </Link>

          {/* CENTER - Search with refined input */}
          <form onSubmit={onSearch} className="flex-1 max-w-md">
            <div className="relative group">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                className="
                  w-full
                  border border-black/20
                  rounded-full
                  px-5 py-3
                  pl-12
                  text-sm
                  text-black
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:border-black
                  focus:shadow-lg
                  transition-all
                  duration-300
                  bg-white
                  hover:border-black/40
                "
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </form>

          {/* RIGHT - Actions with elegant buttons */}
          <div className="flex items-center gap-3 relative flex-shrink-0">
            {!user && (
              <>
                <Link
                  href="/write"
                  className="hidden sm:block px-6 py-2.5 rounded-full border border-black/20 text-black font-semibold hover:bg-black/5 hover:border-black transition-all duration-300"
                >
                  Write
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-2.5 rounded-full bg-black text-white font-semibold hover:bg-gray-800 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Sign In
                </Link>
              </>
            )}

            {user && (
              <>
                <Link
                  href="/write"
                  className="px-6 py-2.5 rounded-full bg-black text-white font-semibold hover:bg-gray-800 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Write
                </Link>

                {/* Avatar with circle design */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-11 h-11 rounded-full border-2 border-black bg-white text-black flex items-center justify-center font-black text-lg hover:bg-black hover:text-white transition-all duration-300 hover:scale-110 shadow-md hover:shadow-xl"
                >
                  {avatar}
                </button>

                {/* Dropdown with elegant styling */}
                {menuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
                      onClick={() => setMenuOpen(false)}
                    ></div>
                    
                    <div className="absolute right-0 top-16 w-72 bg-white rounded-3xl border border-black/10 overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-6 py-5 border-b border-black/10 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-full border-2 border-black bg-white text-black flex items-center justify-center font-black text-xl shadow-md">
                            {avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-black truncate text-sm">
                              {user.user_metadata?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          href="/my-articles"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-6 py-3.5 text-black hover:bg-gray-50 transition-all group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">📝</span>
                          <span className="font-semibold">My Articles</span>
                        </Link>

                        <Link
                          href="/drafts"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-6 py-3.5 text-black hover:bg-gray-50 transition-all group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">💾</span>
                          <span className="font-semibold">Drafts</span>
                        </Link>

                        <Link
                          href="/bookmarks"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-6 py-3.5 text-black hover:bg-gray-50 transition-all group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">🔖</span>
                          <span className="font-semibold">Bookmarks</span>
                        </Link>

                        <Link
                          href="/settings"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-6 py-3.5 text-black hover:bg-gray-50 transition-all group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">⚙️</span>
                          <span className="font-semibold">Settings</span>
                        </Link>
                      </div>

                      <div className="border-t border-black/10">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-6 py-4 text-black hover:bg-red-50 transition-all group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">⎋</span>
                          <span className="font-semibold">Sign out</span>
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

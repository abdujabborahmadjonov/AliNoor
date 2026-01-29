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
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    window.location.href = '/login'
  }

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setQuery('')
  }

  const avatar = user?.email?.[0]?.toUpperCase() || 'A'

  return (
    <nav className="w-full border-b border-black/20 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-3 items-center">
        
        {/* LEFT — Logo */}
        <Link
          href="/"
          className="font-serif text-xl font-semibold text-black"
        >
          Alinoor
        </Link>

        {/* CENTER — Search */}
        <form onSubmit={onSearch} className="flex justify-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            className="
              w-full max-w-xs
              border border-black/30
              rounded-full
              px-4 py-1.5
              text-sm
              text-black
              placeholder:text-black/40
              focus:outline-none
              focus:border-black
            "
          />
        </form>

        {/* RIGHT — Actions */}
        <div className="flex justify-end items-center gap-3 relative">
          {!user && (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full border border-black text-black hover:bg-black hover:text-white transition"
            >
              Sign In
            </Link>
          )}

          {user && (
            <>
              <Link
                href="/write"
                className="px-4 py-2 rounded-full bg-black text-white hover:bg-zinc-800 transition"
              >
                Write
              </Link>

              {/* Avatar */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-medium"
              >
                {avatar}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white border border-black/20 rounded-xl shadow-md overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-black/10">
                    <p className="text-sm font-medium text-black truncate">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/my-articles"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-black hover:bg-black/5"
                  >
                    My Articles
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-black/5"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
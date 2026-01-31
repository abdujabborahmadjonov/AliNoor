'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  const signOut = async () => {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  const initial = user.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className="relative" ref={ref}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 border-2 border-black bg-white text-black flex items-center justify-center font-black text-lg hover:bg-black hover:text-white transition-all"
      >
        {initial}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          ></div>

          {/* Menu */}
          <div className="absolute right-0 top-14 w-72 bg-white border-2 border-black overflow-hidden z-50">
            {/* User info */}
            <div className="px-6 py-5 border-b border-black bg-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 border-2 border-black bg-white text-black flex items-center justify-center font-black text-xl">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-black truncate">
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-sm text-gray-600 truncate font-medium">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="py-2">
              <Link
                href="/my-articles"
                className="flex items-center gap-3 px-6 py-3 text-black hover:bg-gray-100 transition-colors group"
                onClick={() => setOpen(false)}
              >
                <span className="text-xl">📝</span>
                <span className="font-bold">My Articles</span>
              </Link>

              <Link
                href="/drafts"
                className="flex items-center gap-3 px-6 py-3 text-black hover:bg-gray-100 transition-colors group"
                onClick={() => setOpen(false)}
              >
                <span className="text-xl">💾</span>
                <span className="font-bold">Drafts</span>
              </Link>

              <Link
                href="/bookmarks"
                className="flex items-center gap-3 px-6 py-3 text-black hover:bg-gray-100 transition-colors group"
                onClick={() => setOpen(false)}
              >
                <span className="text-xl">🔖</span>
                <span className="font-bold">Bookmarks</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 px-6 py-3 text-black hover:bg-gray-100 transition-colors group"
                onClick={() => setOpen(false)}
              >
                <span className="text-xl">⚙️</span>
                <span className="font-bold">Settings</span>
              </Link>
            </div>

            {/* Sign out */}
            <div className="border-t border-black">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-6 py-4 text-black hover:bg-gray-100 transition-colors group"
              >
                <span className="text-xl">⎋</span>
                <span className="font-bold">Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

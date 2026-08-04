'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import ThemeToggle from '@/app/components/ThemeToggle'
import { loadSettings } from '@/lib/store'

const NAV = [
  { href: '/today/', label: 'Today', group: 'live' },
  { href: '/habits/', label: 'Habits', group: 'live' },
  { href: '/learning/', label: 'Learning', group: 'live' },
  { href: '/stats/', label: 'Statistics', group: 'live' },
  { href: '/quran/', label: 'Quran', group: 'read' },
  { href: '/hadith/', label: 'Hadith', group: 'read' },
  { href: '/arabic/', label: 'Arabic', group: 'read' },
  { href: '/', label: 'Essays', group: 'write' },
  { href: '/write/', label: 'Write', group: 'write' },
  { href: '/settings/', label: 'Settings', group: 'sys' },
]

export default function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  const pathname = usePathname() || ''
  const [city, setCity] = useState('')
  const [madhab, setMadhab] = useState('')

  useEffect(() => {
    const s = loadSettings()
    setCity(s.city)
    setMadhab(s.madhab)
  }, [])

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/' || pathname === ''
      : pathname.replace(/\/$/, '') === href.replace(/\/$/, '')

  const groups: Array<{ key: string; items: typeof NAV }> = [
    { key: 'live', items: NAV.filter((n) => n.group === 'live') },
    { key: 'read', items: NAV.filter((n) => n.group === 'read') },
    { key: 'write', items: NAV.filter((n) => n.group === 'write') },
    { key: 'sys', items: NAV.filter((n) => n.group === 'sys') },
  ]

  return (
    <div className="min-h-screen bg-bg flex">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-60 flex-col border-r border-line bg-bg sticky top-0 h-screen px-4 py-6">
        <Link href="/" className="flex items-baseline gap-2 px-2 mb-6">
          <span className="font-semibold text-lg tracking-tight text-ink">
            alinoor
          </span>
          <span className="font-hand text-base text-ember leading-none">
            in the light
          </span>
        </Link>

        <p className="microlabel px-2 mb-2">live mindfully</p>

        <nav className="flex-1 space-y-4">
          {groups.map((g) => (
            <div key={g.key} className={g.key !== 'live' ? 'pt-3 border-t border-line' : ''}>
              {g.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-2 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-panel border border-line text-ink font-medium shadow-card'
                      : 'text-ink3 hover:text-ink'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="pt-4 border-t border-line space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="microlabel">theme</span>
            <ThemeToggle />
          </div>
          {city && (
            <p className="font-mono text-[11px] text-mute px-2">
              {city} · {madhab}
            </p>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-40 bg-bg/90 backdrop-blur-xl border-b border-line px-4 py-3 flex items-center gap-3 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm whitespace-nowrap ${
                isActive(item.href) ? 'text-ink font-medium' : 'text-ink3'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <header className="border-b border-line px-6 sm:px-10 py-5 flex items-baseline gap-4">
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
          {subtitle && (
            <span className="font-mono text-[12px] text-mute">{subtitle}</span>
          )}
        </header>

        <main className="px-6 sm:px-10 py-8 max-w-5xl">{children}</main>
      </div>
    </div>
  )
}

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

// Bottom tab bar (mobile): four primary destinations + a More sheet.
const TABS = [
  { href: '/today/', label: 'Today' },
  { href: '/habits/', label: 'Habits' },
  { href: '/quran/', label: 'Quran' },
  { href: '/', label: 'Essays' },
]

const MORE = [
  { href: '/learning/', label: 'Learning' },
  { href: '/stats/', label: 'Statistics' },
  { href: '/hadith/', label: 'Hadith' },
  { href: '/arabic/', label: 'Arabic' },
  { href: '/write/', label: 'Write' },
  { href: '/settings/', label: 'Settings' },
]

const TabIcon = ({ name, active }: { name: string; active: boolean }) => {
  const cls = `w-5 h-5 ${active ? 'text-ink' : 'text-mute'}`
  const sw = 1.7
  switch (name) {
    case 'Today':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <circle cx="12" cy="12" r="8.5" />
          <path strokeLinecap="round" d="M12 7.5V12l3 2" />
        </svg>
      )
    case 'Habits':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'Quran':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5C10.5 5 8 4.5 5 4.5v13c3 0 5.5.5 7 2 1.5-1.5 4-2 7-2v-13c-3 0-5.5.5-7 2z" />
          <path strokeLinecap="round" d="M12 6.5v13" />
        </svg>
      )
    case 'Essays':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.5l3 3L8 19l-4 1 1-4L16.5 4.5z" />
        </svg>
      )
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
      )
  }
}

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
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    const s = loadSettings()
    setCity(s.city)
    setMadhab(s.madhab)
  }, [])

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/' || pathname === ''
      : pathname.replace(/\/$/, '') === href.replace(/\/$/, '')

  const moreActive = MORE.some((m) => isActive(m.href))

  const groups: Array<{ key: string; items: typeof NAV }> = [
    { key: 'live', items: NAV.filter((n) => n.group === 'live') },
    { key: 'read', items: NAV.filter((n) => n.group === 'read') },
    { key: 'write', items: NAV.filter((n) => n.group === 'write') },
    { key: 'sys', items: NAV.filter((n) => n.group === 'sys') },
  ]

  return (
    <div className="min-h-screen bg-bg flex">
      {/* DESKTOP SIDEBAR */}
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
            <div
              key={g.key}
              className={g.key !== 'live' ? 'pt-3 border-t border-line' : ''}
            >
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
        {/* Mobile top bar — wordmark + theme */}
        <div className="md:hidden sticky top-0 z-40 bg-bg/90 backdrop-blur-xl border-b border-line px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-semibold text-lg tracking-tight text-ink">
              alinoor
            </span>
            <span className="font-hand text-sm text-ember leading-none">
              in the light
            </span>
          </Link>
          <ThemeToggle />
        </div>

        <header className="border-b border-line px-4 sm:px-10 py-4 sm:py-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
          {subtitle && (
            <span className="font-mono text-[11px] sm:text-[12px] text-mute">
              {subtitle}
            </span>
          )}
        </header>

        <main className="px-4 sm:px-10 py-6 sm:py-8 max-w-5xl pb-28 md:pb-8">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-bg/95 backdrop-blur-xl border-t border-line pb-[env(safe-area-inset-bottom)]">
        {moreOpen && (
          <>
            <div
              className="fixed inset-0 -z-10"
              onClick={() => setMoreOpen(false)}
            />
            <div className="absolute bottom-full inset-x-3 mb-2 bg-panel border border-line rounded-xl shadow-pop p-2 grid grid-cols-2 gap-1">
              {MORE.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setMoreOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm transition-colors ${
                    isActive(m.href)
                      ? 'bg-panel2 text-ink font-medium'
                      : 'text-ink2'
                  }`}
                >
                  {m.label}
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="grid grid-cols-5">
          {TABS.map((t) => {
            const active = isActive(t.href)
            return (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-1 py-2.5"
              >
                <TabIcon name={t.label} active={active} />
                <span
                  className={`text-[10px] font-medium ${
                    active ? 'text-ink' : 'text-mute'
                  }`}
                >
                  {t.label}
                </span>
              </Link>
            )
          })}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex flex-col items-center gap-1 py-2.5"
          >
            <TabIcon name="More" active={moreOpen || moreActive} />
            <span
              className={`text-[10px] font-medium ${
                moreOpen || moreActive ? 'text-ink' : 'text-mute'
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </div>
  )
}

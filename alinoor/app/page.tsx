'use client'

import Link from 'next/link'
import ThemeToggle from '@/app/components/ThemeToggle'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <span className="flex items-baseline gap-2">
          <span className="font-semibold text-xl tracking-tight text-ink">
            alinoor
          </span>
          <span className="font-hand text-base text-ember leading-none">
            in the light
          </span>
        </span>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-16">
        <p className="microlabel mb-6 animate-in">live mindfully · write thoughtfully</p>

        <h1 className="text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tight text-ink animate-in">
          alinoor
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-ink3 max-w-md leading-relaxed animate-in">
          A prayer-anchored day on one side. A quiet home for essays on the
          other.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full max-w-md animate-in">
          <Link
            href="/essays"
            className="flex-1 px-8 py-5 bg-ink text-bg rounded-xl font-medium text-lg hover:opacity-85 transition-opacity"
          >
            Essays
            <span className="block font-mono text-[11px] opacity-70 mt-1 font-normal">
              read &amp; write
            </span>
          </Link>
          <Link
            href="/today"
            className="flex-1 px-8 py-5 border border-linestrong text-ink rounded-xl font-medium text-lg hover:bg-panel transition-colors"
          >
            Today
            <span className="block font-mono text-[11px] text-mute mt-1 font-normal">
              prayers &amp; tasks
            </span>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 animate-in">
          {[
            ['/quran', 'Quran'],
            ['/hadith', 'Hadith'],
            ['/arabic', 'Arabic'],
            ['/habits', 'Habits'],
            ['/stats', 'Statistics'],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="font-mono text-[12px] text-mute hover:text-ink transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        <p className="mt-16 font-hand text-2xl text-mute rotate-[-1deg] animate-in">
          nūr — light, the kind you read by
        </p>
      </main>

      <footer className="px-6 py-6 text-center">
        <p className="font-mono text-[11px] text-faint">
          © {new Date().getFullYear()} AliNoor
        </p>
      </footer>
    </div>
  )
}

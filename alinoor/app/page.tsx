'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/app/components/ThemeToggle'
import PrayerRing from '@/app/components/PrayerRing'
import { findCity } from '@/lib/cities'
import { fmtTime, maghribDay, timesFor } from '@/lib/prayer'
import { CATEGORY_DOT, loadSettings } from '@/lib/store'
import type { AppSettings } from '@/lib/store'
import { supabase } from '@/lib/supabase'

const SectionRule = ({ n, label }: { n: string; label: string }) => (
  <div className="flex items-center gap-4 mb-14">
    <span className="font-mono text-[12px] text-ink3">— {n} —</span>
    <span className="font-mono text-[12px] tracking-[0.2em] text-mute uppercase">
      {label}
    </span>
    <div className="flex-1 h-px bg-line" />
  </div>
)

const AXES = [
  { key: 'spiritual', label: 'Spiritual', desc: 'Salah, Qur’an, dhikr.' },
  { key: 'physical', label: 'Physical', desc: 'Walk, rest, train, drink water.' },
  { key: 'social', label: 'Social', desc: 'Family, friends, ties of kinship.' },
  { key: 'financial', label: 'Financial', desc: 'Earn lawfully, give sadaqah.' },
  { key: 'educational', label: 'Educational', desc: 'Read, study, teach.' },
] as const

export default function LandingPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [now, setNow] = useState(new Date())
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setSettings(loadSettings())
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    )
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => {
      clearInterval(t)
      authListener.subscription.unsubscribe()
    }
  }, [])

  const city = settings ? findCity(settings.city) : null
  const day = useMemo(
    () => (settings ? maghribDay(settings, now) : null),
    [settings, now]
  )
  const times = useMemo(
    () => (settings ? timesFor(settings, now) : null),
    [settings, now]
  )

  const hijri = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
      }).format(now)
    } catch {
      return ''
    }
  }, [now])

  return (
    <div className="min-h-screen bg-bg">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-xl border-b border-line">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <span className="flex items-baseline gap-2">
            <span className="font-semibold text-xl tracking-tight text-ink">
              alinoor
            </span>
            <span className="font-hand text-base text-ember leading-none">
              in the light
            </span>
          </span>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/essays" className="hidden sm:block text-sm text-ink3 hover:text-ink transition-colors">
              Essays
            </Link>
            <Link href="/today" className="hidden sm:block text-sm text-ink3 hover:text-ink transition-colors">
              Today
            </Link>
            <Link href="/quran" className="hidden md:block text-sm text-ink3 hover:text-ink transition-colors">
              Quran
            </Link>
            <Link href="/habits" className="hidden md:block text-sm text-ink3 hover:text-ink transition-colors">
              Habits
            </Link>
            <ThemeToggle />
            {user ? (
              <>
                <Link
                  href="/settings"
                  title={user.email}
                  className="w-9 h-9 rounded-lg border border-linestrong bg-panel text-ink flex items-center justify-center font-semibold text-sm hover:bg-panel2 transition-colors"
                >
                  {(user.user_metadata?.full_name || user.email || 'A')[0].toUpperCase()}
                </Link>
                <Link
                  href="/today"
                  className="px-4 py-2 rounded-lg bg-ink text-bg text-sm font-medium hover:opacity-85 transition-opacity"
                >
                  Open app →
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-ink text-bg text-sm font-medium hover:opacity-85 transition-opacity"
              >
                Sign in →
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <p className="microlabel mb-8 animate-in">bismillah.</p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.02] text-ink animate-in">
            Live the day
            <br />
            by its <span className="relative inline-block">light<span className="absolute -bottom-1.5 left-0 right-0 h-[4px] bg-warn/70 rounded-full"></span></span>.
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-ink3 max-w-md leading-relaxed animate-in">
            Prayers anchor the hours. Tasks find their places between them.
            Essays fill the quiet in between.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 max-w-md animate-in">
            <Link
              href="/essays"
              className="flex-1 px-8 py-5 bg-ink text-bg rounded-xl font-medium text-lg hover:opacity-85 transition-opacity text-center"
            >
              Essays
              <span className="block font-mono text-[11px] opacity-70 mt-1 font-normal">
                read &amp; write
              </span>
            </Link>
            <Link
              href="/today"
              className="flex-1 px-8 py-5 border border-linestrong text-ink rounded-xl font-medium text-lg hover:bg-panel transition-colors text-center"
            >
              Today
              <span className="block font-mono text-[11px] text-mute mt-1 font-normal">
                prayers &amp; tasks
              </span>
            </Link>
          </div>

          <p className="mt-12 font-hand text-2xl text-mute rotate-[-1deg] inline-block animate-in">
            nūr — light, the kind you read by
          </p>
        </div>

        <div className="max-w-sm w-full mx-auto lg:mx-0 lg:justify-self-end">
          {settings && city && day && times ? (
            <PrayerRing times={times} city={city} now={now} next={day.next} />
          ) : (
            <div className="aspect-square rounded-full border border-line" />
          )}
        </div>
      </section>

      {/* 01 · PLANNING */}
      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
          <SectionRule n="01" label="Planning" />
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink leading-tight">
                A day with Salah
                <br />
                as its spine.
              </h2>
              <p className="mt-6 text-ink3 leading-relaxed max-w-md">
                The Islamic day already runs sunset to sunset. Plan inside it:
                anchor what matters after each adhan, keep the short Asr window
                honest, and guard the stillness after Fajr.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {['Anchor tasks to Salah times', 'Plan any day from the calendar', 'Synced across your devices'].map(
                  (t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 border border-line rounded-lg font-mono text-[11px] text-mute"
                    >
                      · {t}
                    </span>
                  )
                )}
              </div>
            </div>

            {settings && city && day && (
              <div className="bg-panel border border-line rounded-xl shadow-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-[12px] text-mute">
                    <span className="text-ink font-semibold">Today</span>
                    {hijri ? ` · ${hijri}` : ''} · {city.name}
                  </p>
                  <span className="font-mono text-[10px] tracking-widest text-good uppercase">
                    live
                  </span>
                </div>
                <div className="space-y-1.5">
                  {day.sequence.map((p) => (
                    <div
                      key={`${p.name}${p.time.getTime()}`}
                      className={`flex items-center gap-4 border rounded-lg px-4 py-2.5 ${
                        day.current.name === p.name
                          ? 'border-ember/50'
                          : 'border-line'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-linestrong" />
                      <span className="font-medium text-ink text-sm w-20">
                        {p.name}
                      </span>
                      <span className="font-mono text-[12px] text-ink3">
                        {fmtTime(p.time, city.tz)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AYAH INTERLUDE */}
      <section className="border-t border-line bg-panel2/50">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p dir="rtl" lang="ar" className="font-quran text-3xl sm:text-4xl leading-[2.2] text-ink">
            أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ
          </p>
          <p className="mt-6 text-lg text-ink2">
            Truly, in the remembrance of Allah do hearts find rest.
          </p>
          <p className="mt-2 font-mono text-[11px] text-mute">
            Ar-Raʿd · 13:28
          </p>
        </div>
      </section>

      {/* 02 · BALANCE */}
      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
          <SectionRule n="02" label="Balance" />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-panel border border-line rounded-xl shadow-card p-8 max-w-sm mx-auto lg:mx-0 w-full">
              <svg viewBox="0 0 220 220" className="w-full">
                {[0.33, 0.66, 1].map((s) => (
                  <polygon
                    key={s}
                    points={Array.from({ length: 5 }, (_, i) => {
                      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
                      return `${110 + Math.cos(a) * 80 * s},${110 + Math.sin(a) * 80 * s}`
                    }).join(' ')}
                    fill="none"
                    stroke="rgb(var(--an-line))"
                  />
                ))}
                <polygon
                  points={[0.9, 0.65, 0.75, 0.5, 0.8]
                    .map((v, i) => {
                      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
                      return `${110 + Math.cos(a) * 80 * v},${110 + Math.sin(a) * 80 * v}`
                    })
                    .join(' ')}
                  fill="rgb(var(--an-ember) / 0.14)"
                  stroke="rgb(var(--an-ember))"
                  strokeWidth="1.5"
                />
                {AXES.map((ax, i) => {
                  const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
                  return (
                    <text
                      key={ax.key}
                      x={110 + Math.cos(a) * 98}
                      y={110 + Math.sin(a) * 98}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fill="rgb(var(--an-ink3))"
                    >
                      {ax.label}
                    </text>
                  )
                })}
              </svg>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink leading-tight">
                Five axes.
                <br />
                One balanced life.
              </h2>
              <p className="mt-6 text-ink3 leading-relaxed max-w-md">
                Moderation is the Sunnah of this deen. Every habit and task
                belongs to an axis — and the statistics show, gently, where the
                balance leans.
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-3">
                {AXES.map((ax) => (
                  <div
                    key={ax.key}
                    className="flex items-start gap-3 bg-panel border border-line rounded-lg px-4 py-3"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 ${CATEGORY_DOT[ax.key]}`}
                    />
                    <div>
                      <p className="text-sm font-medium text-ink">{ax.label}</p>
                      <p className="font-mono text-[11px] text-mute mt-0.5">
                        {ax.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DUA INTERLUDE */}
      <section className="border-t border-line bg-panel2/50">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="microlabel mb-6">a duʿā for both worlds</p>
          <p dir="rtl" lang="ar" className="font-quran text-2xl sm:text-3xl leading-[2.3] text-ink">
            رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْـَٔاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ
          </p>
          <p className="mt-6 text-lg text-ink2 max-w-xl mx-auto">
            Our Lord, grant us good in this world and good in the Hereafter,
            and shield us from the Fire.
          </p>
          <p className="mt-2 font-mono text-[11px] text-mute">
            Al-Baqarah · 2:201
          </p>
        </div>
      </section>

      {/* 03 · HABITS */}
      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
          <SectionRule n="03" label="Habits" />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink leading-tight">
                Small deeds,
                <br />
                kept alive.
              </h2>
              <p className="mt-6 text-ink3 leading-relaxed max-w-md">
                Religion is ease — take up what you can sustain. A sixty-day
                rhythm across the five axes, with streaks that reward showing
                up, not showing off.
              </p>
              <p className="mt-6 font-hand text-2xl text-mute">
                the steadiest deed is the most beloved
              </p>
            </div>

            <div className="bg-panel border border-line rounded-xl shadow-card p-6">
              <p className="font-mono text-[12px] text-mute mb-4">
                Density · 60 days
              </p>
              {AXES.slice(0, 4).map((ax, r) => (
                <div key={ax.key} className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-[10px] text-mute w-20 truncate">
                    {ax.label}
                  </span>
                  <div className="flex gap-[3px] flex-1 overflow-hidden">
                    {Array.from({ length: 40 }, (_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-4 rounded-[2px] flex-shrink-0 ${
                          (i * 7 + r * 5) % 11 > 3
                            ? CATEGORY_DOT[ax.key]
                            : 'bg-panel2'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-line text-center">
                {[
                  ['60d', 'rhythm'],
                  ['5', 'axes'],
                  ['🔥', 'streaks'],
                ].map(([v, l]) => (
                  <div key={l}>
                    <p className="text-xl font-semibold text-ink">{v}</p>
                    <p className="font-mono text-[10px] text-mute uppercase tracking-widest mt-1">
                      {l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04 · DEEN */}
      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
          <SectionRule n="04" label="Qur'an · Sunnah · Arabic" />
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink leading-tight">
                Read, listen,
                <br />
                and understand.
              </h2>
              <p className="mt-6 text-ink3 leading-relaxed max-w-md">
                The whole Qur’an with Mishary Rashid Alafasy’s recitation, all
                of Sahih al-Bukhari book by book, and a starter vocabulary for
                the language of both.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  'All 114 surahs · Alafasy audio',
                  '7,563 hadith · 97 books',
                  'Mushaf-style Arabic type',
                ].map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1.5 border border-line rounded-lg font-mono text-[11px] text-mute"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {[
                ['/quran', 'Quran', 'ayat to live by · full mushaf · recitation'],
                ['/hadith', 'Hadith', 'Sahih al-Bukhari, complete'],
                ['/arabic', 'Arabic', 'the words you meet most'],
              ].map(([href, title, sub]) => (
                <Link
                  key={href}
                  href={href}
                  className="group bg-panel border border-line hover:border-linestrong rounded-xl shadow-card px-6 py-5 transition-colors"
                >
                  <p className="font-medium text-ink group-hover:text-ink2">
                    {title} →
                  </p>
                  <p className="font-mono text-[11px] text-mute mt-1">{sub}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 05 · ESSAYS — the big one */}
      <section className="border-t border-line bg-panel2/50">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <SectionRule n="05" label="Essays" />
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-ink leading-tight">
            152 essays.
            <br />
            Written slowly, read whole.
          </h2>
          <p className="mt-6 text-ink3 leading-relaxed max-w-lg mx-auto">
            The <em>Parallel muhit</em> collection by Aziz Rahimov — on
            conversations, patience, purpose, and the quiet art of living —
            alongside a place to write your own.
          </p>
          <Link
            href="/essays"
            className="mt-10 inline-block px-16 py-6 bg-ink text-bg rounded-2xl font-semibold text-2xl hover:opacity-85 transition-opacity shadow-pop"
          >
            Open the essays →
          </Link>
          <p className="mt-4 font-mono text-[11px] text-mute">
            ten per page · illustrated covers · Uzbek
          </p>
        </div>
      </section>

      {/* QUOTE INTERLUDE — night */}
      <section className="bg-[#141d2e] relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 py-28 text-center relative">
          <div className="w-16 h-16 rounded-full bg-[#efece2] mx-auto mb-12 shadow-pop" />
          <p className="text-2xl sm:text-3xl font-medium leading-snug text-[#efece2]">
            “Take account of yourselves
            <br />
            before you are taken to account.”
          </p>
          <p className="mt-8 font-mono text-[11px] tracking-[0.25em] uppercase text-[#8fa0bd]">
            — attributed to ʿUmar ibn al-Khaṭṭāb
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-line">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <p className="microlabel mb-6">mindfully start a new day</p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-ink leading-tight">
            Begin tonight,
            <br />
            at Maghrib.
          </h2>
          <p className="mt-6 text-ink3">
            One account — essays, prayers, habits, everything synced.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <>
                <Link
                  href="/today"
                  className="px-8 py-3.5 bg-ink text-bg rounded-xl font-medium hover:opacity-85 transition-opacity"
                >
                  Open Today →
                </Link>
                <Link
                  href="/essays"
                  className="px-8 py-3.5 border border-linestrong text-ink rounded-xl font-medium hover:bg-panel transition-colors"
                >
                  Read the essays
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-8 py-3.5 bg-ink text-bg rounded-xl font-medium hover:opacity-85 transition-opacity"
                >
                  Sign in →
                </Link>
                <Link
                  href="/signup"
                  className="px-8 py-3.5 border border-linestrong text-ink rounded-xl font-medium hover:bg-panel transition-colors"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="flex items-baseline gap-2">
            <span className="font-semibold text-ink">alinoor</span>
            <span className="font-hand text-sm text-ember leading-none">
              in the light
            </span>
          </span>
          <p className="font-mono text-[11px] text-faint">
            © {new Date().getFullYear()} AliNoor · nūr — light, the kind you read by
          </p>
        </div>
      </footer>
    </div>
  )
}

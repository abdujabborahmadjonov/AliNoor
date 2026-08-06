'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import AppShell from '@/app/components/AppShell'
import { QURAN_THEMES } from '@/lib/content'

type Ayah = {
  ref: string
  surahName: string
  ar: string
  en: string
  audio: string
}

type FullAyah = { n: number; ar: string; en: string; audio: string }

type SurahInfo = {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: string
}

const API = 'https://api.alquran.cloud/v1'
// Uthmani Arabic + public-domain Pickthall translation + Alafasy recitation.
const EDITIONS = 'quran-uthmani,en.pickthall,ar.alafasy'

// Rejects on a bad status so an error body can't be destructured into a blank panel.
const fetchAyah = async (ref: string, signal?: AbortSignal): Promise<Ayah> => {
  const res = await fetch(`${API}/ayah/${ref}/editions/${EDITIONS}`, { signal })
  if (!res.ok) throw new Error(`alquran.cloud ${res.status}`)
  const json = await res.json()
  const [ar, en, audio] = json.data
  return {
    ref,
    surahName: ar.surah.englishName,
    ar: ar.text,
    en: en.text,
    audio: audio.audio || '',
  }
}

const isAbort = (e: unknown) => (e as { name?: string })?.name === 'AbortError'

// One shared player so a new ayah stops the previous one.
// onStart stops the continuous-recitation player — only one of the two may sound at a time.
const usePlayer = (onStart: () => void) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)

  const stop = () => {
    audioRef.current?.pause()
    audioRef.current = null
    setPlaying(null)
  }

  const toggle = (key: string, url: string) => {
    if (!url) return
    if (playing === key) {
      stop()
      return
    }
    audioRef.current?.pause()
    onStart()
    const a = new Audio(url)
    audioRef.current = a
    a.onended = () => setPlaying(null)
    a.play().catch(() => setPlaying(null))
    setPlaying(key)
  }

  useEffect(() => () => audioRef.current?.pause(), [])
  return { playing, toggle, stop }
}

const ErrorRetry = ({
  onRetry,
  className = '',
}: {
  onRetry: () => void
  className?: string
}) => (
  <div className={`text-sm text-mute ${className}`}>
    <p>Couldn&apos;t reach alquran.cloud.</p>
    <button
      onClick={onRetry}
      className="mt-3 px-4 py-2 rounded-lg border border-line text-ink2 text-sm hover:border-linestrong hover:text-ink transition-colors"
    >
      Retry
    </button>
  </div>
)

const PlayButton = ({
  active,
  onClick,
}: {
  active: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    aria-label={active ? 'Pause recitation' : 'Play recitation'}
    title="Mishary Rashid Alafasy"
    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 ${
      active
        ? 'bg-ink text-bg border-ink'
        : 'border-line text-ink3 hover:border-linestrong hover:text-ink'
    }`}
  >
    {active ? (
      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
        <rect x="2" y="1" width="3" height="10" rx="1" />
        <rect x="7" y="1" width="3" height="10" rx="1" />
      </svg>
    ) : (
      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
        <path d="M2.5 1.5v9l8-4.5z" />
      </svg>
    )}
  </button>
)

export default function QuranPage() {
  const [mode, setMode] = useState<'themes' | 'surahs'>('themes')

  // Whole-surah reading + continuous listening
  const [playIdx, setPlayIdx] = useState<number | null>(null)
  const seqRef = useRef<HTMLAudioElement | null>(null)
  const reqRef = useRef(0)

  // Bumping the request generation also cancels an in-flight load that would start audio.
  const stopSequence = useCallback(() => {
    reqRef.current++
    seqRef.current?.pause()
    seqRef.current = null
    setPlayIdx(null)
  }, [])

  const { playing, toggle, stop: stopAyah } = usePlayer(stopSequence)

  // themes
  const [themeKey, setThemeKey] = useState(QURAN_THEMES[0].key)
  const [ayat, setAyat] = useState<Ayah[]>([])
  const [themeLoading, setThemeLoading] = useState(true)
  const [themeError, setThemeError] = useState(false)
  const [themeReload, setThemeReload] = useState(0)

  // surah browser — one ayah is fetched only when tapped
  const [surahs, setSurahs] = useState<SurahInfo[]>([])
  const [surahsError, setSurahsError] = useState(false)
  const [surahsReload, setSurahsReload] = useState(0)
  const [surahNo, setSurahNo] = useState(1)
  const [openAyah, setOpenAyah] = useState<number | null>(null)
  const [ayahLoading, setAyahLoading] = useState(false)
  const [cache, setCache] = useState<Record<string, Ayah>>({})
  const pendingAyahRef = useRef<string | null>(null)

  const [surahView, setSurahView] = useState<'byayah' | 'full'>('byayah')
  const [fullAyat, setFullAyat] = useState<FullAyah[]>([])
  const [fullLoading, setFullLoading] = useState(false)
  const [fullError, setFullError] = useState(false)
  const [fullFor, setFullFor] = useState(0)

  // Returns the generation id so the caller can tell whether its load is still the current one.
  const loadFullSurah = async (
    n: number
  ): Promise<{ id: number; list: FullAyah[] }> => {
    if (fullFor === n && fullAyat.length)
      return { id: reqRef.current, list: fullAyat }
    const id = ++reqRef.current
    setFullLoading(true)
    setFullError(false)
    try {
      const res = await fetch(`${API}/surah/${n}/editions/${EDITIONS}`)
      if (!res.ok) throw new Error(`alquran.cloud ${res.status}`)
      const j = await res.json()
      if (id !== reqRef.current) return { id, list: [] }
      const [ar, en, audio] = j.data
      const list: FullAyah[] = ar.ayahs.map((a: any, i: number) => ({
        n: a.numberInSurah,
        ar: a.text,
        en: en.ayahs[i]?.text || '',
        audio: audio.ayahs[i]?.audio || '',
      }))
      setFullAyat(list)
      setFullFor(n)
      setFullLoading(false)
      return { id, list }
    } catch {
      if (id !== reqRef.current) return { id, list: [] }
      setFullLoading(false)
      setFullError(true)
      return { id, list: [] }
    }
  }

  const playFrom = (i: number, list: FullAyah[]) => {
    seqRef.current?.pause()
    // Some ayat come back without a recitation URL — skip them rather than end the surah.
    let j = i
    while (j < list.length && !list[j]?.audio) j++
    if (j >= list.length) {
      setPlayIdx(null)
      return
    }
    stopAyah()
    const a = new Audio(list[j].audio)
    seqRef.current = a
    setPlayIdx(j)
    a.onended = () => playFrom(j + 1, list)
    a.play().catch(() => setPlayIdx(null))
  }

  useEffect(() => () => seqRef.current?.pause(), [])

  const theme = QURAN_THEMES.find((t) => t.key === themeKey)!
  const surah = surahs.find((s) => s.number === surahNo)
  const openRef = openAyah ? `${surahNo}:${openAyah}` : null
  const openData = openRef ? cache[openRef] : null

  useEffect(() => {
    const ctl = new AbortController()
    setThemeLoading(true)
    setThemeError(false)
    Promise.all(theme.refs.map((r) => fetchAyah(r, ctl.signal)))
      .then((results) => {
        if (ctl.signal.aborted) return
        setAyat(results)
        setThemeLoading(false)
      })
      .catch((e) => {
        if (isAbort(e) || ctl.signal.aborted) return
        setThemeError(true)
        setThemeLoading(false)
      })
    return () => ctl.abort()
  }, [themeKey, theme.refs, themeReload])

  useEffect(() => {
    const ctl = new AbortController()
    setSurahsError(false)
    fetch(`${API}/surah`, { signal: ctl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`alquran.cloud ${r.status}`)
        return r.json()
      })
      .then((j) => setSurahs(j.data || []))
      .catch((e) => {
        if (isAbort(e) || ctl.signal.aborted) return
        setSurahsError(true)
      })
    return () => ctl.abort()
  }, [surahsReload])

  const openOne = async (n: number) => {
    const ref = `${surahNo}:${n}`
    setOpenAyah(n)
    if (cache[ref]) {
      pendingAyahRef.current = null
      setAyahLoading(false)
      return
    }
    pendingAyahRef.current = ref
    setAyahLoading(true)
    try {
      const a = await fetchAyah(ref)
      setCache((c) => ({ ...c, [ref]: a }))
    } catch {
      // the card offers a retry
    }
    // A newer tap owns the loading state now.
    if (pendingAyahRef.current !== ref) return
    pendingAyahRef.current = null
    setAyahLoading(false)
  }

  return (
    <AppShell title="Quran" subtitle="recitation · Mishary Rashid Alafasy">
      <div className="flex gap-2 mb-8">
        {(
          [
            ['themes', 'Ayat to live by'],
            ['surahs', 'All surahs'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              stopSequence()
              stopAyah()
              setMode(key)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              mode === key
                ? 'bg-ink text-bg border-ink'
                : 'border-line text-ink2 hover:border-linestrong'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'themes' && (
        <div className="grid md:grid-cols-[220px_1fr] gap-6 md:gap-8">
          {/* Mobile: horizontal theme chips */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            {QURAN_THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => setThemeKey(t.key)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-sm border transition-colors ${
                  t.key === themeKey
                    ? 'bg-ink text-bg border-ink'
                    : 'border-line text-ink2'
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>

          <div className="hidden md:block space-y-1">
            {QURAN_THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => setThemeKey(t.key)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 ${
                  t.key === themeKey
                    ? 'bg-panel border border-line text-ink font-medium shadow-card'
                    : 'text-ink3 hover:text-ink'
                }`}
              >
                <span className="truncate">{t.title}</span>
                <span className="font-mono text-[11px] text-faint">
                  {t.refs.length}
                </span>
              </button>
            ))}
            <p className="font-mono text-[10px] text-faint px-4 pt-4 leading-relaxed">
              Text + recitation via alquran.cloud
            </p>
          </div>

          <div>
            <div className="mb-6 pb-4 border-b border-line">
              <h2 className="text-xl font-semibold text-ink">{theme.title}</h2>
              <p className="text-sm text-ink3 mt-1">{theme.blurb}</p>
            </div>

            {themeLoading && (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}

            {!themeLoading && themeError && (
              <ErrorRetry
                className="py-8"
                onRetry={() => setThemeReload((r) => r + 1)}
              />
            )}

            <div className="space-y-4">
              {!themeLoading &&
                !themeError &&
                ayat.map((a) => (
                  <div
                    key={a.ref}
                    className="border-l-2 border-ember/60 bg-panel border border-line rounded-xl p-6 shadow-card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-mono text-[12px] text-mute">
                        {a.ref} · {a.surahName}
                      </p>
                      <PlayButton
                        active={playing === a.ref}
                        onClick={() => toggle(a.ref, a.audio)}
                      />
                    </div>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="font-quran text-3xl leading-[2.4] text-ink mb-4"
                    >
                      {a.ar}
                    </p>
                    <p className="text-[15px] leading-relaxed text-ink2">
                      {a.en}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {mode === 'surahs' && (
        <div className="grid md:grid-cols-[260px_1fr] gap-6 md:gap-8">
          {/* Mobile: surah dropdown */}
          <div className="md:hidden">
            <label className="microlabel block mb-2">Surah</label>
            <select
              value={surahNo}
              onChange={(e) => {
                const n = Number(e.target.value)
                setSurahNo(n)
                setOpenAyah(null)
                stopSequence()
                if (surahView === 'full') loadFullSurah(n)
              }}
              className="w-full px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm focus:outline-none focus:border-linestrong"
            >
              {surahs.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.englishName} · {s.numberOfAyahs} ayat
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:block space-y-0.5 max-h-[70vh] overflow-y-auto pr-1">
            {surahs.map((s) => (
              <button
                key={s.number}
                onClick={() => {
                  setSurahNo(s.number)
                  setOpenAyah(null)
                  stopSequence()
                  if (surahView === 'full') loadFullSurah(s.number)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                  s.number === surahNo
                    ? 'bg-panel border border-line text-ink font-medium shadow-card'
                    : 'text-ink3 hover:text-ink'
                }`}
              >
                <span className="font-mono text-[10px] text-faint w-6">
                  {s.number}
                </span>
                <span className="flex-1 truncate">{s.englishName}</span>
                <span dir="rtl" lang="ar" className="font-quran text-base text-ink3">
                  {s.name.replace('سُورَةُ ', '')}
                </span>
              </button>
            ))}
            {surahs.length === 0 &&
              (surahsError ? (
                <ErrorRetry
                  className="px-3 py-4"
                  onRetry={() => setSurahsReload((r) => r + 1)}
                />
              ) : (
                <p className="text-sm text-mute px-3 py-4">Loading surahs…</p>
              ))}
          </div>

          <div>
            {surah && (
              <div className="mb-6 pb-4 border-b border-line flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-ink">
                    {surah.number}. {surah.englishName}
                    <span className="text-ink3 font-normal">
                      {' '}
                      · {surah.englishNameTranslation}
                    </span>
                  </h2>
                  <p className="font-mono text-[11px] text-mute mt-1">
                    {surah.numberOfAyahs} ayat · {surah.revelationType} · tap a
                    number to load just that ayah
                  </p>
                </div>
                <span dir="rtl" lang="ar" className="font-quran text-2xl text-ink">
                  {surah.name}
                </span>
              </div>
            )}

            {/* Reading mode: tap-an-ayah or the whole surah with audio */}
            {surah && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <button
                  onClick={() => {
                    setSurahView('byayah')
                    stopSequence()
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    surahView === 'byayah'
                      ? 'bg-ink text-bg border-ink'
                      : 'border-line text-ink2 hover:border-linestrong'
                  }`}
                >
                  Ayah by ayah
                </button>
                <button
                  onClick={() => {
                    setSurahView('full')
                    loadFullSurah(surahNo)
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    surahView === 'full'
                      ? 'bg-ink text-bg border-ink'
                      : 'border-line text-ink2 hover:border-linestrong'
                  }`}
                >
                  Whole surah
                </button>
                {playIdx === null ? (
                  <button
                    onClick={async () => {
                      setSurahView('full')
                      const { id, list } = await loadFullSurah(surahNo)
                      if (id !== reqRef.current) return
                      playFrom(0, list)
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-ember text-bg hover:opacity-85 transition-opacity"
                  >
                    ▶ Listen to surah
                  </button>
                ) : (
                  <button
                    onClick={stopSequence}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-ember/50 text-ember hover:bg-ember/10 transition-colors"
                  >
                    ◼ Stop · ayah {fullAyat[playIdx]?.n}
                  </button>
                )}
              </div>
            )}

            {/* Ayah number chips — nothing downloads until one is tapped */}
            {surahView === 'byayah' && surah && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {Array.from({ length: surah.numberOfAyahs }, (_, i) => i + 1).map(
                  (n) => (
                    <button
                      key={n}
                      onClick={() => openOne(n)}
                      className={`min-w-[38px] px-2 py-1.5 rounded-lg border font-mono text-[12px] transition-colors ${
                        openAyah === n
                          ? 'bg-ink text-bg border-ink'
                          : cache[`${surahNo}:${n}`]
                            ? 'border-linestrong text-ink2 hover:text-ink'
                            : 'border-line text-mute hover:border-linestrong hover:text-ink'
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}
              </div>
            )}

            {surahView === 'byayah' && openAyah && (
              <div className="border-l-2 border-ember/60 bg-panel border border-line rounded-xl p-6 shadow-card">
                {ayahLoading && !openData ? (
                  <div className="py-8 text-center">
                    <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : openData ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-mono text-[12px] text-mute">
                        {openData.ref} · {openData.surahName}
                      </p>
                      <div className="flex items-center gap-2">
                        <PlayButton
                          active={playing === openData.ref}
                          onClick={() => toggle(openData.ref, openData.audio)}
                        />
                        <button
                          onClick={() =>
                            openAyah > 1 && openOne(openAyah - 1)
                          }
                          disabled={openAyah <= 1}
                          className="px-2.5 py-1.5 rounded-lg border border-line font-mono text-[11px] text-ink3 hover:text-ink disabled:opacity-40"
                        >
                          ←
                        </button>
                        <button
                          onClick={() =>
                            surah &&
                            openAyah < surah.numberOfAyahs &&
                            openOne(openAyah + 1)
                          }
                          disabled={!surah || openAyah >= surah.numberOfAyahs}
                          className="px-2.5 py-1.5 rounded-lg border border-line font-mono text-[11px] text-ink3 hover:text-ink disabled:opacity-40"
                        >
                          →
                        </button>
                      </div>
                    </div>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="font-quran text-[28px] leading-[2.4] text-ink mb-4"
                    >
                      {openData.ar}{' '}
                      <span className="text-ember text-lg">﴿{openAyah}﴾</span>
                    </p>
                    <p className="text-[15px] leading-relaxed text-ink2">
                      {openData.en}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-mute py-4">
                    Couldn&apos;t load this ayah — tap it again to retry.
                  </p>
                )}
              </div>
            )}

            {surahView === 'byayah' && !openAyah && surah && (
              <p className="font-hand text-2xl text-mute">
                tap an ayah number above — it loads only what you ask for
              </p>
            )}

            {/* Whole-surah reader with follow-along highlight */}
            {surahView === 'full' && (
              <div className="space-y-3">
                {fullLoading && (
                  <div className="py-16 text-center">
                    <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                )}
                {!fullLoading && fullError && (
                  <ErrorRetry
                    className="py-8"
                    onRetry={() => loadFullSurah(surahNo)}
                  />
                )}
                {!fullLoading &&
                  !fullError &&
                  fullAyat.map((a, i) => (
                    <div
                      key={a.n}
                      className={`bg-panel border rounded-xl p-5 shadow-card transition-colors ${
                        playIdx === i
                          ? 'border-ember bg-ember/5'
                          : 'border-line'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] text-mute">
                          {surahNo}:{a.n}
                        </span>
                        <button
                          onClick={() =>
                            playIdx === i ? stopSequence() : playFrom(i, fullAyat)
                          }
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] transition-colors ${
                            playIdx === i
                              ? 'bg-ember text-bg border-ember'
                              : 'border-line text-ink3 hover:border-linestrong hover:text-ink'
                          }`}
                          title="Play from this ayah"
                        >
                          {playIdx === i ? '◼' : '▶'}
                        </button>
                      </div>
                      <p
                        dir="rtl"
                        lang="ar"
                        className="font-quran text-[26px] leading-[2.4] text-ink mb-3"
                      >
                        {a.ar} <span className="text-ember text-lg">﴿{a.n}﴾</span>
                      </p>
                      <p className="text-sm leading-relaxed text-ink3">{a.en}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}

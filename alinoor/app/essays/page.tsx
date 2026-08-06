'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/Navbar'

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string
  topic: string
  cover_image: string
  author_email: string
  author_name?: string | null
  created_at: string
}

type ArticleWithAuthor = Article & {
  author_name: string
}

const PAGE_SIZE = 10

function EssaysFeed() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([])
  // The current page lives in the URL, so Back from an essay and shared links
  // both land on the page the reader was actually on.
  const [page, setPage] = useState(() => {
    const p = Number.parseInt(searchParams.get('page') || '1', 10)
    return Number.isFinite(p) && p > 0 ? p : 1
  })
  const [total, setTotal] = useState(0)
  const [listLoading, setListLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [retry, setRetry] = useState(0)
  const [brokenCovers, setBrokenCovers] = useState<Record<string, boolean>>({})
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
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

  // `alive` keeps a slower earlier page from overwriting a newer one.
  useEffect(() => {
    let alive = true

    const loadArticles = async () => {
      setListLoading(true)
      setLoadFailed(false)
      const from = (page - 1) * PAGE_SIZE

      const { data, count, error } = await supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)

      if (!alive) return

      if (error || !data) {
        // A ?page= past the end makes PostgREST reject the range outright, and
        // with no count we'd never learn where to clamp to. Ask for the count
        // alone and let the clamp effect below move the reader to the last
        // real page instead of showing a failure.
        if (page > 1) {
          const { count: total0, error: countError } = await supabase
            .from('articles')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'published')

          if (!alive) return
          if (!countError && total0 !== null && total0 !== undefined) {
            setTotal(total0)
            setListLoading(false)
            return
          }
        }

        setArticles([])
        setLoadFailed(true)
        setListLoading(false)
        return
      }

      if (count !== null && count !== undefined) setTotal(count)

      // One profiles round-trip for the whole page, not one per essay.
      const emails = Array.from(
        new Set(
          data
            .filter((article) => !article.author_name && article.author_email)
            .map((article) => article.author_email as string)
        )
      )

      const names = new Map<string, string>()
      if (emails.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email, full_name')
          .in('email', emails)

        if (!alive) return

        profiles?.forEach((profile) => {
          if (profile.full_name) names.set(profile.email, profile.full_name)
        })
      }

      setArticles(
        data.map((article) => ({
          ...article,
          author_name:
            article.author_name ||
            names.get(article.author_email) ||
            article.author_email?.split('@')[0] ||
            'anon',
        }))
      )
      setListLoading(false)
    }

    loadArticles()

    return () => {
      alive = false
    }
  }, [page, retry])

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // The page number comes from the URL, so it can point past the last page.
  useEffect(() => {
    if (total === 0 || page <= pages) return
    setPage(pages)
    router.replace(`/essays?page=${pages}`, { scroll: false })
  }, [total, page, pages, router])

  const goTo = (p: number) => {
    if (p < 1 || p > pages || p === page) return
    setPage(p)
    router.replace(`/essays?page=${p}`, { scroll: false })
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg">
        {/* HERO */}
        <section className="border-b border-line">
          <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
            <p className="microlabel mb-6 animate-in">a home for thoughtful writing</p>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[1.05] text-ink max-w-3xl animate-in">
              Write in the quiet.
              <br />
              Read in the <span className="relative inline-block">light<span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-ember/60 rounded-full"></span></span>.
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-ink3 max-w-xl leading-relaxed animate-in">
              AliNoor is a calm place for essays and stories — no feeds, no noise.
              Ideas that matter, written slowly and read whole.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 animate-in">
              <Link
                href="/write"
                className="px-6 py-3 bg-ink text-bg rounded-lg font-medium text-sm hover:opacity-85 transition-opacity text-center"
              >
                Start writing →
              </Link>
              {!loading && !user && (
                <Link
                  href="/login"
                  className="px-6 py-3 border border-line rounded-lg font-medium text-sm text-ink2 hover:border-linestrong hover:text-ink transition-colors text-center"
                >
                  Sign in
                </Link>
              )}
            </div>

            <p className="mt-12 font-hand text-2xl text-mute rotate-[-1deg] inline-block animate-in">
              nūr — light, the kind you read by
            </p>
          </div>
        </section>

        {/* LATEST */}
        <section ref={listRef} className="max-w-6xl mx-auto px-6 py-16 sm:py-20 scroll-mt-4">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="microlabel">latest essays</h2>
            <span className="font-mono text-[11px] text-faint">
              {total > 0
                ? `${total} published · page ${page}/${pages}`
                : ''}
            </span>
          </div>

          {!listLoading && loadFailed && (
            <div className="border border-dashed border-linestrong rounded-xl py-20 text-center">
              <p className="text-lg text-ink3 mb-1">Couldn&rsquo;t load essays.</p>
              <p className="font-hand text-2xl text-mute mb-6">
                the shelf is still there — try again
              </p>
              <button
                onClick={() => setRetry((r) => r + 1)}
                className="px-5 py-2.5 bg-ink text-bg rounded-lg text-sm font-medium hover:opacity-85 transition-opacity"
              >
                Retry
              </button>
            </div>
          )}

          {!listLoading && !loadFailed && articles.length === 0 && (
            <div className="border border-dashed border-linestrong rounded-xl py-20 text-center">
              <p className="text-lg text-ink3 mb-1">Nothing here yet.</p>
              <p className="font-hand text-2xl text-mute">
                be the first to write something
              </p>
            </div>
          )}

          {listLoading && (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {!listLoading &&
              articles.map((article, index) => (
                <Link
                  key={article.id}
                  href={`/article?slug=${article.slug}`}
                  className="group block animate-in"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <article className="h-full bg-panel rounded-xl overflow-hidden border border-line hover:border-linestrong transition-colors shadow-card flex flex-col">
                    {article.cover_image && !brokenCovers[article.id] ? (
                      <div className="relative h-44 overflow-hidden bg-panel2 border-b border-line">
                        <img
                          src={article.cover_image}
                          alt={article.title}
                          onError={() =>
                            setBrokenCovers((prev) => ({
                              ...prev,
                              [article.id]: true,
                            }))
                          }
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : (
                      <div className="h-44 bg-panel2 border-b border-line flex items-center justify-center">
                        <span className="font-hand text-4xl text-faint">aن</span>
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-1">
                      {article.topic && (
                        <span className="microlabel mb-3">{article.topic}</span>
                      )}

                      <h3 className="text-xl font-medium mb-3 leading-snug text-ink group-hover:text-ink2 transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-sm text-ink3 leading-relaxed line-clamp-3 mb-5">
                        {article.excerpt || 'Read this essay…'}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-line">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-md border border-linestrong bg-panel2 text-ink2 flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                            {article.author_name[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs text-mute truncate">
                            {article.author_name}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-faint flex-shrink-0">
                          {new Date(article.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
          </div>

          {/* GOOGLE-STYLE PAGINATOR — one “o” per page */}
          {pages > 1 && (
            <div className="mt-16 overflow-x-auto">
              <div className="flex items-end justify-start sm:justify-center min-w-max mx-auto px-2 select-none">
                <span className="text-3xl font-semibold text-ink pb-5">al</span>
                <span className="text-3xl font-semibold text-ember pb-5">i</span>
                <span className="text-3xl font-semibold text-ink pb-5">n</span>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    className="flex flex-col items-center px-0.5 group"
                  >
                    <span
                      className={`text-3xl font-semibold transition-colors ${
                        p === page
                          ? 'text-ember'
                          : 'text-ink3 group-hover:text-ink'
                      }`}
                    >
                      o
                    </span>
                    <span
                      className={`font-mono text-[12px] mt-0.5 ${
                        p === page
                          ? 'text-ember underline underline-offset-4'
                          : 'text-mute group-hover:text-ink'
                      }`}
                    >
                      {p}
                    </span>
                  </button>
                ))}
                <span className="text-3xl font-semibold text-ink pb-5">r</span>

                {page < pages && (
                  <button
                    onClick={() => goTo(page + 1)}
                    className="ml-6 flex flex-col items-center pb-1 text-ink3 hover:text-ink transition-colors"
                  >
                    <span className="text-2xl">›</span>
                    <span className="font-mono text-[12px]">Next</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="border-t border-line bg-panel2/60">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
              <div>
                <p className="font-semibold text-lg text-ink mb-2">alinoor</p>
                <p className="text-sm text-ink3 leading-relaxed">
                  A quiet platform for thoughtful writers and curious readers.
                </p>
              </div>

              <div>
                <h4 className="microlabel mb-4">Platform</h4>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <Link href="/write" className="text-ink3 hover:text-ink transition-colors">
                      Start writing
                    </Link>
                  </li>
                  <li>
                    <Link href="/search" className="text-ink3 hover:text-ink transition-colors">
                      Search essays
                    </Link>
                  </li>
                  <li>
                    <Link href="/today" className="text-ink3 hover:text-ink transition-colors">
                      Today
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="microlabel mb-4">Account</h4>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <Link href="/login" className="text-ink3 hover:text-ink transition-colors">
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="text-ink3 hover:text-ink transition-colors">
                      Create account
                    </Link>
                  </li>
                  <li>
                    <Link href="/my-articles" className="text-ink3 hover:text-ink transition-colors">
                      My articles
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="microlabel mb-4">Elsewhere</h4>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <a
                      href="https://github.com/abdujabborahmadjonov/AliNoor"
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink3 hover:text-ink transition-colors"
                    >
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="font-mono text-[11px] text-faint">
                © {new Date().getFullYear()} AliNoor
              </p>
              <p className="font-hand text-xl text-mute">written slowly, read whole</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default function EssaysPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <EssaysFeed />
    </Suspense>
  )
}

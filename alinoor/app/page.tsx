'use client'

import { useEffect, useState } from 'react'
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
  views: number
  likes: number
}

type ArticleWithAuthor = Article & {
  author_name: string
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([])

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

  useEffect(() => {
    const loadArticles = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (data) {
        const articlesWithAuthors = await Promise.all(
          data.map(async (article) => {
            // Explicit byline wins; only look up a profile when absent.
            if (article.author_name) return article

            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('email', article.author_email)
              .single()

            return {
              ...article,
              author_name: profile?.full_name || article.author_email.split('@')[0]
            }
          })
        )
        setArticles(articlesWithAuthors)
      }
    }

    loadArticles()
  }, [])

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
        <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="microlabel">latest essays</h2>
            <span className="font-mono text-[11px] text-faint">
              {articles.length > 0 ? `${articles.length} published` : ''}
            </span>
          </div>

          {articles.length === 0 && (
            <div className="border border-dashed border-linestrong rounded-xl py-20 text-center">
              <p className="text-lg text-ink3 mb-1">Nothing here yet.</p>
              <p className="font-hand text-2xl text-mute">
                be the first to write something
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article, index) => (
              <Link
                key={article.id}
                href={`/article?slug=${article.slug}`}
                className="group block animate-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <article className="h-full bg-panel rounded-xl overflow-hidden border border-line hover:border-linestrong transition-colors shadow-card flex flex-col">
                  {article.cover_image ? (
                    <div className="relative h-44 overflow-hidden bg-panel2 border-b border-line">
                      <img
                        src={article.cover_image}
                        alt={article.title}
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
                    <Link href="/bookmarks" className="text-ink3 hover:text-ink transition-colors">
                      Bookmarks
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

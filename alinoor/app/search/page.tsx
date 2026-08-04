'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/Navbar'

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string
  topic: string
  author_email: string
  created_at: string
  views: number
}

type ArticleWithAuthor = Article & {
  author_name: string
}

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const searchArticles = async () => {
      if (!query.trim()) {
        setArticles([])
        setLoading(false)
        return
      }

      setLoading(true)

      const { data } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, topic, author_email, created_at, views')
        .eq('status', 'approved')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        // Get author names for all articles
        const articlesWithAuthors = await Promise.all(
          data.map(async (article) => {
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

      setLoading(false)
    }

    searchArticles()
  }, [query])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg">
        <div className="max-w-3xl mx-auto px-6 py-14 sm:py-16">

          <div className="mb-10">
            <p className="microlabel mb-3">search</p>
            <h1 className="text-4xl font-medium tracking-tight text-ink mb-2">
              Results
            </h1>
            {query && (
              <p className="text-sm text-mute">
                Showing results for{' '}
                <span className="font-mono text-ink">&ldquo;{query}&rdquo;</span>
              </p>
            )}
          </div>

          {loading && (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-mute">Searching…</p>
            </div>
          )}

          {!loading && !query && (
            <div className="border border-dashed border-linestrong rounded-xl py-16 text-center">
              <p className="text-lg text-ink3">
                Enter a search term to find essays.
              </p>
            </div>
          )}

          {!loading && query && articles.length === 0 && (
            <div className="border border-dashed border-linestrong rounded-xl py-16 text-center">
              <p className="text-lg text-ink3 mb-1">No essays found.</p>
              <p className="font-hand text-2xl text-mute">
                try a different word
              </p>
            </div>
          )}

          <div className="space-y-4">
            {articles.map((article, index) => (
              <Link
                key={article.id}
                href={`/article?slug=${article.slug}`}
                className="block group bg-panel rounded-xl border border-line p-6 hover:border-linestrong transition-colors shadow-card animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    {article.topic && (
                      <span className="microlabel block mb-2">{article.topic}</span>
                    )}

                    <h2 className="text-xl font-medium text-ink mb-2 group-hover:text-ink2 transition-colors leading-snug">
                      {article.title}
                    </h2>

                    {article.excerpt && (
                      <p className="text-sm text-ink3 leading-relaxed line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-3 font-mono text-[11px] text-mute">
                      <span>{article.author_name}</span>
                      <span className="text-faint">·</span>
                      <span>{article.views || 0} views</span>
                      <span className="text-faint">·</span>
                      <span>
                        {new Date(article.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-md border border-linestrong bg-panel2 text-ink2 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {article.author_name[0]?.toUpperCase()}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-14 pt-6 border-t border-line">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink transition-colors"
            >
              <span>←</span>
              <span>Back home</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  )
}

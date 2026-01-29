'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() || ''

  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) return

    const runSearch = async () => {
      setLoading(true)

      const { data } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, cover_image, created_at')
        .eq('status', 'approved')
        .or(
          `title.ilike.%${query}%,content.ilike.%${query}%,topic.ilike.%${query}%`
        )

      setResults(data || [])
      setLoading(false)
    }

    runSearch()
  }, [query])

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto px-4 py-14">
        {/* Header */}
        <h1 className="text-2xl font-serif mb-1">Search</h1>
        <p className="text-sm text-black/60 mb-10">
          Results for “{query}”
        </p>

        {loading && <p>Searching…</p>}

        {!loading && results.length === 0 && (
          <p className="text-black/60">No articles found.</p>
        )}

        {/* Results */}
        <div className="space-y-8">
          {results.map((a) => (
            <Link
              key={a.id}
              href={`/article/${a.slug}`}
              className="
                flex gap-5 items-start
                border-b border-black/10 pb-6
                hover:opacity-90 transition
              "
            >
              {/* Image (LEFT) */}
              {a.cover_image ? (
                <img
                  src={a.cover_image}
                  alt={a.title}
                  className="
                    w-28 h-20 md:w-36 md:h-24
                    object-cover rounded-lg
                    border border-black/10
                    flex-shrink-0
                  "
                />
              ) : (
                <div
                  className="
                    w-28 h-20 md:w-36 md:h-24
                    bg-black/5 rounded-lg
                    flex-shrink-0
                  "
                />
              )}

              {/* Text */}
              <div>
                <h2 className="text-lg md:text-xl font-serif font-semibold leading-snug">
                  {a.title}
                </h2>

                {a.excerpt && (
                  <p className="text-sm text-black/70 mt-2 line-clamp-2">
                    {a.excerpt}
                  </p>
                )}

                <p className="text-xs text-black/50 mt-3">
                  {new Date(a.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
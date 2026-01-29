'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SearchClient() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const run = async () => {
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

    run()
  }, [query])

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto px-4 py-14">
        <h1 className="text-2xl font-serif mb-2">Search</h1>

        {loading && <p>Searching…</p>}

        {!loading && results.length === 0 && (
          <p className="text-black/60">No results</p>
        )}

        <div className="space-y-8">
          {results.map((a) => (
            <Link
              key={a.id}
              href={`/article/${a.slug}`}
              className="flex gap-4 border-b pb-6"
            >
              {a.cover_image ? (
                <img
                  src={a.cover_image}
                  className="w-32 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-32 h-20 bg-black/5 rounded" />
              )}

              <div>
                <h2 className="font-serif text-lg">{a.title}</h2>
                {a.excerpt && (
                  <p className="text-sm text-black/70 mt-1 line-clamp-2">
                    {a.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
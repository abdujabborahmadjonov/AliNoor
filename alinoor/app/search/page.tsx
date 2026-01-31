'use client'

import { useEffect, useState } from 'react'
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

export default function SearchPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          
          <div className="mb-12">
            <h1 className="text-5xl font-serif font-bold text-black mb-4">
              Search Results
            </h1>
            {query && (
              <p className="text-gray-500 font-light text-lg">
                Showing results for: <span className="font-semibold text-black">"{query}"</span>
              </p>
            )}
          </div>

          {loading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-black font-medium">Searching...</p>
            </div>
          )}

          {!loading && !query && (
            <div className="text-center py-20">
              <p className="text-xl font-serif text-gray-400">
                Enter a search term to find articles
              </p>
            </div>
          )}

          {!loading && query && articles.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-block relative mb-8">
                <div className="absolute -inset-4 bg-black/5 rounded-full blur-xl"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-black/10 shadow-lg">
                  <span className="text-6xl text-gray-300 font-black">🔍</span>
                </div>
              </div>
              <p className="text-xl font-serif text-gray-400 mb-2">
                No articles found
              </p>
              <p className="text-gray-500 font-light">
                Try searching with different keywords
              </p>
            </div>
          )}

          <div className="space-y-4">
            {articles.map((article, index) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="block group bg-white rounded-2xl border border-black/10 p-6 hover:border-black/20 hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    {article.topic && (
                      <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3 shadow-sm">
                        {article.topic}
                      </span>
                    )}
                    
                    <h2 className="text-2xl font-serif font-bold text-black mb-2 group-hover:text-gray-700 transition-colors">
                      {article.title}
                    </h2>
                    
                    {article.excerpt && (
                      <p className="text-gray-600 leading-relaxed line-clamp-2 mb-3 font-light">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <span>✍️</span>
                        {article.author_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span>👁️</span>
                        {article.views || 0} views
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(article.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full border-2 border-black bg-white text-black flex items-center justify-center text-lg font-black shadow-sm">
                      {article.author_name[0]?.toUpperCase()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-black/10">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium">
              <span>←</span>
              <span>Back home</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

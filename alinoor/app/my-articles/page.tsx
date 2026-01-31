'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/Navbar'

type Article = {
  id: string
  title: string
  slug: string
  status: 'draft' | 'pending' | 'approved'
  created_at: string
}

export default function MyArticlesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      setUser(data.user)

      const { data: articlesData } = await supabase
        .from('articles')
        .select('id, title, slug, status, created_at')
        .eq('author_email', data.user.email)
        .order('created_at', { ascending: false })

      setArticles(articlesData || [])
      setLoading(false)
    }

    load()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-medium">Loading…</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-black text-white'
      case 'pending': return 'bg-gray-400 text-white'
      case 'draft': return 'bg-gray-200 text-gray-700'
      default: return 'bg-gray-200 text-gray-700'
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          
          <div className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h1 className="text-5xl font-serif font-bold text-black mb-2">
                My Articles
              </h1>
              <p className="text-gray-500 font-light">
                {articles.length} {articles.length === 1 ? 'article' : 'articles'} total
              </p>
            </div>

            <Link
              href="/write"
              className="px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              + New Article
            </Link>
          </div>

          {articles.length === 0 && (
            <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="inline-block relative mb-8">
                <div className="absolute -inset-4 bg-black/5 rounded-full blur-xl"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-black/10 shadow-lg">
                  <span className="text-6xl text-gray-300 font-black">✏️</span>
                </div>
              </div>
              <p className="text-xl font-serif text-gray-400 mb-4">
                You haven't written any articles yet
              </p>
              <Link
                href="/write"
                className="inline-block px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Write Your First Article
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {articles.map((article, index) => (
              <div
                key={article.id}
                className="group bg-white rounded-2xl border border-black/10 p-6 hover:border-black/20 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(article.status)} shadow-sm`}>
                        {article.status}
                      </span>
                      <span className="text-sm text-gray-400 font-light">
                        {new Date(article.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h2 className="text-2xl font-serif font-bold text-black mb-2 group-hover:text-gray-700 transition-colors">
                      {article.title}
                    </h2>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {article.status === 'approved' && (
                      <Link
                        href={`/article/${article.slug}`}
                        className="px-4 py-2 rounded-full border border-black/20 text-sm font-semibold hover:bg-black/5 hover:border-black transition-all duration-300"
                      >
                        View
                      </Link>
                    )}

                    <Link
                      href={`/write?edit=${article.id}`}
                      className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-black/10 animate-in fade-in duration-700">
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

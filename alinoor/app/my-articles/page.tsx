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
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const statusClasses = (status: string) => {
    switch (status) {
      case 'approved': return 'border-good/40 bg-good/10 text-good'
      case 'pending': return 'border-warn/40 bg-warn/10 text-warn'
      default: return 'border-line bg-panel2 text-mute'
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg">
        <div className="max-w-3xl mx-auto px-6 py-14 sm:py-16">

          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="microlabel mb-3">your writing</p>
              <h1 className="text-4xl font-medium tracking-tight text-ink mb-2">
                My articles
              </h1>
              <p className="font-mono text-[11px] text-mute">
                {articles.length} {articles.length === 1 ? 'article' : 'articles'} total
              </p>
            </div>

            <Link
              href="/write"
              className="px-4 py-2.5 bg-ink text-bg rounded-lg text-sm font-medium hover:opacity-85 transition-opacity flex-shrink-0"
            >
              + New article
            </Link>
          </div>

          {articles.length === 0 && (
            <div className="border border-dashed border-linestrong rounded-xl py-16 text-center animate-in">
              <p className="text-lg text-ink3 mb-1">Nothing written yet.</p>
              <p className="font-hand text-2xl text-mute mb-6">
                every essay starts with one line
              </p>
              <Link
                href="/write"
                className="inline-block px-5 py-2.5 bg-ink text-bg rounded-lg text-sm font-medium hover:opacity-85 transition-opacity"
              >
                Write your first article
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {articles.map((article, index) => (
              <div
                key={article.id}
                className="group bg-panel rounded-xl border border-line p-6 hover:border-linestrong transition-colors shadow-card animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className={`px-2.5 py-0.5 rounded-md border font-mono text-[10px] uppercase tracking-widest ${statusClasses(article.status)}`}>
                        {article.status}
                      </span>
                      <span className="font-mono text-[11px] text-faint">
                        {new Date(article.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h2 className="text-xl font-medium text-ink group-hover:text-ink2 transition-colors leading-snug">
                      {article.title}
                    </h2>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {article.status === 'approved' && (
                      <Link
                        href={`/article?slug=${article.slug}`}
                        className="px-3.5 py-1.5 rounded-lg border border-line text-xs font-medium text-ink2 hover:border-linestrong hover:text-ink transition-colors"
                      >
                        View
                      </Link>
                    )}

                    <Link
                      href={`/write?edit=${article.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-ink text-bg text-xs font-medium hover:opacity-85 transition-opacity"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
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

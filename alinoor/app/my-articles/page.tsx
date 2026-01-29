'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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
        <p className="text-black">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-serif font-bold text-black">
            My Articles
          </h1>

          <Link
            href="/write"
            className="px-5 py-2 rounded-full bg-black text-white"
          >
            New Article
          </Link>
        </div>

        {articles.length === 0 && (
          <p className="text-zinc-600">
            You haven’t written any articles yet.
          </p>
        )}

        <div className="space-y-4">
          {articles.map(article => (
            <div
              key={article.id}
              className="border border-zinc-200 rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <h2 className="text-lg font-medium text-black">
                  {article.title}
                </h2>

                <p className="text-sm text-zinc-600 mt-1">
                  Status: <span className="uppercase">{article.status}</span>
                </p>
              </div>

              <div className="flex gap-3">
                {article.status === 'approved' && (
                  <Link
                    href={`/article/${article.slug}`}
                    className="text-sm underline text-black"
                  >
                    View
                  </Link>
                )}

                <Link
                  href={`/write?edit=${article.id}`}
                  className="text-sm underline text-black"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Back */}
        <div className="mt-12">
          <Link href="/" className="underline text-black">
            ← Back home
          </Link>
        </div>
      </div>
    </div>
  )
}
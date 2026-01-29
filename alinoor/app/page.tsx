'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState<any[]>([])

  // 🔐 Check auth (CLIENT SIDE – SAFE)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  // 📰 Fetch articles
  useEffect(() => {
    supabase
      .from('articles')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data }) => setArticles(data || []))
  }, [])

  return (
    <div className="min-h-screen bg-white text-black">
      {/* HERO */}
      <section className="border-b border-black/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h1 className="text-6xl font-serif font-bold mb-4">
            AliNoor
          </h1>

          <p className="text-lg mb-8">
            A place for thoughtful writing. Ideas that matter, stories that stay.
          </p>

          {/* BUTTONS */}
          <div className="flex gap-4">
            <Link
              href="/write"
              className="px-6 py-3 bg-black text-white rounded-full hover:opacity-90 transition"
            >
              Start Writing
            </Link>

            {!loading && !user && (
              <Link
                href="/login"
                className="px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-sm uppercase tracking-widest mb-8">
          Latest Articles
        </h2>

        {articles.length === 0 && (
          <p>No articles yet. Be the first to write.</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              className="group block rounded-2xl overflow-hidden border border-black/10 hover:border-black transition"
            >
              {article.cover_image && (
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="h-56 w-full object-cover transition-transform group-hover:scale-105"
                />
              )}

              <div className="p-6">
                <h3 className="font-serif text-2xl font-semibold mb-2 group-hover:underline">
                  {article.title}
                </h3>
                <p className="text-black/80 line-clamp-3">
                  {article.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
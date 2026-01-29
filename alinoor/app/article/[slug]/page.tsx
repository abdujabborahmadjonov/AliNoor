'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import Link from 'next/link'

export default function ArticlePage() {
  const { slug } = useParams()
  const router = useRouter()

  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      // 🔐 Require login
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }

      // 📄 Fetch article
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'approved')
        .single()

      if (!data) {
        router.push('/404')
        return
      }

      // 👁 Increment views (once per user)
      await supabase.rpc('increment_article_views', {
        p_article_id: data.id,
      })

      setArticle(data)
      setLoading(false)
    }

    load()
  }, [slug, router])

  if (loading) return <div className="min-h-screen bg-white" />

  const readingTime = Math.max(
    1,
    Math.ceil(article.content.split(/\s+/).length / 200)
  )

  return (
    <div className="min-h-screen bg-white text-black">
      {/* ---------------- Header ---------------- */}
      <header className="border-b border-black/20">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between">
          <Link href="/" className="text-sm hover:underline">
            ← Home
          </Link>

          <span className="text-xs text-black/70">
            Written by {article.author_email}
          </span>
        </div>
      </header>

      {/* ---------------- Article (WIDE) ---------------- */}
      <article className="max-w-4xl mx-auto px-2 py-14">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-3">
          {article.title}
        </h1>

        {/* Topic */}
        {article.topic && (
          <div className="mb-6">
            <span className="inline-block text-xs border border-black/30 px-3 py-1 rounded-full">
              {article.topic}
            </span>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-black/70 mb-10">
          <span>{readingTime} min read</span>
          <span>•</span>
          <span>{new Date(article.created_at).toLocaleDateString()}</span>
        </div>

        {/* Cover Image */}
        {article.cover_image && (
          <div className="mb-14">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-[420px] object-cover rounded-2xl border border-black/20"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="
            prose prose-lg max-w-none
            prose-headings:font-serif
            prose-p:text-black
            prose-strong:text-black
            prose-a:text-black prose-a:underline
            prose-code:bg-black/5 prose-code:text-black
            prose-pre:bg-black prose-pre:text-white
            prose-blockquote:border-l-4 prose-blockquote:border-black/30
          "
        >
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Views */}
        <div className="mt-16 flex justify-center">
          <div className="border border-black/30 rounded-full px-6 py-2 text-sm text-black/80">
            👁 {article.views} views
          </div>
        </div>

        {/* ---------------- Author Section (NARROW) ---------------- */}
        <div className="mt-16 flex justify-center">
          <div className="w-full max-w-2xl bg-[#fafafa] rounded-2xl px-8 py-8 flex items-center gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-medium text-gray-700">
              {article.author_email?.[0]?.toUpperCase()}
            </div>

            {/* Text */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Written by</p>
              <p className="text-xl font-semibold text-black">
                {article.author_email}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Writer at Alinoor
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* ---------------- Footer (NARROW) ---------------- */}
      <footer className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-2 py-14">
          {/* Top */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h3 className="text-xl font-serif font-semibold text-black mb-2">
                Alinoor
              </h3>
              <p className="text-gray-600">
                Thoughtful writing, ideas that matter.
              </p>
            </div>

            <div className="flex gap-8 text-gray-600">
              <a href="/" className="hover:text-black transition">
                Home
              </a>
              <a href="/write" className="hover:text-black transition">
                Write
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-12 border-t border-gray-200" />

          {/* Bottom */}
          <div className="mt-8 text-center text-gray-500">
            © 2026 Alinoor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
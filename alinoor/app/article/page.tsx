'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/Navbar'

type Article = {
  id: string
  title: string
  content: string
  excerpt: string
  topic: string
  cover_image: string
  author_email: string
  author_name?: string | null
  views: number
  likes: number
  created_at: string
}

// The article is addressed as /article?slug=… so the page can be statically
// exported (GitHub Pages has no server to resolve dynamic /article/[slug]).
function ArticleReader() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = searchParams.get('slug') || ''

  const [article, setArticle] = useState<Article | null>(null)
  const [authorName, setAuthorName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  useEffect(() => {
    const loadArticle = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'approved')
        .single()

      if (error || !data) {
        router.push('/')
        return
      }

      setArticle(data)

      // Prefer the explicit byline; fall back to the author's profile.
      if (data.author_name) {
        setAuthorName(data.author_name)
      } else {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('email', data.author_email)
          .single()

        if (profileData) {
          setAuthorName(profileData.full_name)
        } else {
          setAuthorName(data.author_email.split('@')[0])
        }
      }

      setLoading(false)

      // Increment views
      if (user) {
        await supabase.rpc('increment_article_views', { p_article_id: data.id })
      }

      // Check if liked
      if (user) {
        const { data: likeData } = await supabase
          .from('article_likes')
          .select('id')
          .eq('article_id', data.id)
          .eq('user_id', user.id)
          .single()

        setLiked(!!likeData)
      }

      // Check if bookmarked
      if (user) {
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('article_id', data.id)
          .eq('user_id', user.id)
          .single()

        setBookmarked(!!bookmarkData)
      }
    }

    if (slug) {
      loadArticle()
    } else {
      router.push('/')
    }
  }, [slug, user, router])

  const toggleLike = async () => {
    if (!user || !article) {
      router.push('/login')
      return
    }

    await supabase.rpc('toggle_article_like', {
      p_article_id: article.id
    })

    setLiked(!liked)
    setArticle({
      ...article,
      likes: liked ? article.likes - 1 : article.likes + 1
    })
  }

  const toggleBookmark = async () => {
    if (!user || !article) {
      router.push('/login')
      return
    }

    if (bookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('article_id', article.id)
        .eq('user_id', user.id)
      setBookmarked(false)
    } else {
      await supabase
        .from('bookmarks')
        .insert({ article_id: article.id, user_id: user.id })
      setBookmarked(true)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    )
  }

  if (!article) return null

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg">
        <article className="max-w-3xl mx-auto px-6 py-14 sm:py-20">

          {/* Topic + date eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            {article.topic && <span className="microlabel">{article.topic}</span>}
            <span className="font-mono text-[11px] text-faint">
              {new Date(article.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-ink mb-8 leading-[1.1]">
            {article.title}
          </h1>

          {/* Cover image */}
          {article.cover_image && (
            <div className="mb-10 rounded-xl overflow-hidden border border-line">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-line">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md border border-linestrong bg-panel2 text-ink2 flex items-center justify-center text-xs font-semibold">
                {authorName[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-ink2 font-medium">{authorName}</span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px] text-mute">
              <span>{article.views || 0} views</span>
              <span>{article.likes || 0} likes</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 mb-12">
            <button
              onClick={toggleLike}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                liked
                  ? 'bg-ember/10 border-ember/40 text-ember'
                  : 'border-line text-ink2 hover:border-linestrong hover:text-ink'
              }`}
            >
              {liked ? '♥ Liked' : '♡ Like'}
            </button>

            <button
              onClick={toggleBookmark}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                bookmarked
                  ? 'bg-ink text-bg border-ink'
                  : 'border-line text-ink2 hover:border-linestrong hover:text-ink'
              }`}
            >
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>

          {/* Content — imported essays are HTML; user-written ones are text */}
          <div className="mb-16">
            {/^\s*</.test(article.content) ? (
              <div
                className="essay-html text-lg leading-[1.8] text-ink2"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <div className="text-lg leading-[1.8] text-ink2 whitespace-pre-wrap">
                {article.content}
              </div>
            )}
          </div>

          {/* Back link */}
          <div className="pt-6 border-t border-line">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink transition-colors"
            >
              <span>←</span>
              <span>Back to home</span>
            </Link>
          </div>
        </article>
      </div>
    </>
  )
}

export default function ArticlePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ArticleReader />
    </Suspense>
  )
}

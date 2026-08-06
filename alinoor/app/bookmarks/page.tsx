'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/Navbar'

type Bookmark = {
  id: string
  article_id: string
  created_at: string
  articles: {
    id: string
    title: string
    slug: string
    excerpt: string
    topic: string
    author_email: string
    views_count?: number
    likes_count?: number
  }
}

type BookmarkWithAuthor = Bookmark & {
  author_name: string
}

export default function BookmarksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<BookmarkWithAuthor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      setUser(data.user)

      try {
        const { data: bookmarksData } = await supabase
          .from('bookmarks')
          .select(`
            id,
            article_id,
            created_at,
            articles (
              id,
              title,
              slug,
              excerpt,
              topic,
              author_email,
              author_name,
              views_count,
              likes_count
            )
          `)
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false })

        if (bookmarksData) {
          // RLS only exposes published articles, so a bookmark whose essay was
          // unpublished comes back with a null `articles` — drop those rows.
          const visible = bookmarksData.filter(
            (bookmark: any) => bookmark.articles
          )

          // Get author names
          const bookmarksWithAuthors = await Promise.all(
            visible.map(async (bookmark: any) => {
              if (bookmark.articles.author_name) {
                return { ...bookmark, author_name: bookmark.articles.author_name }
              }

              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('email', bookmark.articles.author_email)
                .maybeSingle()

              return {
                ...bookmark,
                author_name:
                  profile?.full_name ||
                  bookmark.articles.author_email?.split('@')[0] ||
                  'anon'
              }
            })
          )
          setBookmarks(bookmarksWithAuthors)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  const removeBookmark = async (bookmarkId: string) => {
    await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId)

    setBookmarks(bookmarks.filter(b => b.id !== bookmarkId))
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg">
        <div className="max-w-3xl mx-auto px-6 py-14 sm:py-16">

          <div className="mb-10">
            <p className="microlabel mb-3">saved for later</p>
            <h1 className="text-4xl font-medium tracking-tight text-ink mb-2">
              Bookmarks
            </h1>
            <p className="font-mono text-[11px] text-mute">
              {bookmarks.length} {bookmarks.length === 1 ? 'essay' : 'essays'} saved
            </p>
          </div>

          {bookmarks.length === 0 && (
            <div className="border border-dashed border-linestrong rounded-xl py-16 text-center">
              <p className="text-lg text-ink3 mb-1">No bookmarks yet.</p>
              <p className="font-hand text-2xl text-mute mb-6">
                save what deserves a second read
              </p>
              <Link
                href="/essays"
                className="inline-block px-5 py-2.5 bg-ink text-bg rounded-lg text-sm font-medium hover:opacity-85 transition-opacity"
              >
                Discover essays
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {bookmarks.map((bookmark, index) => {
              const article = bookmark.articles
              return (
                <div
                  key={bookmark.id}
                  className="group bg-panel rounded-xl border border-line p-6 hover:border-linestrong transition-colors shadow-card animate-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      {article.topic && (
                        <span className="microlabel block mb-2">{article.topic}</span>
                      )}

                      <Link href={`/article?slug=${article.slug}`}>
                        <h2 className="text-xl font-medium text-ink mb-2 group-hover:text-ink2 transition-colors leading-snug">
                          {article.title}
                        </h2>
                      </Link>

                      {article.excerpt && (
                        <p className="text-sm text-ink3 leading-relaxed line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-3 font-mono text-[11px] text-mute">
                        <span>{bookmark.author_name}</span>
                        <span className="text-faint">·</span>
                        <span>{article.views_count || 0} views</span>
                        <span className="text-faint">·</span>
                        <span>{article.likes_count || 0} likes</span>
                      </div>
                    </div>

                    <div className="w-9 h-9 rounded-md border border-linestrong bg-panel2 text-ink2 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {bookmark.author_name[0]?.toUpperCase()}
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-4 pt-4 border-t border-line">
                    <Link
                      href={`/article?slug=${article.slug}`}
                      className="px-3.5 py-1.5 rounded-lg border border-line text-xs font-medium text-ink2 hover:border-linestrong hover:text-ink transition-colors"
                    >
                      Read essay
                    </Link>

                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="px-3.5 py-1.5 rounded-lg border border-ember/30 text-ember text-xs font-medium hover:bg-ember/10 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-14 pt-6 border-t border-line">
            <Link
              href="/essays"
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

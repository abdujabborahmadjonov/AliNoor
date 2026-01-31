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
    views: number
    likes: number
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
            views,
            likes
          )
        `)
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })

      if (bookmarksData) {
        // Get author names
        const bookmarksWithAuthors = await Promise.all(
          bookmarksData.map(async (bookmark: any) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('email', bookmark.articles.author_email)
              .single()

            return {
              ...bookmark,
              author_name: profile?.full_name || bookmark.articles.author_email.split('@')[0]
            }
          })
        )
        setBookmarks(bookmarksWithAuthors)
      }

      setLoading(false)
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
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-black font-medium">Loading…</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          
          <div className="mb-12">
            <h1 className="text-5xl font-serif font-bold text-black mb-2">
              My Bookmarks
            </h1>
            <p className="text-gray-500 font-light">
              {bookmarks.length} {bookmarks.length === 1 ? 'article' : 'articles'} saved
            </p>
          </div>

          {bookmarks.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-block relative mb-8">
                <div className="absolute -inset-4 bg-black/5 rounded-full blur-xl"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-black/10 shadow-lg">
                  <span className="text-6xl text-gray-300 font-black">🔖</span>
                </div>
              </div>
              <p className="text-xl font-serif text-gray-400 mb-4">
                No bookmarks yet
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Discover Articles
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {bookmarks.map((bookmark, index) => {
              const article = bookmark.articles
              return (
                <div
                  key={bookmark.id}
                  className="group bg-white rounded-2xl border border-black/10 p-6 hover:border-black/20 hover:shadow-xl transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      {article.topic && (
                        <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3 shadow-sm">
                          {article.topic}
                        </span>
                      )}
                      
                      <Link href={`/article/${article.slug}`}>
                        <h2 className="text-2xl font-serif font-bold text-black mb-2 group-hover:text-gray-700 transition-colors">
                          {article.title}
                        </h2>
                      </Link>
                      
                      {article.excerpt && (
                        <p className="text-gray-600 leading-relaxed line-clamp-2 mb-3 font-light">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <span>✍️</span>
                          {bookmark.author_name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span>👁️</span>
                          {article.views || 0}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span>❤️</span>
                          {article.likes || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full border-2 border-black bg-white text-black flex items-center justify-center text-lg font-black shadow-sm">
                        {bookmark.author_name[0]?.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-black/5">
                    <Link
                      href={`/article/${article.slug}`}
                      className="px-4 py-2 rounded-full border border-black/20 text-sm font-semibold hover:bg-black/5 hover:border-black transition-all duration-300"
                    >
                      Read Article
                    </Link>

                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100 transition-all duration-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
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

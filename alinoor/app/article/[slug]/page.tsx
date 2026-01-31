'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  views: number
  likes: number
  created_at: string
}

type Profile = {
  full_name: string
}

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
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

      // Get author name from profiles
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
    }
  }, [slug, user, router])

  const toggleLike = async () => {
    if (!user || !article) {
      router.push('/login')
      return
    }

    const wasLiked = await supabase.rpc('toggle_article_like', { 
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    )
  }

  if (!article) return null

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
        <article className="max-w-4xl mx-auto px-6 py-16">
          
          {/* Cover Image */}
          {article.cover_image && (
            <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Topic Badge */}
          {article.topic && (
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-full shadow-md">
                {article.topic}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-6xl font-serif font-bold text-black mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center justify-between mb-12 pb-8 border-b border-black/10">
            <div className="flex items-center gap-4 text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border-2 border-black bg-white text-black flex items-center justify-center text-sm font-black">
                  {authorName[0]?.toUpperCase()}
                </div>
                <span className="font-medium">{authorName}</span>
              </div>
              <span>•</span>
              <span>
                {new Date(article.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="flex items-center gap-6 text-gray-500">
              <span className="flex items-center gap-2">
                <span>👁️</span>
                {article.views || 0}
              </span>
              <span className="flex items-center gap-2">
                <span>❤️</span>
                {article.likes || 0}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-12">
            <button
              onClick={toggleLike}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
                liked 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'border border-black/20 hover:bg-black/5'
              }`}
            >
              {liked ? '❤️ Liked' : '🤍 Like'}
            </button>

            <button
              onClick={toggleBookmark}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
                bookmarked 
                  ? 'bg-black text-white hover:bg-gray-800' 
                  : 'border border-black/20 hover:bg-black/5'
              }`}
            >
              {bookmarked ? '📖 Bookmarked' : '🔖 Bookmark'}
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-16">
            <div className="text-xl leading-relaxed text-gray-700 whitespace-pre-wrap font-light">
              {article.content}
            </div>
          </div>

          {/* Back Link */}
          <div className="pt-8 border-t border-black/10">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium">
              <span>←</span>
              <span>Back to home</span>
            </Link>
          </div>
        </article>
      </div>
    </>
  )
}

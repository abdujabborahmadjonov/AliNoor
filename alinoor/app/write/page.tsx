'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/Navbar'

const TOPICS = [
  'Technology',
  'Education',
  'AI & Machine Learning',
  'Science',
  'Health',
  'Business',
  'Design',
  'Philosophy',
  'Travel',
  'Food',
  'Other'
]

export default function WritePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [articleId, setArticleId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    topic: 'Technology',
    cover_image: '',
    status: 'draft' as 'draft' | 'pending' | 'approved'
  })

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUser(data.user)
    }
    loadUser()
  }, [router])

  useEffect(() => {
    const loadArticle = async () => {
      if (!editId || !user) return

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', editId)
        .eq('author_email', user.email)
        .single()

      if (error || !data) {
        alert('Article not found or you do not have permission to edit it')
        router.push('/my-articles')
        return
      }

      setIsEditMode(true)
      setArticleId(data.id)
      setFormData({
        title: data.title || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        topic: data.topic || 'Technology',
        cover_image: data.cover_image || '',
        status: data.status || 'draft'
      })
    }

    if (editId && user) {
      loadArticle()
    }
  }, [editId, user, router])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleSubmit = async (status: 'draft' | 'pending') => {
    if (!user) return
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required')
      return
    }

    setLoading(true)

    try {
      const slug = generateSlug(formData.title)
      const articleData = {
        title: formData.title,
        slug: slug,
        excerpt: formData.excerpt,
        content: formData.content,
        topic: formData.topic,
        cover_image: formData.cover_image,
        status: status,
        author_email: user.email,
      }

      if (isEditMode && articleId) {
        // Update existing article
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', articleId)

        if (error) throw error

        alert(status === 'pending' ? 'Article submitted for review!' : 'Article updated!')
        router.push('/my-articles')
      } else {
        // Create new article
        const { error } = await supabase
          .from('articles')
          .insert([articleData])

        if (error) throw error

        alert(status === 'pending' ? 'Article submitted for review!' : 'Draft saved!')
        router.push('/my-articles')
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          
          <div className="mb-12">
            <h1 className="text-5xl font-serif font-bold text-black mb-2">
              {isEditMode ? 'Edit Article' : 'Write Your Story'}
            </h1>
            <p className="text-gray-500 font-light">
              Share your thoughts with the world
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-black/10 p-8 shadow-xl mb-8">
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                placeholder="Give your article a title..."
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-5 py-3.5 border border-black/20 rounded-2xl
                         text-black placeholder:text-gray-400 text-2xl font-serif font-bold
                         focus:outline-none focus:border-black focus:shadow-lg
                         transition-all duration-300 bg-white"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topic *
              </label>
              <select
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                className="w-full px-5 py-3.5 border border-black/20 rounded-2xl
                         text-black focus:outline-none focus:border-black focus:shadow-lg
                         transition-all duration-300 bg-white"
              >
                {TOPICS.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Excerpt (Optional)
              </label>
              <textarea
                placeholder="A brief summary of your article..."
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                rows={3}
                className="w-full px-5 py-3.5 border border-black/20 rounded-2xl
                         text-black placeholder:text-gray-400
                         focus:outline-none focus:border-black focus:shadow-lg
                         transition-all duration-300 bg-white resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cover Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.cover_image}
                onChange={(e) => setFormData({...formData, cover_image: e.target.value})}
                className="w-full px-5 py-3.5 border border-black/20 rounded-2xl
                         text-black placeholder:text-gray-400
                         focus:outline-none focus:border-black focus:shadow-lg
                         transition-all duration-300 bg-white"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                placeholder="Start writing your story..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={20}
                className="w-full px-5 py-3.5 border border-black/20 rounded-2xl
                         text-black placeholder:text-gray-400 leading-relaxed
                         focus:outline-none focus:border-black focus:shadow-lg
                         transition-all duration-300 bg-white resize-none font-light"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className="flex-1 border border-black/20 py-4 rounded-2xl font-semibold
                         hover:bg-black/5 hover:border-black transition-all duration-300
                         disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                {loading ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                onClick={() => handleSubmit('pending')}
                disabled={loading}
                className="flex-1 bg-black text-white py-4 rounded-2xl font-semibold
                         hover:bg-gray-800 transition-all duration-300 disabled:opacity-50
                         shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                {loading ? 'Publishing...' : 'Publish Article'}
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium"
            >
              <span>←</span>
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

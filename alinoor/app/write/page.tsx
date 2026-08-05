'use client'

import { Suspense, useEffect, useState } from 'react'
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

const inputClass =
  'w-full px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong transition-colors'

function WriteForm() {
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
    status: 'draft' as 'draft' | 'pending' | 'published'
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
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg">
        <div className="max-w-3xl mx-auto px-6 py-14 sm:py-16">

          <div className="mb-10">
            <p className="microlabel mb-3">
              {isEditMode ? 'editing' : 'new essay'}
            </p>
            <h1 className="text-4xl font-medium tracking-tight text-ink mb-2">
              {isEditMode ? 'Edit article' : 'Write your story'}
            </h1>
            <p className="font-hand text-2xl text-mute">
              slowly is fine — say it well
            </p>
          </div>

          <div className="bg-panel rounded-xl border border-line p-6 sm:p-8 shadow-card mb-8">

            <div className="mb-5">
              <label className="microlabel block mb-2">Title *</label>
              <input
                type="text"
                placeholder="Give your essay a title…"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={`${inputClass} !text-xl !py-3 font-medium`}
              />
            </div>

            <div className="mb-5">
              <label className="microlabel block mb-2">Topic *</label>
              <select
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                className={inputClass}
              >
                {TOPICS.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="microlabel block mb-2">Excerpt (optional)</label>
              <textarea
                placeholder="A brief summary of your essay…"
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="mb-5">
              <label className="microlabel block mb-2">Cover image URL (optional)</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.cover_image}
                onChange={(e) => setFormData({...formData, cover_image: e.target.value})}
                className={inputClass}
              />
            </div>

            <div className="mb-6">
              <label className="microlabel block mb-2">Content *</label>
              <textarea
                placeholder="Start writing…"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={20}
                className={`${inputClass} resize-none leading-relaxed`}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className="flex-1 border border-line py-3 rounded-lg text-sm font-medium text-ink2 hover:border-linestrong hover:text-ink transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Save draft'}
              </button>

              <button
                onClick={() => handleSubmit('pending')}
                disabled={loading}
                className="flex-1 bg-ink text-bg py-3 rounded-lg text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Publishing…' : 'Publish article'}
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink transition-colors"
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

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <WriteForm />
    </Suspense>
  )
}

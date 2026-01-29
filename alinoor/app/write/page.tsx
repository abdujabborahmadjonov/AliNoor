'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

export default function WritePage() {

  const router = useRouter()
  const [user, setUser] = useState<any>(null)
const [loading, setLoading] = useState(true)
const [saving, setSaving] = useState(false)
const [topic, setTopic] = useState('')
const [subtopic, setSubtopic] = useState('')
const [customSubtopic, setCustomSubtopic] = useState('')
const finalSubtopic =
  subtopic === 'Other' ? customSubtopic : subtopic
const TOPICS: Record<string, string[]> = {
  Technology: [
    'Programming',
    'Cybersecurity',
    'Startups',
    'Web Development',
    'Mobile Apps',
    'Open Source',
  ],

  Education: [
    'University Life',
    'Study Abroad',
    'Scholarships',
    'Competitions',
    'Online Learning',
    'Exam Preparation',
  ],

  Society: [
    'Culture',
    'Social Issues',
    'Youth',
    'Globalization',
    'Politics',
  ],

  Philosophy: [
    'Ethics',
    'Meaning of Life',
    'Identity',
    'Logic',
    'Existentialism',
  ],

  AI: [
    'Machine Learning',
    'AI in Education',
    'AI Ethics',
    'Future of AI',
    'Automation',
  ],

  Personal: [
    'Self Improvement',
    'Productivity',
    'Habits',
    'Mental Health',
    'Life Lessons',
  ],
}
const [title, setTitle] = useState('')
const [excerpt, setExcerpt] = useState('')
const [content, setContent] = useState('')
const [coverImage, setCoverImage] = useState('')
const [customTopic, setCustomTopic] = useState<string>('') // ✅ REQUIRED


const finalTopic = topic === 'Other' ? customTopic.trim() : topic

const [message, setMessage] = useState<string | null>(null)

const [mode, setMode] = useState<'write' | 'preview'>('write')
const [wordCount, setWordCount] = useState(0)
const [readingTime, setReadingTime] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else {
        setUser(data.user)
        setLoading(false)
      }
    })
  }, [router])

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length
    setWordCount(words)
    setReadingTime(Math.ceil(words / 200))
  }, [content])

  useEffect(() => {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  setWordCount(words)
  setReadingTime(Math.ceil(words / 200))
}, [content])


// 👇 PUT insertAtCursor RIGHT HERE
const insertAtCursor = (before: string, after = '') => {
  const textarea = document.querySelector('textarea') as HTMLTextAreaElement
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = content.substring(start, end)

  const newText =
    content.substring(0, start) +
    before +
    selected +
    after +
    content.substring(end)

  setContent(newText)

  setTimeout(() => {
    textarea.focus()
    textarea.selectionStart =
      textarea.selectionEnd =
      start + before.length + selected.length
  }, 0)
}
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (!e.ctrlKey && !e.metaKey) return

    if (e.key === 'b') {
      e.preventDefault()
      insertAtCursor('**', '**')
    }

    if (e.key === 'i') {
      e.preventDefault()
      insertAtCursor('*', '*')
    }
  }

  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [content])

  const saveArticle = async (status: 'draft' | 'pending') => {
    if (!title.trim() || !content.trim()) {
      setMessage('Title and content are required')
      setTimeout(() => setMessage(null), 3000)
      return
    }

    setSaving(true)
    setMessage(null)

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-') +
      '-' +
      Date.now().toString(36)

    const { error } = await supabase.from('articles').insert({
      title,
      slug,
      excerpt,
      content,
      cover_image: coverImage || null,
      status,
      author_email: user.email,
    })

    setSaving(false)

    if (error) {
      setMessage(error.message)
      setTimeout(() => setMessage(null), 3000)
    } else {
      router.push('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-stone-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Preparing your canvas...</p>
        </div>
      </div>
    )
  }

  return (
<div className="min-h-screen bg-white">
      {/* Floating Header */}
<div className="sticky top-0 z-30 bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back & Stats */}
            <div className="flex items-center gap-6">
              <Link 
                href="/" 
                className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all duration-300"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Exit</span>
              </Link>

              <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-600">📝</span>
                  {wordCount} words
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-600">⏱</span>
                  {readingTime} min read
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => saveArticle('draft')}
                disabled={saving}
                className="group relative px-5 py-2.5 rounded-full border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="text-lg transition-transform group-hover:scale-110">💾</span>
                  <span className="hidden sm:inline">Save Draft</span>
                </span>
              </button>

              <button
  onClick={() => saveArticle('pending')}
  disabled={saving}
  className="group relative px-6 py-2.5 rounded-full
    bg-black text-white
    hover:bg-zinc-900
    border border-black
    transition
    enabled:opacity-85 enabled:hover:opacity-100
    enabled:opacity-50 disabled:cursor-not-allowed"
>
                <span className="flex items-center gap-2">
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">✨</span>
                      <span className="hidden sm:inline">Submit for Review</span>
                      <span className="sm:hidden">Submit</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Info Banner */}
        <div className="mb-8 group relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100/0 via-amber-100/50 to-amber-100/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="relative flex items-start gap-3">
            <span className="text-2xl mt-0.5">💡</span>
            <div>
              <p className="text-amber-900 font-medium leading-relaxed">
                Your masterpiece will be carefully reviewed by our editorial team before publication.
              </p>
              <p className="text-amber-700 text-sm mt-1">
                We typically review submissions within 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Editor Card */}
        <div className="relative group">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 rounded-3xl blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
          
          <div className="relative bg-white rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-900/5 overflow-hidden">
            {/* Title Section */}
            <div className="px-12 pt-12 pb-8 border-b border-slate-100">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your Story Title..."
                className="w-full text-5xl font-serif font-bold text-slate-900 border-none outline-none placeholder:text-slate-300 bg-transparent transition-all focus:placeholder:text-slate-400"
                style={{ lineHeight: '1.2' }}
              />
              
              {/* Subtitle/Excerpt */}
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Add a compelling excerpt that draws readers in..."
                rows={2}
                className="w-full mt-6 text-xl text-slate-600 border-none outline-none resize-none placeholder:text-slate-300 bg-transparent leading-relaxed focus:placeholder:text-slate-400"
              />
            </div>

            {/* Cover Image Section */}
            <div className="px-12 py-8 bg-gradient-to-b from-slate-50/50 to-transparent border-b border-slate-100">
              <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                Cover Image
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative group/input">
                  <input
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full border-2 border-slate-200 rounded-xl px-5 py-3.5 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all bg-white placeholder:text-slate-400"
                  />
                  {coverImage && (
                    <button
                      onClick={() => setCoverImage('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <button className="px-5 border-2 border-slate-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all text-2xl">
                  🖼️
                </button>
              </div>
              
              {coverImage && (
                <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img 
                    src={coverImage} 
                    alt="Cover preview" 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
{/* Topic Selection */}
{/* Topic & Subtopic */}
<div className="px-12 py-6 border-b border-black/80">
  <label className="block text-xs font-semibold text-black mb-2 uppercase">
    Topic
  </label>

  <div className="flex items-center gap-3 flex-wrap">
    {/* Topic */}
    <select
      value={topic}
      onChange={(e) => {
        setTopic(e.target.value)
        setSubtopic('')
        setCustomSubtopic('')
      }}
      className="border border-black/80 rounded-md px-3 py-1.5 text-sm
                 bg-white text-black
                 focus:outline-none w-40"
    >
      <option value="" className="text-black">Select topic</option>
      {Object.keys(TOPICS).map((t) => (
        <option key={t} value={t} className="text-black">
          {t}
        </option>
      ))}
    </select>

    {/* Subtopic */}
    {topic && (
      <select
        value={subtopic}
        onChange={(e) => {
          setSubtopic(e.target.value)
          if (e.target.value !== 'Other') setCustomSubtopic('')
        }}
        className="border border-black/80 rounded-md px-3 py-1.5 text-sm
                   bg-white text-black
                   focus:outline-none w-44"
      >
        <option value="" className="text-black">Select subtopic</option>
        {TOPICS[topic].map((s) => (
          <option key={s} value={s} className="text-black">
            {s}
          </option>
        ))}
        <option value="Other" className="text-black">Other</option>
      </select>
    )}

    {/* Custom subtopic */}
    {subtopic === 'Other' && (
      <input
        value={customSubtopic}
        onChange={(e) => setCustomSubtopic(e.target.value)}
        placeholder="Custom"
        className="border border-black/80 rounded-md px-3 py-1.5 text-sm
                   bg-white text-black
                   focus:outline-none w-32 placeholder:text-black/60"
      />
    )}
  </div>
</div>
            {/* Content Editor */}
            <div className="px-12 py-8">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Content
                </label>

                {/* Mode Toggle */}
                <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => setMode('write')}
                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                      mode === 'write'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>✏️</span>
                      <span className="hidden sm:inline">Write</span>
                    </span>
                  </button>
                  <button
                    onClick={() => setMode('preview')}
                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                      mode === 'preview'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>👁️</span>
                      <span className="hidden sm:inline">Preview</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Editor Toolbar */}
             <div className="flex items-center gap-1 p-3 mb-4 bg-slate-50 rounded-xl border border-slate-200">
  
  <button
    onClick={() => insertAtCursor('## ')}
    className="p-2.5 hover:bg-white rounded-lg transition-all group"
    title="Heading"
  >
    <span className="text-slate-600 group-hover:text-slate-900 font-bold text-sm">H2</span>
  </button>

  <button
    onClick={() => insertAtCursor('**', '**')}
    className="p-2.5 hover:bg-white rounded-lg transition-all group"
    title="Bold"
  >
    <span className="text-slate-600 group-hover:text-slate-900 font-bold">B</span>
  </button>

  <button
    onClick={() => insertAtCursor('*', '*')}
    className="p-2.5 hover:bg-white rounded-lg transition-all group"
    title="Italic"
  >
    <span className="text-slate-600 group-hover:text-slate-900 italic">I</span>
  </button>

  <div className="w-px h-6 bg-slate-300 mx-1"></div>

  <button
    onClick={() => insertAtCursor('[text](', ')')}
    className="p-2.5 hover:bg-white rounded-lg transition-all"
    title="Link"
  >
    <span className="text-slate-600 hover:text-slate-900">🔗</span>
  </button>

  <button
    onClick={() => insertAtCursor('![alt](', ')')}
    className="p-2.5 hover:bg-white rounded-lg transition-all"
    title="Image"
  >
    <span className="text-slate-600 hover:text-slate-900">🖼️</span>
  </button>

  <button
    onClick={() => insertAtCursor('> ')}
    className="p-2.5 hover:bg-white rounded-lg transition-all"
    title="Quote"
  >
    <span className="text-slate-600 hover:text-slate-900">💬</span>
  </button>

  <button
    onClick={() => insertAtCursor('```\n', '\n```')}
    className="p-2.5 hover:bg-white rounded-lg transition-all"
    title="Code"
  >
    <span className="text-slate-600 hover:text-slate-900">💻</span>
  </button>

  <div className="flex-1"></div>
  <span className="text-xs text-slate-500 px-3">Markdown supported</span>
</div>
              {/* Editor / Preview Area */}
              {mode === 'write' ? (
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Begin your story here... 

Pro tip: Use Markdown for formatting:
# Heading
**bold** 
*italic*
[link](url)
![image](url)"
                    className="w-full min-h-[500px] text-lg leading-relaxed text-slate-800 border-2 border-slate-200 rounded-2xl p-6 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 resize-y placeholder:text-slate-400 transition-all bg-white"
                  />
                  
                  {/* Character count at bottom */}
                  <div className="absolute bottom-4 right-4 text-xs text-slate-400 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200">
                    {content.length} characters
                  </div>
                </div>
              ) : (
                <div className="min-h-[500px] border-2 border-slate-200 rounded-2xl p-8 bg-gradient-to-b from-white to-slate-50/50">
                  {content ? (
                    <div className="prose prose-lg prose-slate max-w-none
                      prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900
                      prose-p:text-slate-700 prose-p:leading-relaxed
                      prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-slate-900 prose-strong:font-semibold
                      prose-code:bg-slate-100 prose-code:text-amber-700 prose-code:px-2 prose-code:py-1 prose-code:rounded
                      prose-pre:bg-slate-900 prose-pre:text-slate-100
                      prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:pl-4 prose-blockquote:italic
                      prose-img:rounded-xl prose-img:shadow-lg">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                            {content}
                        </ReactMarkdown>

                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <span className="text-6xl mb-4 block">📄</span>
                        <p className="text-slate-400 text-lg">Nothing to preview yet</p>
                        <p className="text-slate-300 text-sm mt-2">Start writing to see your content here</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all group">
            <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">💡</span>
            <h3 className="font-semibold text-slate-900 mb-1">Be Authentic</h3>
            <p className="text-sm text-slate-600">Write from your unique perspective and experience.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all group">
            <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">✨</span>
            <h3 className="font-semibold text-slate-900 mb-1">Quality Matters</h3>
            <p className="text-sm text-slate-600">Take time to craft and refine your message.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all group">
            <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">🎯</span>
            <h3 className="font-semibold text-slate-900 mb-1">Engage Readers</h3>
            <p className="text-sm text-slate-600">Start strong and keep them hooked throughout.</p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {message && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3">
            <span className="text-2xl">
              {message.includes('required') ? '⚠️' : '❌'}
            </span>
            <p className="font-medium">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

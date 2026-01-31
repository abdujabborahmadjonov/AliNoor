'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/Navbar'

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string
  topic: string
  cover_image: string
  author_email: string
  created_at: string
  views: number
  likes: number
}

type ArticleWithAuthor = Article & {
  author_name: string
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const loadArticles = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (data) {
        // Get author names for all articles
        const articlesWithAuthors = await Promise.all(
          data.map(async (article) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('email', article.author_email)
              .single()

            return {
              ...article,
              author_name: profile?.full_name || article.author_email.split('@')[0]
            }
          })
        )
        setArticles(articlesWithAuthors)
      }
    }

    loadArticles()
  }, [])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}></div>
          
          <div className="max-w-6xl mx-auto px-6 py-32 sm:py-40 text-center relative">
            {/* Animated logo */}
            <div className="inline-block mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-black/5 via-black/10 to-black/5 rounded-full blur-2xl"></div>
                <div className="relative w-24 h-24 rounded-full bg-black flex items-center justify-center mx-auto shadow-2xl">
                  <span className="text-5xl text-white font-black">A</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-bold mb-8 tracking-tight leading-none text-black animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              AliNoor
            </h1>
            
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light mb-16 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              A place for thoughtful writing.<br className="hidden sm:block"/>
              <span className="text-black font-normal">Ideas that matter, stories that stay.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link
                href="/write"
                className="group relative px-10 py-4 bg-black text-white rounded-full font-semibold text-lg hover:bg-gray-900 transition-all shadow-lg hover:shadow-2xl hover:scale-105 duration-300 w-full sm:w-auto overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>Start Writing</span>
                  <span className="transition-transform group-hover:translate-x-1 duration-300">→</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              {!loading && !user && (
                <Link
                  href="/login"
                  className="px-10 py-4 border-2 border-black/20 rounded-full font-semibold text-lg hover:bg-black/5 hover:border-black transition-all duration-300 w-full sm:w-auto backdrop-blur-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Decorative wave */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
        </section>

        {/* SECTION DIVIDER */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-6 mb-16">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-black/20 to-transparent"></div>
            <div className="relative">
              <div className="absolute -inset-2 bg-black/5 rounded-full blur"></div>
              <span className="relative text-sm font-bold tracking-[0.3em] uppercase text-black/60 px-6">
                Latest Stories
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-black/20 to-transparent"></div>
          </div>
        </div>

        {/* ARTICLES GRID */}
        <section className="max-w-7xl mx-auto px-6 pb-32">
          {articles.length === 0 && (
            <div className="text-center py-24">
              <div className="inline-block relative mb-8">
                <div className="absolute -inset-4 bg-black/5 rounded-full blur-xl"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-black/10 shadow-xl">
                  <span className="text-7xl text-gray-300 font-black">□</span>
                </div>
              </div>
              <p className="text-2xl font-serif font-bold text-gray-400 mb-3">No articles yet</p>
              <p className="text-gray-500 font-light text-lg">Be the first to write and share your story.</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {articles.map((article, index) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="group block animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <article className="h-full bg-white rounded-3xl overflow-hidden border border-black/10 hover:border-black/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                  {article.cover_image ? (
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  ) : (
                    <div className="h-64 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center border-b border-black/10">
                      <span className="text-8xl font-black text-black/5">A</span>
                    </div>
                  )}

                  <div className="p-8">
                    {article.topic && (
                      <span className="inline-block px-4 py-1.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4 shadow-md">
                        {article.topic}
                      </span>
                    )}
                    
                    <h3 className="font-serif text-2xl font-bold mb-4 leading-tight group-hover:text-gray-700 transition-colors duration-300">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed line-clamp-3 mb-6 font-light">
                      {article.excerpt || 'Click to read this article...'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-black/5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 group-hover:text-black transition-colors">
                        <span>Read more</span>
                        <span className="transition-transform group-hover:translate-x-1 duration-300">→</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-black bg-white text-black flex items-center justify-center text-xs font-black shadow-sm group-hover:shadow-md transition-shadow">
                          {article.author_name[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-500 font-medium max-w-[100px] truncate">
                          {article.author_name}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-black/10 bg-gradient-to-b from-white to-gray-50/50">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-black">A</span>
                  </div>
                  <h4 className="font-serif font-bold text-xl">AliNoor</h4>
                </div>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  A platform for thoughtful writers and curious readers.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-black/80">Platform</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/write" className="text-gray-600 hover:text-black font-light transition-colors">
                      Start Writing
                    </Link>
                  </li>
                  <li>
                    <Link href="/topics" className="text-gray-600 hover:text-black font-light transition-colors">
                      Browse Topics
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-gray-600 hover:text-black font-light transition-colors">
                      About Us
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-black/80">Support</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/help" className="text-gray-600 hover:text-black font-light transition-colors">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="/guidelines" className="text-gray-600 hover:text-black font-light transition-colors">
                      Writing Guidelines
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-600 hover:text-black font-light transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-black/80">Legal</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/privacy" className="text-gray-600 hover:text-black font-light transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-gray-600 hover:text-black font-light transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-gray-600 hover:text-black font-light transition-colors">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 font-light">
                © 2024 AliNoor. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

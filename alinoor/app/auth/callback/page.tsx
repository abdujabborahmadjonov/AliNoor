import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const revalidate = 60 // ISR – refresh every 60s

export default async function HomePage() {
  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get approved articles
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(7)

  const featuredArticle = articles?.[0]
  const recentArticles = articles?.slice(1) || []

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-7xl font-serif font-medium mb-6">
              Alinoor
            </h1>
            <p className="text-xl md:text-2xl text-stone-600 mb-8">
              A place for thoughtful writing. Ideas that matter, stories that stay.
            </p>

            {user ? (
              <Link
                href="/write"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-stone-800"
              >
                ✍️ Start Writing
              </Link>
            ) : (
              <div className="flex gap-4">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-black text-white rounded-full hover:bg-stone-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 border rounded-full hover:bg-stone-100"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featuredArticle && (
        <section className="max-w-6xl mx-auto px-6 py-16 border-b">
          <p className="text-sm uppercase tracking-wider text-stone-500 mb-6">
            Featured
          </p>

          <Link href={`/article/${featuredArticle.slug}`}>
            <h2 className="text-4xl font-serif font-semibold mb-4 hover:underline">
              {featuredArticle.title}
            </h2>
          </Link>

          <p className="text-stone-600 max-w-2xl">
            {featuredArticle.excerpt}
          </p>
        </section>
      )}

      {/* LATEST */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-sm uppercase tracking-wider text-stone-500 mb-8">
          Latest
        </p>

        {recentArticles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {recentArticles.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="group"
              >
                <h3 className="text-xl font-serif font-semibold group-hover:underline">
                  {article.title}
                </h3>
                <p className="text-stone-600 mt-2 line-clamp-3">
                  {article.excerpt}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-stone-500">No articles yet.</p>
            <Link
              href="/write"
              className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-full"
            >
              Write the first one
            </Link>
          </div>
        )}
      </section>

      {/* NEWSLETTER */}
      <section className="bg-stone-50 border-t">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-serif font-medium mb-4">
            Stay curious
          </h2>
          <p className="text-stone-600 mb-8">
            Subscribe to receive our latest articles.
          </p>

          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-full border"
            />
            <button className="px-6 py-3 bg-black text-white rounded-full">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
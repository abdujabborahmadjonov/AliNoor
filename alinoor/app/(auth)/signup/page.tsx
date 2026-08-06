'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const inputClass =
  'w-full px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong transition-colors'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    country: '',
    phone: '',
    age: '',
    bio: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validate required fields
    if (!formData.email || !formData.password || !formData.full_name || !formData.country || !formData.phone || !formData.age) {
      setMessage('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      // Create account
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ""}/auth/callback`,
          data: {
            full_name: formData.full_name,
          }
        },
      })

      if (error) throw error

      if (data.user) {
        // Only a signed-in user can insert their profile row (RLS). When
        // email confirmation is on, signUp returns no session — the profile
        // is created later by the complete-profile step after first sign-in.
        if (data.session) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: formData.email.trim(),
            full_name: formData.full_name,
            country: formData.country,
            phone: formData.phone,
            age: Number(formData.age) || null,
            bio: formData.bio,
          })
        }

        const signedIn = !!data.session
        setMessage(
          signedIn
            ? 'Account created successfully! Taking you home…'
            : 'Account created successfully! Please check your email to verify your account, then return to sign in.'
        )

        // Clear form
        setFormData({
          email: '',
          password: '',
          full_name: '',
          country: '',
          phone: '',
          age: '',
          bio: ''
        })

        // Signed-in users go straight home; others sign in after verifying.
        setTimeout(() => {
          router.push(signedIn ? '/' : '/login')
        }, signedIn ? 1500 : 3000)
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <main className="w-full max-w-2xl">
        <div className="bg-panel border border-line rounded-xl p-8 sm:p-10 shadow-card">
          <p className="microlabel text-center mb-3">alinoor</p>

          <h1 className="text-3xl font-medium text-center text-ink mb-2 tracking-tight">
            Create account
          </h1>
          <p className="text-center text-mute text-sm mb-8">
            Join AliNoor and start writing
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="microlabel block mb-2">Full name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="microlabel block mb-2">Country *</label>
                <input
                  type="text"
                  required
                  placeholder="Where you write from"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Phone and age, not birth date: these are the fields the
                profile-completeness gate checks for, and collecting anything
                else here sends the user straight back to another form. */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="microlabel block mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="microlabel block mb-2">Age *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  placeholder="24"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="pt-5 border-t border-line">
              <h3 className="microlabel mb-4">Account details</h3>

              <div className="space-y-4">
                <div>
                  <label className="microlabel block mb-2">Email address *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="microlabel block mb-2">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={inputClass}
                  />
                  <p className="font-mono text-[11px] text-faint mt-2">
                    minimum 6 characters
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="microlabel block mb-2">Bio (optional)</label>
              <textarea
                placeholder="Tell us about yourself…"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-bg py-3 rounded-lg text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-3.5 rounded-lg border ${
              message.includes('success')
                ? 'border-good/40 bg-good/10'
                : 'bg-panel2 border-line'
            }`}>
              <p className="text-sm text-center text-ink3">{message}</p>
            </div>
          )}

          <div className="text-center mt-6">
            <p className="text-sm text-mute">
              Already have an account?{' '}
              <Link href="/login" className="text-ink font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

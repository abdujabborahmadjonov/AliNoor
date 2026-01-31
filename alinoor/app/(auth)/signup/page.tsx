'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    country: '',
    birthdate: '',
    bio: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validate required fields
    if (!formData.email || !formData.password || !formData.full_name || !formData.country || !formData.birthdate) {
      setMessage('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      // Create account
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.full_name,
          }
        },
      })

      if (error) throw error

      if (data.user) {
        // Create profile immediately
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: formData.email,
          full_name: formData.full_name,
          country: formData.country,
          birthdate: formData.birthdate,
          bio: formData.bio,
        })

        setMessage('Account created successfully! Please check your email to verify your account, then return to sign in.')
        
        // Clear form
        setFormData({
          email: '',
          password: '',
          full_name: '',
          country: '',
          birthdate: '',
          bio: ''
        })

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }}></div>

      <main className="relative w-full max-w-2xl">
        <div className="absolute -inset-8 bg-gradient-to-r from-black/5 via-black/10 to-black/5 rounded-full blur-3xl"></div>
        
        <div className="relative bg-white/80 backdrop-blur-xl border border-black/10 rounded-3xl p-10 shadow-2xl">
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-black">A</span>
            </div>
          </div>

          <h1 className="text-4xl font-serif font-bold text-center text-black mb-2">
            Create Account
          </h1>
          <p className="text-center text-gray-500 mb-10 font-light">
            Join AliNoor and start writing
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-5 py-3.5 border border-black/20 rounded-2xl
                           text-black placeholder:text-gray-400
                           focus:outline-none focus:border-black focus:shadow-lg
                           transition-all duration-300 bg-white/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-5 py-3.5 border border-black/20 rounded-2xl
                           text-black placeholder:text-gray-400
                           focus:outline-none focus:border-black focus:shadow-lg
                           transition-all duration-300 bg-white/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Birth Date *
              </label>
              <input
                type="date"
                required
                value={formData.birthdate}
                onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                className="w-full px-5 py-3.5 border border-black/20 rounded-2xl
                         text-black placeholder:text-gray-400
                         focus:outline-none focus:border-black focus:shadow-lg
                         transition-all duration-300 bg-white/50"
              />
            </div>

            {/* Account Info Section */}
            <div className="pt-6 border-t border-black/10">
              <h3 className="text-lg font-semibold text-black mb-4">Account Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-5 py-3.5 border border-black/20 rounded-2xl
                             text-black placeholder:text-gray-400
                             focus:outline-none focus:border-black focus:shadow-lg
                             transition-all duration-300 bg-white/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-5 py-3.5 border border-black/20 rounded-2xl
                             text-black placeholder:text-gray-400
                             focus:outline-none focus:border-black focus:shadow-lg
                             transition-all duration-300 bg-white/50"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Minimum 6 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Bio (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio (Optional)
              </label>
              <textarea
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={4}
                className="w-full px-5 py-3.5 border border-black/20 rounded-2xl
                         text-black placeholder:text-gray-400
                         focus:outline-none focus:border-black focus:shadow-lg
                         transition-all duration-300 bg-white/50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-2xl font-semibold
                       hover:bg-gray-800 transition-all duration-300 disabled:opacity-50
                       shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-2xl border ${
              message.includes('success') 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-black/10'
            }`}>
              <p className="text-sm text-center text-gray-600 font-medium">
                {message}
              </p>
            </div>
          )}

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-black font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

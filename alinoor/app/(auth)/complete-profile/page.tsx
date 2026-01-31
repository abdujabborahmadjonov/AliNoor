'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CompleteProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    country: '',
    birthdate: '',
    bio: ''
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUser(data.user)
      
      // Check if profile already exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (profile && profile.full_name) {
        // Profile already complete
        router.push('/')
      }
    }
    
    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: formData.full_name,
          country: formData.country,
          birthdate: formData.birthdate,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Update user metadata
      await supabase.auth.updateUser({
        data: { 
          full_name: formData.full_name,
          profile_completed: true 
        }
      })

      router.push('/')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-2xl">
        <div className="relative bg-white/80 backdrop-blur-xl border border-black/10 rounded-3xl p-10 shadow-2xl">
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-black">A</span>
            </div>
          </div>

          <h1 className="text-4xl font-serif font-bold text-center text-black mb-2">
            Complete Your Profile
          </h1>
          <p className="text-center text-gray-500 mb-10 font-light">
            Tell us a bit about yourself
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

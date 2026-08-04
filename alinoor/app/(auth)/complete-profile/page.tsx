'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const inputClass =
  'w-full px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong transition-colors'

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
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-panel border border-line rounded-xl p-8 sm:p-10 shadow-card">
          <p className="microlabel text-center mb-3">alinoor</p>

          <h1 className="text-3xl font-medium text-center text-ink mb-2 tracking-tight">
            Complete your profile
          </h1>
          <p className="text-center text-mute text-sm mb-8">
            Tell us a bit about yourself
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div>
              <label className="microlabel block mb-2">Birth date *</label>
              <input
                type="date"
                required
                value={formData.birthdate}
                onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                className={inputClass}
              />
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
              {loading ? 'Saving…' : 'Complete profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

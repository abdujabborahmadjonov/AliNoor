'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const inputClass =
  'w-full px-4 py-2.5 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong transition-colors'

export default function CompleteProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    country: '',
    phone: '',
    age: '',
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUser(data.user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, country, phone, age')
        .eq('id', data.user.id)
        .single()

      if (profile) {
        // Pre-fill anything already known; if everything is present, go home.
        if (profile.full_name && profile.country && profile.phone && profile.age) {
          router.push('/')
          return
        }
        setFormData({
          full_name: profile.full_name || data.user.user_metadata?.full_name || '',
          country: profile.country || '',
          phone: profile.phone || '',
          age: profile.age ? String(profile.age) : '',
        })
      } else if (data.user.user_metadata?.full_name) {
        setFormData((f) => ({ ...f, full_name: data.user.user_metadata.full_name }))
      }
    }

    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const age = parseInt(formData.age, 10)
    if (!formData.full_name.trim() || !formData.country.trim() || !formData.phone.trim()) {
      setMessage('Please fill in every field.')
      return
    }
    if (!age || age < 5 || age > 120) {
      setMessage('Please enter a valid age.')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: formData.full_name.trim(),
        country: formData.country.trim(),
        phone: formData.phone.trim(),
        age,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      await supabase.auth.updateUser({
        data: { full_name: formData.full_name.trim(), profile_completed: true },
      })

      router.push('/')
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-panel border border-line rounded-xl p-8 sm:p-10 shadow-card">
          <p className="microlabel text-center mb-3">alinoor</p>

          <h1 className="text-3xl font-medium text-center text-ink mb-2 tracking-tight">
            Tell us about you
          </h1>
          <p className="text-center text-mute text-sm mb-8">
            A few details before you begin
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="microlabel block mb-2">Full name *</label>
              <input
                type="text"
                required
                autoComplete="name"
                placeholder="Your full name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="microlabel block mb-2">Where are you from? *</label>
              <input
                type="text"
                required
                placeholder="City, country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="microlabel block mb-2">Phone number *</label>
              <input
                type="tel"
                required
                autoComplete="tel"
                placeholder="+998 90 123 45 67"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="microlabel block mb-2">Age *</label>
              <input
                type="number"
                required
                min={5}
                max={120}
                placeholder="21"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-bg py-3 rounded-lg text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Continue'}
            </button>
          </form>

          {message && (
            <div className="mt-6 p-3.5 bg-panel2 rounded-lg border border-line">
              <p className="text-sm text-center text-ink3">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

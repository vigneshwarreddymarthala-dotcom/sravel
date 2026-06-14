import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { GERMAN_CITIES } from '../../lib/constants'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'

export default function Onboarding() {
  const navigate = useNavigate()
  const { session, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    name: session?.user?.user_metadata?.name || '',
    university: '',
    home_city: '',
    bio: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.university || !form.home_city) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('users').upsert({
      id: session.user.id,
      email: session.user.email,
      name: form.name,
      university: form.university,
      home_city: form.home_city,
      bio: form.bio,
      role: 'user',
      status: 'active',
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    await refreshProfile()
    navigate('/feed')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set up your profile</h1>
          <p className="text-gray-500 text-sm mt-1">This helps others know who you are</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full name *"
              placeholder="Max Mustermann"
              value={form.name}
              onChange={update('name')}
              required
            />
            <Input
              label="University *"
              placeholder="TU Munich"
              value={form.university}
              onChange={update('university')}
              required
            />
            <Select
              label="Home city *"
              value={form.home_city}
              onChange={update('home_city')}
              required
            >
              <option value="">Select your city</option>
              {GERMAN_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Textarea
              label="Short bio (optional)"
              placeholder="Tell other students a little about yourself…"
              rows={3}
              value={form.bio}
              onChange={update('bio')}
            />
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? 'Saving…' : 'Continue to Speilfinder'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

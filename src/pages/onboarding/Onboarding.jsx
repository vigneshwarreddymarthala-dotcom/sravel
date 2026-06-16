import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { COUNTRIES, GERMAN_CITIES, GERMAN_STATES } from '../../lib/constants'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import CitySelect from '../../components/ui/CitySelect'
import Textarea from '../../components/ui/Textarea'
import Avatar from '../../components/ui/Avatar'
import LanguageSelect from '../../components/ui/LanguageSelect'

export default function Onboarding() {
  const navigate = useNavigate()
  const { session, refreshProfile } = useAuth()
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    name: session?.user?.user_metadata?.name || '',
    university: '',
    home_country: 'Germany',
    home_state: '',
    home_city: '',
    languages: [],
    bio: '',
    avatar_url: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  function update(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  function updateCountry(country) {
    setForm(p => ({ ...p, home_country: country, home_state: '', home_city: '' }))
  }

  async function handlePhotoSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingPhoto(true)
    const ext = file.name.split('.').pop()
    const path = `${session.user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      setForm(p => ({ ...p, avatar_url: publicUrl }))
    }
    setUploadingPhoto(false)
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
      home_country: form.home_country,
      home_state: form.home_state,
      home_city: form.home_city,
      languages: form.languages,
      bio: form.bio,
      avatar_url: form.avatar_url,
      role: 'user',
      status: 'active',
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    await refreshProfile()
    navigate('/feed')
  }

  const isGermany = form.home_country === 'Germany'

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
          <div className="flex justify-center mb-5">
            <div className="relative">
              <Avatar
                name={form.name}
                src={form.avatar_url}
                size="xl"
                editable
                onClick={() => fileRef.current?.click()}
              />
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
          </div>
          <p className="text-center text-xs text-gray-400 -mt-3 mb-5">Tap photo to upload</p>

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

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Country *</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={form.home_country}
                onChange={e => updateCountry(e.target.value)}
                required
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {isGermany ? (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">State</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={form.home_state}
                  onChange={update('home_state')}
                >
                  <option value="">Select state…</option>
                  {GERMAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ) : (
              <Input
                label="State / Region"
                placeholder="e.g. California"
                value={form.home_state}
                onChange={update('home_state')}
              />
            )}

            {isGermany ? (
              <CitySelect
                label="Home city *"
                value={form.home_city}
                onChange={v => setForm(p => ({ ...p, home_city: v }))}
                placeholder="Search your city…"
                cities={GERMAN_CITIES}
                required
              />
            ) : (
              <Input
                label="Home city *"
                placeholder="e.g. New York"
                value={form.home_city}
                onChange={update('home_city')}
                required
              />
            )}

            <LanguageSelect
              label="Languages spoken"
              value={form.languages}
              onChange={langs => setForm(p => ({ ...p, languages: langs }))}
            />

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
              {loading ? 'Saving…' : 'Continue to sravel'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

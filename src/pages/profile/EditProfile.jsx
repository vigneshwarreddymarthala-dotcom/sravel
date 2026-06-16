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

export default function EditProfile() {
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    name: profile?.name || '',
    university: profile?.university || '',
    home_country: profile?.home_country || 'Germany',
    home_state: profile?.home_state || '',
    home_city: profile?.home_city || '',
    languages: profile?.languages || [],
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
  })
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState('')

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
    const path = `${profile.id}/avatar.${ext}`
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
      setError('Name, university and city are required')
      return
    }
    setLoading(true)
    const { error } = await supabase
      .from('users')
      .update({
        name: form.name,
        university: form.university,
        home_country: form.home_country,
        home_state: form.home_state,
        home_city: form.home_city,
        languages: form.languages,
        bio: form.bio,
        avatar_url: form.avatar_url,
      })
      .eq('id', profile.id)
    setLoading(false)
    if (error) { setError(error.message); return }
    await refreshProfile()
    navigate('/profile')
  }

  const isGermany = form.home_country === 'Germany'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Edit profile</h2>
      </div>

      <div className="flex justify-center pt-6 pb-2">
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
      <p className="text-center text-xs text-gray-400 mb-4">Tap to change photo</p>

      <form onSubmit={handleSubmit} className="px-4 pb-8 flex flex-col gap-4">
        <Input label="Full name *" value={form.name} onChange={update('name')} required />
        <Input label="University *" value={form.university} onChange={update('university')} required />

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
          label="Bio (optional)"
          value={form.bio}
          onChange={update('bio')}
          rows={4}
          placeholder="Tell others about yourself…"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </div>
  )
}

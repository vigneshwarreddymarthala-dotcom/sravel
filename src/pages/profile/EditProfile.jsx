import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { GERMAN_CITIES } from '../../lib/constants'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'

export default function EditProfile() {
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    name: profile?.name || '',
    university: profile?.university || '',
    home_city: profile?.home_city || '',
    bio: profile?.bio || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }))
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
      .update({ name: form.name, university: form.university, home_city: form.home_city, bio: form.bio })
      .eq('id', profile.id)
    setLoading(false)
    if (error) { setError(error.message); return }
    await refreshProfile()
    navigate('/profile')
  }

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
      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
        <Input label="Full name *" value={form.name} onChange={update('name')} required />
        <Input label="University *" value={form.university} onChange={update('university')} required />
        <Select label="Home city *" value={form.home_city} onChange={update('home_city')} required>
          <option value="">Select city</option>
          {GERMAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Textarea label="Bio (optional)" value={form.bio} onChange={update('bio')} rows={4} placeholder="Tell others about yourself…" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </div>
  )
}

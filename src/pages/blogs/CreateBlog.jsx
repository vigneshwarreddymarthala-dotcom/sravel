import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { COUNTRIES } from '../../lib/constants'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'

const TRAVEL_TAGS = [
  'Food', 'Culture', 'Nature', 'Adventure', 'City Life',
  'Beach', 'History', 'Budget Tips', 'Transport', 'Accommodation',
  'Hidden Gem', 'Nightlife', 'Shopping', 'Family', 'Solo Travel',
]

export default function CreateBlog() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    place: '',
    city: '',
    country: 'Germany',
    content: '',
    tags: [],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  function toggleTag(tag) {
    setForm(p => ({
      ...p,
      tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.place.trim() || !form.content.trim()) {
      setError('Title, place, and your story are required')
      return
    }
    if (form.content.trim().length < 50) {
      setError('Your story should be at least 50 characters — give readers a feel for the place!')
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase.from('blogs').insert({
      user_id: session.user.id,
      title: form.title.trim(),
      place: form.place.trim(),
      city: form.city.trim(),
      country: form.country,
      content: form.content.trim(),
      tags: form.tags,
    }).select().single()
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate(`/blogs/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 md:pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors -ml-1">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Write a Story</h1>
          <p className="text-xs text-gray-400">Share your travel experience</p>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Title */}
          <Input
            label="Story title *"
            placeholder="e.g. A weekend in Munich — what no one tells you"
            value={form.title}
            onChange={update('title')}
            required
          />

          {/* Place details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-4">
            <p className="text-sm font-semibold text-gray-700">Location</p>
            <Input
              label="Specific place *"
              placeholder="e.g. Marienplatz, Viktualienmarkt, Neuschwanstein…"
              value={form.place}
              onChange={update('place')}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                placeholder="e.g. Munich"
                value={form.city}
                onChange={update('city')}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={form.country}
                  onChange={update('country')}
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Your experience *</label>
            <p className="text-xs text-gray-400 -mt-0.5">Describe what you saw, felt, ate, learned — help others picture it</p>
            <textarea
              className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
              placeholder={`Tell your story... \n\nWhat made this place special? What surprised you? Any tips for others visiting? The more detail you share, the more useful it is for fellow students.`}
              rows={10}
              value={form.content}
              onChange={update('content')}
              required
            />
            <p className="text-xs text-gray-400 text-right">{form.content.length} characters</p>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Tags (pick any that apply)</label>
            <div className="flex flex-wrap gap-2">
              {TRAVEL_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all active:scale-95 ${
                    form.tags.includes(tag)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? 'Publishing…' : 'Publish Story'}
          </Button>
        </form>
      </div>
    </div>
  )
}

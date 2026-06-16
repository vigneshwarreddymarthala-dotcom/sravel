import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import CitySelect from '../../components/ui/CitySelect'
import Textarea from '../../components/ui/Textarea'

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [type, setType] = useState('')
  const [form, setForm] = useState({
    target_city: '',
    date_from: '',
    date_to: '',
    title: '',
    story: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function update(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  function validate() {
    const e = {}
    if (!form.date_from) e.date_from = 'Required'
    if (!form.date_to) e.date_to = 'Required'
    if (form.date_to && form.date_from && form.date_to < form.date_from) e.date_to = 'Must be after start date'
    if (!form.title) e.title = 'Required'
    if (form.title.length > 80) e.title = 'Max 80 characters'
    if (!form.story) e.story = 'Required'
    if (form.story.length < 50) e.story = `Min 50 characters (${form.story.length}/50)`
    if (type === 'seeking' && !form.target_city) e.target_city = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      type,
      host_city: user.home_city,
      target_city: type === 'seeking' ? form.target_city : (form.target_city || null),
      date_from: form.date_from,
      date_to: form.date_to,
      title: form.title,
      story: form.story,
      status: 'open',
    })
    setLoading(false)
    if (!error) navigate('/my-posts')
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Create post</h2>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-6">What kind of post do you want to create?</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setType('seeking'); setStep(2) }}
              className="bg-white border-2 border-gray-100 rounded-xl p-5 text-left hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-2">🔍</div>
              <p className="font-semibold text-gray-900">I'm seeking a place to stay</p>
              <p className="text-sm text-gray-500 mt-1">You're traveling to another city and need a couch</p>
            </button>
            <button
              onClick={() => { setType('hosting'); setStep(2) }}
              className="bg-white border-2 border-gray-100 rounded-xl p-5 text-left hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-2">🏠</div>
              <p className="font-semibold text-gray-900">I want to host someone</p>
              <p className="text-sm text-gray-500 mt-1">You have space and want to welcome a student</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-4 flex items-center gap-3">
        <button onClick={() => setStep(1)} className="p-1 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {type === 'seeking' ? '🔍 Seeking a place' : '🏠 Hosting someone'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
        {type === 'seeking' ? (
          <CitySelect
            label="Destination city"
            value={form.target_city}
            onChange={v => setForm(p => ({ ...p, target_city: v }))}
            placeholder="Search destination city…"
            error={errors.target_city}
            required
          />
        ) : (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Your city (host location)</label>
              <div className="mt-1 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600">
                📍 {user?.home_city}
              </div>
            </div>
            <CitySelect
              label="Target city (optional — leave blank for open hosting)"
              value={form.target_city}
              onChange={v => setForm(p => ({ ...p, target_city: v }))}
              placeholder="Search city or leave blank…"
              allowAny
            />
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="From *"
            type="date"
            value={form.date_from}
            onChange={update('date_from')}
            error={errors.date_from}
          />
          <Input
            label="To *"
            type="date"
            value={form.date_to}
            onChange={update('date_to')}
            error={errors.date_to}
          />
        </div>

        <div>
          <Input
            label={`Title * (${form.title.length}/80)`}
            placeholder="Short, clear title for your post"
            value={form.title}
            onChange={update('title')}
            maxLength={80}
            error={errors.title}
          />
        </div>

        <Textarea
          label={`Story * (${form.story.length} chars, min 50)`}
          placeholder={
            type === 'seeking'
              ? "Tell why you're going, what you need, a bit about yourself…"
              : 'Tell what you offer, your place, what dates work best…'
          }
          rows={5}
          value={form.story}
          onChange={update('story')}
          error={errors.story}
        />

        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? 'Publishing…' : 'Publish post'}
        </Button>
      </form>
    </div>
  )
}

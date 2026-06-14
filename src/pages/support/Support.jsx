import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { SUPPORT_SUBJECTS } from '../../lib/constants'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Input from '../../components/ui/Input'

export default function Support() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({ subject: '', message: '', phone: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  function update(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.subject || !form.message) return
    setLoading(true)
    await supabase.from('support_tickets').insert({
      user_id: user.id,
      subject: form.subject,
      message: form.message,
      phone: form.phone || null,
      status: 'open',
    })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Support</h2>
      </div>

      <div className="p-4">
        {sent ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ticket submitted</h3>
            <p className="text-sm text-gray-600">We'll review it and contact you by email or phone.</p>
            <Button className="mt-6" onClick={() => navigate('/profile')}>Back to profile</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Select label="Subject *" value={form.subject} onChange={update('subject')} required>
              <option value="">Select a topic</option>
              {SUPPORT_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Textarea
              label="Message *"
              value={form.message}
              onChange={update('message')}
              rows={5}
              placeholder="Describe your issue…"
              required
            />
            <Input
              label="Phone number (optional)"
              type="tel"
              value={form.phone}
              onChange={update('phone')}
              placeholder="+49 123 456 7890"
            />
            <Button type="submit" disabled={loading || !form.subject || !form.message} size="lg" className="w-full">
              {loading ? 'Sending…' : 'Submit ticket'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

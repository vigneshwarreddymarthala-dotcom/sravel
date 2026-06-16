import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import CitySelect from '../../components/ui/CitySelect'
import Textarea from '../../components/ui/Textarea'
import Spinner from '../../components/ui/Spinner'

export default function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('posts').select('*').eq('id', id).single().then(({ data }) => {
      if (!data || data.user_id !== user?.id || data.status !== 'open') {
        navigate('/my-posts'); return
      }
      setPost(data)
      setForm({
        target_city: data.target_city || '',
        date_from: data.date_from,
        date_to: data.date_to,
        title: data.title,
        story: data.story,
      })
    })
  }, [id])

  function update(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  function validate() {
    const e = {}
    if (!form.date_from) e.date_from = 'Required'
    if (!form.date_to) e.date_to = 'Required'
    if (!form.title) e.title = 'Required'
    if (form.title?.length > 80) e.title = 'Max 80 chars'
    if (!form.story) e.story = 'Required'
    if (form.story?.length < 50) e.story = `Min 50 chars`
    if (post?.type === 'seeking' && !form.target_city) e.target_city = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await supabase.from('posts').update({
      target_city: post.type === 'seeking' ? form.target_city : (form.target_city || null),
      date_from: form.date_from,
      date_to: form.date_to,
      title: form.title,
      story: form.story,
    }).eq('id', id)
    setLoading(false)
    navigate('/my-posts')
  }

  if (!post) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Edit post</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
        {post.type === 'seeking' ? (
          <CitySelect label="Destination city" value={form.target_city} onChange={v => setForm(p => ({ ...p, target_city: v }))} error={errors.target_city} required />
        ) : (
          <CitySelect label="Target city (optional)" value={form.target_city} onChange={v => setForm(p => ({ ...p, target_city: v }))} allowAny />
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input label="From *" type="date" value={form.date_from} onChange={update('date_from')} error={errors.date_from} />
          <Input label="To *" type="date" value={form.date_to} onChange={update('date_to')} error={errors.date_to} />
        </div>
        <Input label="Title *" value={form.title} onChange={update('title')} maxLength={80} error={errors.title} />
        <Textarea label="Story *" rows={5} value={form.story} onChange={update('story')} error={errors.story} />
        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import Spinner from '../../components/ui/Spinner'

const GRADIENT_BY_IDX = [
  'from-blue-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-orange-400 to-rose-500',
  'from-violet-400 to-purple-600',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-blue-500',
]

export default function BlogDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlog()
  }, [id])

  async function fetchBlog() {
    const { data } = await supabase
      .from('blogs')
      .select('*, users(id, name, avatar_url, university, home_city)')
      .eq('id', id)
      .single()
    setBlog(data)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this story?')) return
    await supabase.from('blogs').delete().eq('id', id)
    navigate('/blogs')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    )
  }

  if (!blog) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-gray-500">Story not found.</p>
        <button onClick={() => navigate('/blogs')} className="mt-4 text-blue-600 text-sm font-medium">← Back to stories</button>
      </div>
    )
  }

  const grad = GRADIENT_BY_IDX[blog.title.charCodeAt(0) % GRADIENT_BY_IDX.length]
  const date = new Date(blog.created_at).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })
  const isOwner = profile?.id === blog.user_id
  const paragraphs = blog.content.split(/\n\n+/).filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Back + actions bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 pt-12 md:pt-4 pb-3 flex items-center justify-between">
        <button onClick={() => navigate('/blogs')} className="flex items-center gap-1.5 text-sm text-gray-600 font-medium p-1 -ml-1 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Stories
        </button>
        {isOwner && (
          <button onClick={handleDelete} className="text-xs text-red-500 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
            Delete
          </button>
        )}
      </div>

      {/* Hero */}
      <div className={`h-52 bg-gradient-to-br ${grad} relative flex items-end`}>
        {blog.cover_image_url && (
          <img src={blog.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 p-6 w-full">
          <div className="flex items-center gap-2 text-white/80 text-xs font-medium mb-2">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {[blog.place, blog.city, blog.country].filter(Boolean).join(', ')}
          </div>
          <h1 className="text-xl font-black text-white leading-tight">{blog.title}</h1>
        </div>
      </div>

      {/* Author strip */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate(`/profile/${blog.users?.id}`)} className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar name={blog.users?.name || '?'} src={blog.users?.avatar_url} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{blog.users?.name}</p>
            <p className="text-xs text-gray-400">{blog.users?.university} · {date}</p>
          </div>
        </button>
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end">
            {blog.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full whitespace-nowrap">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-6 max-w-2xl mx-auto">
        {/* Location highlight box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900">{blog.place}</p>
            {(blog.city || blog.country) && (
              <p className="text-xs text-blue-600 mt-0.5">{[blog.city, blog.country].filter(Boolean).join(', ')}</p>
            )}
          </div>
        </div>

        {/* Story body */}
        <div className="prose prose-gray max-w-none">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-gray-700 text-base leading-[1.8] mb-4 whitespace-pre-wrap">
              {para}
            </p>
          ))}
        </div>

        {/* All tags */}
        {blog.tags?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map(tag => (
                <span key={tag} className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Back to stories CTA */}
        <div className="mt-10 bg-gray-100 rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-gray-700 mb-1">Enjoyed this story?</p>
          <p className="text-xs text-gray-400 mb-4">Read more travel experiences from fellow students</p>
          <button
            onClick={() => navigate('/blogs')}
            className="bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            More Stories
          </button>
        </div>
      </div>
    </div>
  )
}

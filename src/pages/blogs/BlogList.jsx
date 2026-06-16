import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

function BlogCard({ blog }) {
  const navigate = useNavigate()
  const grad = GRADIENT_BY_IDX[blog.title.charCodeAt(0) % GRADIENT_BY_IDX.length]
  const excerpt = blog.content.replace(/\n/g, ' ').slice(0, 120) + (blog.content.length > 120 ? '…' : '')
  const date = new Date(blog.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div
      onClick={() => navigate(`/blogs/${blog.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
    >
      {/* Cover gradient header */}
      <div className={`h-32 bg-gradient-to-br ${grad} relative flex items-end p-4`}>
        {blog.cover_image_url ? (
          <img src={blog.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : null}
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {blog.place}{blog.country ? `, ${blog.country}` : ''}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1.5 line-clamp-2">{blog.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-3">{excerpt}</p>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {blog.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {/* Author + date */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
          <Avatar name={blog.users?.name || '?'} src={blog.users?.avatar_url} size="xs" />
          <span className="text-xs text-gray-600 font-medium flex-1 truncate">{blog.users?.name}</span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
      </div>
    </div>
  )
}

export default function BlogList() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    fetchBlogs()
  }, [tab, profile])

  async function fetchBlogs() {
    setLoading(true)
    let query = supabase
      .from('blogs')
      .select('*, users(id, name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(30)

    if (tab === 'mine' && profile) {
      query = query.eq('user_id', profile.id)
    }

    const { data } = await query
    setBlogs(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 md:pt-6 pb-3 sticky top-14 md:top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Travel Stories</h1>
            <p className="text-xs text-gray-400 mt-0.5">Experiences from fellow students</p>
          </div>
          <button
            onClick={() => navigate('/blogs/create')}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Write
          </button>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1">
          {[
            { key: 'all', label: 'All Stories' },
            { key: 'mine', label: 'My Stories' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✈️</span>
            </div>
            <p className="text-gray-800 font-semibold text-lg">No stories yet</p>
            <p className="text-gray-400 text-sm mt-2">Be the first to share a travel experience!</p>
            <button
              onClick={() => navigate('/blogs/create')}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Write a story
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {blogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
          </div>
        )}
      </div>
    </div>
  )
}

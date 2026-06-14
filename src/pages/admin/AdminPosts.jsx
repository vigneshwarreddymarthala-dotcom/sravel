import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/ui/Spinner'

const STATUS_STYLES = {
  open: 'bg-green-100 text-green-700',
  accepted: 'bg-blue-100 text-blue-700',
  expired: 'bg-gray-100 text-gray-600',
  removed: 'bg-red-100 text-red-600',
}

const TYPE_STYLES = {
  seeking: 'bg-purple-100 text-purple-700',
  hosting: 'bg-teal-100 text-teal-700',
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminPosts() {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function removePost(post) {
    await supabase.from('posts').update({ status: 'removed' }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'removed' } : p))
    setConfirmRemove(null)
    setExpanded(null)
  }

  async function restorePost(post) {
    await supabase.from('posts').update({ status: 'open' }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'open' } : p))
  }

  const filtered = posts.filter(p => {
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.host_city?.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || p.type === typeFilter
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const counts = {
    all: posts.length,
    open: posts.filter(p => p.status === 'open').length,
    accepted: posts.filter(p => p.status === 'accepted').length,
    removed: posts.filter(p => p.status === 'removed').length,
  }

  return (
    <div>
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Remove this post?</h3>
            <p className="text-sm text-gray-500 mb-1 font-medium truncate">{confirmRemove.title}</p>
            <p className="text-sm text-gray-400 mb-5">It will be hidden from the feed immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRemove(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => removePost(confirmRemove)} className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl py-2.5 text-sm font-medium text-white">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <p className="text-sm text-gray-400 mt-0.5">{posts.length} total</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100/70 p-1 rounded-xl w-fit">
        {[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'open', label: 'Open', count: counts.open },
          { key: 'accepted', label: 'Matched', count: counts.accepted },
          { key: 'removed', label: 'Removed', count: counts.removed },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
            <span className={`ml-1.5 text-xs ${statusFilter === t.key ? 'text-blue-600' : 'text-gray-400'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Search + type filter */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-48 relative">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            placeholder="Search title, user or city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {['all','seeking','hosting'].map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${typeFilter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {f === 'all' ? 'All types' : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="hidden md:grid grid-cols-[3fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
            {['Title', 'Posted by', 'Type', 'Cities', 'Status', ''].map(h => (
              <p key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</p>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No posts match your filters</p>
            </div>
          ) : (
            filtered.map(post => (
              <div key={post.id}>
                <button
                  onClick={() => setExpanded(expanded === post.id ? null : post.id)}
                  className="w-full grid grid-cols-1 md:grid-cols-[3fr_1.5fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 items-center px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(post.created_at)}</p>
                  </div>
                  <p className="hidden md:block text-sm text-gray-600 truncate">{post.users?.name}</p>
                  <span className={`hidden md:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full capitalize w-fit ${TYPE_STYLES[post.type] || 'bg-gray-100 text-gray-600'}`}>{post.type}</span>
                  <p className="hidden md:block text-xs text-gray-500">{post.host_city}{post.target_city ? ` → ${post.target_city}` : ''}</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize w-fit ${STATUS_STYLES[post.status] || 'bg-gray-100 text-gray-600'}`}>{post.status}</span>
                  <svg className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${expanded === post.id ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {expanded === post.id && (
                  <div className="px-5 py-4 bg-gray-50/60 border-b border-gray-100">
                    <div className="flex flex-wrap gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Posted by</p>
                        <p className="text-sm text-gray-800">{post.users?.name} <span className="text-gray-400">({post.users?.email})</span></p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Stay dates</p>
                        <p className="text-sm text-gray-800">{formatDate(post.date_from)} – {formatDate(post.date_to)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Host city</p>
                        <p className="text-sm text-gray-800">{post.host_city}</p>
                      </div>
                      {post.target_city && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Target city</p>
                          <p className="text-sm text-gray-800">{post.target_city}</p>
                        </div>
                      )}
                    </div>
                    {post.story && (
                      <div className="mb-4 p-3 bg-white rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">Story</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-4">{post.story}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {post.status !== 'removed' ? (
                        <button
                          onClick={() => setConfirmRemove(post)}
                          className="text-xs font-semibold px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Remove post
                        </button>
                      ) : (
                        <button
                          onClick={() => restorePost(post)}
                          className="text-xs font-semibold px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 transition-colors"
                        >
                          Restore post
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

function formatDate(d) {
  return new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

function getEffectiveStatus(post) {
  if (post.status === 'accepted' || post.status === 'removed') return post.status
  if (post.status === 'open' && post.date_to && new Date(post.date_to) < new Date()) return 'expired'
  return post.status
}

function statusVariant(s) {
  return { open: 'green', accepted: 'blue', expired: 'gray', removed: 'red' }[s] || 'gray'
}

export default function MyPosts() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchPosts()
  }, [user])

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        connections(id, status, requester:users!connections_requester_id_fkey(id, name))
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function deletePost(post) {
    const activeConn = post.connections?.find(c => c.status === 'active')
    if (activeConn) {
      alert('Cannot delete a post with an active connection.')
      return
    }
    if (!confirm('Delete this post?')) return
    setDeleting(post.id)
    await supabase.from('posts').delete().eq('id', post.id)
    setPosts(prev => prev.filter(p => p.id !== post.id))
    setDeleting(null)
  }

  const postsWithStatus = posts.map(p => ({ ...p, effectiveStatus: getEffectiveStatus(p) }))
  const filtered = filter === 'all' ? postsWithStatus : postsWithStatus.filter(p => p.effectiveStatus === filter)

  const counts = {
    all: postsWithStatus.length,
    open: postsWithStatus.filter(p => p.effectiveStatus === 'open').length,
    accepted: postsWithStatus.filter(p => p.effectiveStatus === 'accepted').length,
    expired: postsWithStatus.filter(p => p.effectiveStatus === 'expired').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-0 sticky top-14 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Posts</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {counts.all} total · {counts.open} open · {counts.accepted} accepted
            </p>
          </div>
          <button
            onClick={() => navigate('/post/create')}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>
        </div>

        <div className="flex gap-0">
          {[
            { key: 'all', label: 'All' },
            { key: 'open', label: 'Open' },
            { key: 'accepted', label: 'Accepted' },
            { key: 'expired', label: 'Expired' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
                filter === f.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {f.label}
              {counts[f.key] > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  filter === f.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">
              {filter === 'all' ? '📋' : filter === 'open' ? '📭' : filter === 'accepted' ? '🤝' : '⏰'}
            </p>
            <p className="text-gray-700 font-semibold text-base">
              {filter === 'all' ? 'No posts yet' : `No ${filter} posts`}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === 'all' && 'Create a post to find your student travel match'}
              {filter === 'open' && 'You have no open posts right now'}
              {filter === 'accepted' && 'No one has accepted your posts yet'}
              {filter === 'expired' && 'No expired posts'}
            </p>
            {filter === 'all' && (
              <Button className="mt-5" onClick={() => navigate('/post/create')}>
                Create your first post
              </Button>
            )}
          </div>
        ) : (
          filtered.map(post => {
            const activeConn = post.connections?.find(c => c.status === 'active')
            const acceptedBy = activeConn?.requester
            return (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Accepted banner */}
                {post.effectiveStatus === 'accepted' && (
                  <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-xs font-semibold text-blue-700 flex-1">
                      {acceptedBy ? `${acceptedBy.name} accepted your post — you're connected!` : "Your post was accepted — you're connected!"}
                    </p>
                  </div>
                )}

                {/* Expired banner */}
                {post.effectiveStatus === 'expired' && (
                  <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-gray-500">Travel date has passed — this post has expired</p>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={statusVariant(post.effectiveStatus)}>{post.effectiveStatus}</Badge>
                      <Badge variant={post.type === 'seeking' ? 'purple' : 'green'}>{post.type}</Badge>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {formatDate(post.date_from)} – {formatDate(post.date_to)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{post.title}</h3>
                  <p className="text-xs text-gray-500">
                    📍 {post.host_city}{post.target_city && ` → ${post.target_city}`}
                  </p>

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="text-xs text-blue-600 font-medium hover:underline"
                    >
                      View post
                    </button>

                    {post.effectiveStatus === 'open' && (
                      <>
                        <span className="text-gray-300">·</span>
                        <button
                          onClick={() => navigate(`/post/${post.id}/edit`)}
                          className="text-xs text-blue-600 font-medium hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">·</span>
                        <button
                          onClick={() => deletePost(post)}
                          disabled={deleting === post.id}
                          className="text-xs text-red-500 font-medium hover:underline disabled:opacity-50"
                        >
                          {deleting === post.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </>
                    )}

                    {post.effectiveStatus === 'accepted' && activeConn && (
                      <button
                        onClick={() => navigate(`/messages/${activeConn.id}`)}
                        className="ml-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat with {acceptedBy?.name || 'them'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

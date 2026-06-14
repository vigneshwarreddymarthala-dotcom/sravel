import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

function statusVariant(s) {
  return { open: 'green', accepted: 'blue', expired: 'gray', removed: 'red' }[s] || 'gray'
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
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
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function deletePost(post) {
    const { data: conn } = await supabase
      .from('connections')
      .select('id')
      .eq('post_id', post.id)
      .eq('status', 'active')
      .maybeSingle()
    if (conn) {
      alert('Cannot delete a post with an active connection.')
      return
    }
    if (!confirm('Delete this post?')) return
    setDeleting(post.id)
    await supabase.from('posts').delete().eq('id', post.id)
    setPosts(prev => prev.filter(p => p.id !== post.id))
    setDeleting(null)
  }

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 pt-12 pb-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-3">My Posts</h1>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'open', 'accepted', 'expired'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-700 font-medium">No posts yet</p>
            <Button className="mt-4" onClick={() => navigate('/post/create')}>Create your first post</Button>
          </div>
        ) : (
          filtered.map(post => (
            <div key={post.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={statusVariant(post.status)}>{post.status}</Badge>
                    <Badge variant={post.type === 'seeking' ? 'purple' : 'green'}>{post.type}</Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{post.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {post.host_city}{post.target_city && ` → ${post.target_city}`} · {formatDate(post.date_from)} – {formatDate(post.date_to)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  View
                </button>
                {post.status === 'open' && (
                  <>
                    <span className="text-gray-200">·</span>
                    <button
                      onClick={() => navigate(`/post/${post.id}/edit`)}
                      className="text-xs text-blue-600 font-medium hover:underline"
                    >
                      Edit
                    </button>
                    <span className="text-gray-200">·</span>
                    <button
                      onClick={() => deletePost(post)}
                      disabled={deleting === post.id}
                      className="text-xs text-red-500 font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
                {post.status === 'accepted' && (
                  <>
                    <span className="text-gray-200">·</span>
                    <button
                      onClick={() => navigate('/messages')}
                      className="text-xs text-blue-600 font-medium hover:underline"
                    >
                      Go to chat
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

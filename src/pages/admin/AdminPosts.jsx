import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

function statusVariant(s) {
  return { open: 'green', accepted: 'blue', expired: 'gray', removed: 'red' }[s] || 'gray'
}

export default function AdminPosts() {
  const [posts, setPosts] = useState([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

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
    if (!confirm('Remove this post?')) return
    await supabase.from('posts').update({ status: 'removed' }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'removed' } : p))
  }

  const filtered = posts.filter(p =>
    (typeFilter === 'all' || p.type === typeFilter) &&
    (statusFilter === 'all' || p.status === statusFilter)
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Posts</h1>
      <div className="flex gap-3 mb-4">
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All types</option>
          <option value="seeking">Seeking</option>
          <option value="hosting">Hosting</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All status</option>
          <option value="open">Open</option>
          <option value="accepted">Accepted</option>
          <option value="expired">Expired</option>
          <option value="removed">Removed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Title', 'Posted by', 'Type', 'Cities', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-40 truncate">{post.title}</td>
                  <td className="px-4 py-3 text-gray-600">{post.users?.name}</td>
                  <td className="px-4 py-3"><Badge variant={post.type === 'seeking' ? 'purple' : 'green'}>{post.type}</Badge></td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{post.host_city}{post.target_city && ` → ${post.target_city}`}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(post.status)}>{post.status}</Badge></td>
                  <td className="px-4 py-3">
                    {post.status !== 'removed' && (
                      <button onClick={() => removePost(post)} className="text-xs text-red-500 hover:underline">
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No posts found</div>}
        </div>
      )}
    </div>
  )
}

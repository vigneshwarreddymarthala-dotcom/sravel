import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

function formatDate(d) {
  return new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Activity() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState('received')
  const [received, setReceived] = useState([])
  const [accepted, setAccepted] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchActivity()
  }, [user])

  async function fetchActivity() {
    const [recRes, accRes] = await Promise.all([
      supabase
        .from('connections')
        .select(`
          id, status, created_at,
          posts(id, title, type, date_from, date_to),
          requester:users!connections_requester_id_fkey(id, name, university)
        `)
        .eq('acceptor_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('connections')
        .select(`
          id, status, created_at,
          posts(id, title, type, date_from, date_to),
          acceptor:users!connections_acceptor_id_fkey(id, name, university)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false }),
    ])
    setReceived(recRes.data || [])
    setAccepted(accRes.data || [])
    setLoading(false)
  }

  const list = tab === 'received' ? received : accepted

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 pt-12 pb-0 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Activity</h1>
        <div className="flex gap-0 border-b border-gray-100">
          {[
            { key: 'received', label: 'Requests received' },
            { key: 'accepted', label: 'Posts I accepted' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
              {t.key === 'received' && received.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-1.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full inline-flex items-center justify-center">
                  {received.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-700 font-medium">
              {tab === 'received' ? 'No requests yet' : "You haven't accepted any posts"}
            </p>
          </div>
        ) : (
          list.map(conn => {
            const other = tab === 'received' ? conn.requester : conn.acceptor
            return (
              <div key={conn.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Connected banner */}
                <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-xs font-semibold text-blue-700">
                    {tab === 'received'
                      ? `${other?.name} accepted your post — you're connected!`
                      : "You're already connected on this post"}
                  </p>
                </div>

                <div className="p-4">
                  {/* User row */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={other?.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{other?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{other?.university}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(conn.created_at)}</span>
                  </div>

                  {/* Post info */}
                  <div
                    className="bg-gray-50 rounded-xl px-3 py-2.5 mb-3 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate(`/post/${conn.posts?.id}`)}
                  >
                    <p className="text-xs text-gray-400 mb-0.5">Connected via post</p>
                    <p className="text-sm text-gray-800 font-medium line-clamp-1">{conn.posts?.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(conn.posts?.date_from)} – {formatDate(conn.posts?.date_to)}
                    </p>
                  </div>

                  {/* Chat button */}
                  <button
                    onClick={() => navigate(`/messages/${conn.id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Open chat with {other?.name}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import Spinner from '../../components/ui/Spinner'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function timeAgo(d) {
  const mins = Math.floor((Date.now() - new Date(d)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Activity() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState('received')
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchActivity()
  }, [user])

  async function fetchActivity() {
    setLoading(true)
    setError(null)

    // Single query — same pattern as Messages.jsx which is confirmed working
    const { data, error: err } = await supabase
      .from('connections')
      .select(`
        id, status, created_at, requester_id, acceptor_id,
        posts(id, title, type, date_from, date_to, host_city),
        requester:users!connections_requester_id_fkey(id, name, university),
        acceptor:users!connections_acceptor_id_fkey(id, name, university)
      `)
      .or(`requester_id.eq.${user.id},acceptor_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setConnections(data || [])
    setLoading(false)
  }

  // "received" = someone accepted MY post → I am the acceptor
  const received = connections.filter(c => c.acceptor_id === user.id)
  // "accepted" = I accepted someone else's post → I am the requester
  const accepted = connections.filter(c => c.requester_id === user.id)

  const list = tab === 'received' ? received : accepted

  function getOther(conn) {
    return conn.requester_id === user.id ? conn.acceptor : conn.requester
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-12 md:pt-6 pb-0 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Activity</h1>
            <p className="text-xs text-gray-400 mt-0.5">Your connections history</p>
          </div>
          <button
            onClick={fetchActivity}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="flex gap-0">
          {[
            { key: 'received', label: 'Requests received', count: received.length },
            { key: 'accepted', label: 'Posts I accepted', count: accepted.length },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button onClick={fetchActivity} className="text-blue-600 text-sm font-medium hover:underline">Try again</button>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-700 font-semibold text-base">
              {tab === 'received' ? 'No requests received yet' : "You haven't accepted any posts yet"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {tab === 'received'
                ? 'When someone accepts your post, they will appear here'
                : 'Browse the feed and accept a post to connect with a student'}
            </p>
            <button
              onClick={() => navigate('/feed')}
              className="mt-5 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Browse feed
            </button>
          </div>
        ) : (
          list.map(conn => {
            const other = getOther(conn)
            const isReceived = tab === 'received'
            return (
              <div key={conn.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Connected banner */}
                <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-xs font-semibold text-blue-700 flex-1">
                    {isReceived
                      ? `${other?.name} accepted your post — you're connected!`
                      : "You're already connected on this post"}
                  </p>
                  <span className="text-[11px] text-blue-400 shrink-0">{timeAgo(conn.created_at)}</span>
                </div>

                <div className="p-4">
                  {/* User row */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={other?.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{other?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{other?.university}</p>
                    </div>
                  </div>

                  {/* Post info */}
                  {conn.posts && (
                    <button
                      onClick={() => navigate(`/post/${conn.posts.id}`)}
                      className="w-full bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl px-3 py-2.5 mb-3 text-left"
                    >
                      <p className="text-[11px] text-gray-400 mb-0.5">Connected via post</p>
                      <p className="text-sm text-gray-800 font-medium line-clamp-1">{conn.posts.title}</p>
                      {conn.posts.date_from && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          📅 {formatDate(conn.posts.date_from)} – {formatDate(conn.posts.date_to)}
                        </p>
                      )}
                    </button>
                  )}

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

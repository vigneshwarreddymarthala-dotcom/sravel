import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import Spinner from '../../components/ui/Spinner'

function timeAgo(d) {
  if (!d) return ''
  const diff = Date.now() - new Date(d)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

export default function Messages() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchConnections()
  }, [user])

  async function fetchConnections() {
    const { data } = await supabase
      .from('connections')
      .select(`
        id, status, created_at,
        posts(id, title, type),
        requester:users!connections_requester_id_fkey(id, name),
        acceptor:users!connections_acceptor_id_fkey(id, name)
      `)
      .or(`requester_id.eq.${user.id},acceptor_id.eq.${user.id}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (data) {
      const enriched = await Promise.all(
        data.map(async (conn) => {
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at, sender_id, read')
            .eq('connection_id', conn.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('connection_id', conn.id)
            .eq('read', false)
            .neq('sender_id', user.id)
          return { ...conn, lastMsg, unread: count || 0 }
        })
      )
      setConnections(enriched)
    }
    setLoading(false)
  }

  function getOther(conn) {
    return conn.requester?.id === user.id ? conn.acceptor : conn.requester
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 pt-12 md:pt-6 pb-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <p className="text-xs text-gray-400 mt-0.5">Your active connections</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : connections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-9 h-9 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700">No conversations yet</p>
          <p className="text-sm text-gray-400 mt-1">Accept a post on the feed to start chatting</p>
          <button
            onClick={() => navigate('/feed')}
            className="mt-5 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Browse feed
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {connections.map(conn => {
            const other = getOther(conn)
            const isMyMsg = conn.lastMsg?.sender_id === user.id
            return (
              <button
                key={conn.id}
                onClick={() => navigate(`/messages/${conn.id}`)}
                className="w-full flex items-center gap-3 px-4 md:px-6 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              >
                <div className="relative shrink-0">
                  <Avatar name={other?.name} size="md" />
                  {conn.unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {conn.unread > 9 ? '9+' : conn.unread}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${conn.unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                      {other?.name}
                    </p>
                    <span className={`text-[11px] shrink-0 ${conn.unread > 0 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                      {timeAgo(conn.lastMsg?.created_at || conn.created_at)}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${conn.unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                    {conn.lastMsg
                      ? `${isMyMsg ? 'You: ' : ''}${conn.lastMsg.content}`
                      : conn.posts?.title || 'Connection started'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

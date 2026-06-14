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
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
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
          const unread = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('connection_id', conn.id)
            .eq('read', false)
            .neq('sender_id', user.id)
          return { ...conn, lastMsg, unread: unread.count || 0 }
        })
      )
      setConnections(enriched)
    }
    setLoading(false)
  }

  function getOtherUser(conn) {
    return conn.requester?.id === user.id ? conn.acceptor : conn.requester
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 pt-12 pb-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
      </div>

      <div className="divide-y divide-gray-100 bg-white">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : connections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-700 font-medium">No conversations yet</p>
            <p className="text-gray-400 text-sm mt-1">Accept a post to start chatting</p>
          </div>
        ) : (
          connections.map(conn => {
            const other = getOtherUser(conn)
            return (
              <button
                key={conn.id}
                onClick={() => navigate(`/messages/${conn.id}`)}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 text-left"
              >
                <Avatar name={other?.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm">{other?.name}</p>
                    <span className="text-xs text-gray-400">{timeAgo(conn.lastMsg?.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {conn.lastMsg ? conn.lastMsg.content : conn.posts?.title || 'Connection started'}
                  </p>
                </div>
                {conn.unread > 0 && (
                  <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center shrink-0">
                    {conn.unread}
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

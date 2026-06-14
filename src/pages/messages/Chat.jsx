import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import Spinner from '../../components/ui/Spinner'

function formatTime(d) {
  return new Date(d).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(d) {
  return new Date(d).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
}

function groupByDay(messages) {
  const groups = []
  let current = null
  for (const msg of messages) {
    const day = new Date(msg.created_at).toDateString()
    if (day !== current) { groups.push({ day, messages: [] }); current = day }
    groups[groups.length - 1].messages.push(msg)
  }
  return groups
}

export default function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [connection, setConnection] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel(`chat-${id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `connection_id=eq.${id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
        markRead()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchData() {
    const { data: conn } = await supabase
      .from('connections')
      .select(`
        id, status,
        posts(title),
        requester:users!connections_requester_id_fkey(id, name),
        acceptor:users!connections_acceptor_id_fkey(id, name)
      `)
      .eq('id', id)
      .single()
    if (!conn) { navigate('/messages'); return }
    setConnection(conn)
    const other = conn.requester?.id === user.id ? conn.acceptor : conn.requester
    setOtherUser(other)

    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('connection_id', id)
      .order('created_at')
    setMessages(msgs || [])
    setLoading(false)
    markRead()
  }

  async function markRead() {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('connection_id', id)
      .neq('sender_id', user.id)
  }

  async function sendMessage(e) {
    e?.preventDefault()
    if (!text.trim()) return
    const content = text.trim()
    setText('')
    await supabase.from('messages').insert({
      connection_id: id,
      sender_id: user.id,
      content,
      read: false,
    })
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const groups = groupByDay(messages)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 pt-12 pb-3 sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate('/messages')} className="p-1 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <Avatar name={otherUser?.name} size="sm" />
        <div>
          <p className="font-semibold text-gray-900 text-sm leading-tight">{otherUser?.name}</p>
          <p className="text-xs text-gray-500 truncate max-w-48">{connection?.posts?.title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 flex flex-col gap-4">
        {groups.map(group => (
          <div key={group.day}>
            <div className="text-center mb-3">
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {formatDay(group.messages[0].created_at)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {group.messages.map(msg => {
                const isMine = msg.sender_id === user.id
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      isMine
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-0.5 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                        {formatTime(msg.created_at)}
                        {isMine && msg.read && ' ✓'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 pb-safe">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <input
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message…"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center disabled:opacity-40"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

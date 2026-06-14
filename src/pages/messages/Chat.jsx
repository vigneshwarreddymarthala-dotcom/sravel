import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import Spinner from '../../components/ui/Spinner'

function formatTime(d) {
  return new Date(d).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(d) {
  const date = new Date(d)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
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
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

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
        posts(title, type),
        requester:users!connections_requester_id_fkey(id, name, university),
        acceptor:users!connections_acceptor_id_fkey(id, name, university)
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
    if (!text.trim() || sending) return
    const content = text.trim()
    setText('')
    setSending(true)
    await supabase.from('messages').insert({
      connection_id: id,
      sender_id: user.id,
      content,
      read: false,
    })
    setSending(false)
    inputRef.current?.focus()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#efeae2]">
        <Spinner size="lg" />
      </div>
    )
  }

  const groups = groupByDay(messages)

  return (
    <div className="flex flex-col h-screen md:h-screen bg-[#efeae2]">
      {/* Header — WhatsApp style */}
      <div className="bg-[#075e54] text-white px-4 pt-12 md:pt-4 pb-3 flex items-center gap-3 shadow-md z-10 shrink-0">
        <button
          onClick={() => navigate('/messages')}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors md:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <Link to={`/profile/${otherUser?.id}`}>
          <Avatar name={otherUser?.name} size="md" className="ring-2 ring-white/30" />
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={`/profile/${otherUser?.id}`} className="hover:underline">
            <p className="font-semibold text-base leading-tight truncate">{otherUser?.name}</p>
          </Link>
          <p className="text-xs text-green-200 truncate mt-0.5">{otherUser?.university}</p>
        </div>

        <div className="flex items-center gap-1">
          <Link
            to={`/post/${connection?.posts?.id ?? ''}`}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="View post"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Post context banner */}
      {connection?.posts?.title && (
        <div className="bg-[#dcf8c6] border-b border-[#c8e6b0] px-4 py-2 flex items-center gap-2 shrink-0">
          <div className="w-1 h-8 bg-[#25d366] rounded-full shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-[#075e54] font-semibold">Connected via post</p>
            <p className="text-xs text-gray-600 truncate">{connection.posts.title}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4 md:px-6"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c8c8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="bg-white/80 rounded-2xl px-6 py-4 text-center shadow-sm">
              <p className="text-2xl mb-2">👋</p>
              <p className="text-gray-700 font-medium text-sm">Say hello to {otherUser?.name}!</p>
              <p className="text-gray-400 text-xs mt-1">Messages are end-to-end private</p>
            </div>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.day} className="mb-2">
              {/* Day divider */}
              <div className="flex items-center justify-center my-4">
                <span className="bg-white/80 text-gray-500 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                  {formatDay(group.messages[0].created_at)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {group.messages.map((msg, idx) => {
                  const isMine = msg.sender_id === user.id
                  const prevMsg = group.messages[idx - 1]
                  const showTail = !prevMsg || prevMsg.sender_id !== msg.sender_id

                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${showTail ? 'mt-2' : 'mt-0.5'}`}>
                      <div
                        className={`relative max-w-[75%] md:max-w-[60%] px-3 py-2 shadow-sm ${
                          isMine
                            ? 'bg-[#dcf8c6] text-gray-800 rounded-2xl rounded-tr-sm'
                            : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm'
                        }`}
                      >
                        {/* Tail */}
                        {showTail && (
                          <div
                            className={`absolute top-0 w-3 h-3 ${
                              isMine
                                ? '-right-1.5 border-l-8 border-b-8 border-l-[#dcf8c6] border-b-transparent border-t-0'
                                : '-left-1.5 border-r-8 border-b-8 border-r-white border-b-transparent border-t-0'
                            }`}
                            style={{
                              borderStyle: 'solid',
                              borderColor: isMine
                                ? '#dcf8c6 transparent transparent transparent'
                                : 'white transparent transparent transparent',
                              borderWidth: '8px 8px 0 0',
                              transform: isMine ? 'scaleX(-1)' : 'none',
                            }}
                          />
                        )}

                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-12">{msg.content}</p>

                        {/* Time + read receipt */}
                        <div className={`absolute bottom-1.5 right-2.5 flex items-center gap-1`}>
                          <span className="text-[10px] text-gray-400 leading-none">{formatTime(msg.created_at)}</span>
                          {isMine && (
                            <span className={`text-[10px] leading-none ${msg.read ? 'text-blue-500' : 'text-gray-400'}`}>
                              {msg.read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar — WhatsApp style */}
      <div className="bg-[#f0f0f0] px-3 py-2 pb-safe shrink-0 border-t border-gray-200">
        <form onSubmit={sendMessage} className="flex items-end gap-2 max-w-3xl mx-auto">
          {/* Emoji placeholder */}
          <button type="button" className="p-2.5 text-gray-500 hover:text-gray-700 flex-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Message input */}
          <div className="flex-1 bg-white rounded-2xl px-4 py-2.5 shadow-sm border border-gray-100">
            <textarea
              ref={inputRef}
              className="w-full text-sm text-gray-900 resize-none focus:outline-none leading-5 max-h-28"
              placeholder="Type a message"
              rows={1}
              value={text}
              onChange={e => {
                setText(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 112) + 'px'
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-11 h-11 bg-[#25d366] rounded-full flex items-center justify-center flex-none shadow hover:bg-[#20c25d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

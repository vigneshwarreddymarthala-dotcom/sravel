import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import Spinner from '../../components/ui/Spinner'

function formatTime(d) {
  return new Date(d).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function formatDayLabel(d) {
  const date = new Date(d)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
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
  const textareaRef = useRef(null)

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
        posts(id, title, type),
        requester:users!connections_requester_id_fkey(id, name, university),
        acceptor:users!connections_acceptor_id_fkey(id, name, university)
      `)
      .eq('id', id)
      .single()
    if (!conn) { navigate('/messages'); return }
    setConnection(conn)
    setOtherUser(conn.requester?.id === user.id ? conn.acceptor : conn.requester)

    const { data: msgs } = await supabase
      .from('messages').select('*').eq('connection_id', id).order('created_at')
    setMessages(msgs || [])
    setLoading(false)
    markRead()
  }

  async function markRead() {
    await supabase.from('messages').update({ read: true })
      .eq('connection_id', id).neq('sender_id', user.id)
  }

  async function sendMessage(e) {
    e?.preventDefault()
    if (!text.trim() || sending) return
    const content = text.trim()
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setSending(true)
    await supabase.from('messages').insert({
      connection_id: id, sender_id: user.id, content, read: false,
    })
    setSending(false)
    inputRef.current?.focus()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50" style={{ height: '100dvh' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  const groups = groupByDay(messages)

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: '100dvh' }}>

      {/* ── Header ── */}
      <div
        className="bg-white border-b border-gray-100 px-3 flex items-center gap-3 shrink-0 shadow-sm"
        style={{ paddingTop: 'max(44px, env(safe-area-inset-top, 44px))', paddingBottom: '10px' }}
      >
        <button
          onClick={() => navigate('/messages')}
          className="p-2 -ml-1 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <Link to={`/profile/${otherUser?.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar name={otherUser?.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{otherUser?.name}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{otherUser?.university}</p>
          </div>
        </Link>

        {connection?.posts?.id && (
          <Link
            to={`/post/${connection.posts.id}`}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-blue-600 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </Link>
        )}
      </div>

      {/* ── Post context pill ── */}
      {connection?.posts?.title && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2.5 shrink-0">
          <div className="w-0.5 h-7 bg-blue-500 rounded-full shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-blue-600 leading-tight">Connected via post</p>
            <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">{connection.posts.title}</p>
          </div>
        </div>
      )}

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto overscroll-none">
        <div className="px-3 py-4 md:px-5 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700">Start the conversation</p>
                <p className="text-sm text-gray-400 mt-1">Say hi to {otherUser?.name} 👋</p>
              </div>
            </div>
          ) : (
            groups.map(group => (
              <div key={group.day}>
                {/* Day label */}
                <div className="flex items-center justify-center my-4">
                  <span className="bg-white text-gray-400 text-xs font-medium px-3 py-1 rounded-full shadow-sm border border-gray-100">
                    {formatDayLabel(group.messages[0].created_at)}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  {group.messages.map((msg, idx) => {
                    const isMine = msg.sender_id === user.id
                    const prev = group.messages[idx - 1]
                    const next = group.messages[idx + 1]
                    const isFirst = !prev || prev.sender_id !== msg.sender_id
                    const isLast = !next || next.sender_id !== msg.sender_id

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isFirst ? 'mt-3' : 'mt-0.5'}`}
                      >
                        {/* Other user avatar — only on last message in group */}
                        {!isMine && (
                          <div className="w-7 shrink-0 mr-1.5 flex items-end">
                            {isLast ? (
                              <Avatar name={otherUser?.name} size="sm" />
                            ) : null}
                          </div>
                        )}

                        <div className={`max-w-[72%] md:max-w-[60%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                          {/* Bubble */}
                          <div
                            className={`relative px-3.5 py-2.5 shadow-sm ${
                              isMine
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-100'
                            } ${
                              isMine
                                ? isFirst && isLast ? 'rounded-2xl rounded-tr-sm'
                                  : isFirst ? 'rounded-2xl rounded-tr-sm rounded-br-lg'
                                  : isLast ? 'rounded-2xl rounded-tr-lg rounded-br-sm'
                                  : 'rounded-2xl rounded-r-lg'
                                : isFirst && isLast ? 'rounded-2xl rounded-tl-sm'
                                  : isFirst ? 'rounded-2xl rounded-tl-sm rounded-bl-lg'
                                  : isLast ? 'rounded-2xl rounded-tl-lg rounded-bl-sm'
                                  : 'rounded-2xl rounded-l-lg'
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap" style={{ paddingRight: '52px' }}>
                              {msg.content}
                            </p>

                            {/* Timestamp + tick — inside bubble */}
                            <div className="absolute bottom-1.5 right-2.5 flex items-center gap-0.5">
                              <span className={`text-[10px] leading-none ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                                {formatTime(msg.created_at)}
                              </span>
                              {isMine && (
                                <svg
                                  viewBox="0 0 16 11"
                                  className={`w-4 h-3 ${msg.read ? 'text-blue-200' : 'text-blue-300'}`}
                                  fill="currentColor"
                                >
                                  {msg.read ? (
                                    /* double tick */
                                    <path d="M11.071.653a.75.75 0 0 1 .029 1.06l-6.5 7a.75.75 0 0 1-1.046.061L.554 6.025a.75.75 0 0 1 .992-1.125l2.417 2.13L10.01.682a.75.75 0 0 1 1.061-.029Zm3 0a.75.75 0 0 1 .029 1.06l-6.5 7a.75.75 0 0 1-1.046.061l-.975-.86a.75.75 0 0 1 .991-1.126l.483.426 5.957-6.532a.75.75 0 0 1 1.06-.029Z" />
                                  ) : (
                                    /* single tick */
                                    <path d="M13.071.653a.75.75 0 0 1 .029 1.06l-6.5 7a.75.75 0 0 1-1.046.061L1.554 4.775a.75.75 0 0 1 .992-1.125l3.417 3.013L12.01.682a.75.75 0 0 1 1.061-.029Z" />
                                  )}
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* My avatar spacer */}
                        {isMine && <div className="w-1 shrink-0 ml-1" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar ── */}
      <div
        className="bg-white border-t border-gray-100 px-3 shrink-0"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))', paddingTop: '10px' }}
      >
        <form onSubmit={sendMessage} className="flex items-end gap-2 max-w-3xl mx-auto">
          {/* Textarea */}
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 flex items-end gap-2 min-h-[44px]">
            <textarea
              ref={el => { inputRef.current = el; textareaRef.current = el }}
              className="flex-1 bg-transparent text-sm text-gray-900 resize-none focus:outline-none leading-5 max-h-32 placeholder-gray-400"
              placeholder="Message…"
              rows={1}
              value={text}
              onChange={e => {
                setText(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
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
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: text.trim() ? '#2563eb' : '#9ca3af' }}
          >
            <svg className="w-5 h-5 text-white translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

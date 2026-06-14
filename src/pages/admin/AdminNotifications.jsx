import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/ui/Spinner'

function timeAgo(d) {
  const mins = Math.floor((Date.now() - new Date(d)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [])
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg z-50">
      {msg}
    </div>
  )
}

export default function AdminNotifications() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ title: '', body: '', target: 'all', userId: '' })
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [userSearch, setUserSearch] = useState('')

  useEffect(() => {
    fetchUsers()
    fetchHistory()
  }, [])

  async function fetchUsers() {
    const { data } = await supabase
      .from('users')
      .select('id, name, email, university')
      .neq('role', 'admin')
      .order('name')
    setUsers(data || [])
  }

  async function fetchHistory() {
    setLoadingHistory(true)
    const { data } = await supabase
      .from('notifications')
      .select('id, title, body, type, created_at, user_id, users(name)')
      .eq('type', 'admin')
      .order('created_at', { ascending: false })
      .limit(30)
    setHistory(data || [])
    setLoadingHistory(false)
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSending(true)

    let error
    if (form.target === 'all') {
      const { error: err } = await supabase.rpc('broadcast_notification', {
        p_title: form.title,
        p_body: form.body || null,
      })
      error = err
    } else {
      if (!form.userId) { setSending(false); return }
      const { error: err } = await supabase.rpc('send_notification', {
        p_user_id: form.userId,
        p_title: form.title,
        p_body: form.body || null,
      })
      error = err
    }

    setSending(false)
    if (error) {
      setToast('Failed to send: ' + error.message)
    } else {
      setToast(form.target === 'all' ? 'Sent to all students!' : 'Notification sent!')
      setForm({ title: '', body: '', target: 'all', userId: '' })
      setUserSearch('')
      fetchHistory()
    }
  }

  const filteredUsers = userSearch.trim()
    ? users.filter(u =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
      )
    : users

  const selectedUser = users.find(u => u.id === form.userId)

  return (
    <div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-400 mt-0.5">Send announcements to all students or a specific user</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Compose notification</h2>
          <form onSubmit={handleSend} className="flex flex-col gap-4">
            {/* Target */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Send to</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, target: 'all', userId: '' }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    form.target === 'all'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  All students
                </button>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, target: 'user' }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    form.target === 'user'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Specific user
                </button>
              </div>
            </div>

            {/* User picker */}
            {form.target === 'user' && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Select user</p>
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 mb-2"
                />
                {selectedUser && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm font-semibold text-blue-800 flex-1">{selectedUser.name}</p>
                    <button type="button" onClick={() => { setForm(p => ({ ...p, userId: '' })); setUserSearch('') }} className="text-blue-400 hover:text-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {!selectedUser && (
                  <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                    {filteredUsers.slice(0, 20).map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => { setForm(p => ({ ...p, userId: u.id })); setUserSearch('') }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </button>
                    ))}
                    {filteredUsers.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No users found</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Title *</p>
              <input
                type="text"
                placeholder="e.g. Platform update, New feature…"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>

            {/* Body */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Message (optional)</p>
              <textarea
                rows={3}
                placeholder="More details…"
                value={form.body}
                onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>

            <button
              type="submit"
              disabled={sending || !form.title.trim() || (form.target === 'user' && !form.userId)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {sending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {form.target === 'all' ? `Send to all students (${users.length})` : 'Send notification'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Recently sent</h2>
          {loadingHistory ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm text-gray-400">No notifications sent yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map(n => (
                <div key={n.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                    {n.body && <p className="text-xs text-gray-500 line-clamp-1">{n.body}</p>}
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {n.users ? `To ${n.users.name}` : 'Broadcast'} · {timeAgo(n.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

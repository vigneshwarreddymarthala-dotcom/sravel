import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/ui/Spinner'

function formatDate(d) {
  return new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function timeAgo(d) {
  const mins = Math.floor((Date.now() - new Date(d)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function initials(name) {
  if (!name) return '?'
  return name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function UserAvatar({ name }) {
  const colors = ['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500']
  const c = name ? colors[name.charCodeAt(0) % colors.length] : colors[0]
  return (
    <div className={`w-9 h-9 ${c} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}>
      {initials(name)}
    </div>
  )
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('open')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [adminNote, setAdminNote] = useState({})

  useEffect(() => { fetchTickets() }, [])

  async function fetchTickets() {
    const { data } = await supabase
      .from('support_tickets')
      .select('*, users(id, name, email)')
      .order('created_at', { ascending: false })
    setTickets(data || [])
    setLoading(false)
  }

  async function resolve(ticket) {
    await supabase.from('support_tickets').update({ status: 'resolved', admin_note: adminNote[ticket.id] || null }).eq('id', ticket.id)
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'resolved', admin_note: adminNote[ticket.id] } : t))
    setExpanded(null)
  }

  async function reopen(ticket) {
    await supabase.from('support_tickets').update({ status: 'open' }).eq('id', ticket.id)
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'open' } : t))
  }

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)
  const openCount = tickets.filter(t => t.status === 'open').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-400 mt-0.5">{openCount} open {openCount !== 1 ? 'tickets' : 'ticket'}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100/70 p-1 rounded-xl w-fit">
        {[
          { key: 'open', label: 'Open', count: tickets.filter(t => t.status === 'open').length },
          { key: 'resolved', label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length },
          { key: 'all', label: 'All', count: tickets.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 text-xs ${filter === t.key && t.key === 'open' ? 'text-orange-500' : 'text-gray-400'}`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🎫</p>
          <p className="text-gray-500 font-medium">No {filter !== 'all' ? filter : ''} tickets</p>
          <p className="text-sm text-gray-400 mt-1">All caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(ticket => (
            <div
              key={ticket.id}
              className={`bg-white rounded-2xl border transition-all ${expanded === ticket.id ? 'border-blue-200 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <button
                onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                className="w-full p-5 text-left"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar name={ticket.users?.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{ticket.users?.name}</p>
                        <p className="text-xs text-gray-400">{ticket.users?.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {ticket.status}
                        </span>
                        <span className="text-xs text-gray-400">{timeAgo(ticket.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-blue-700 truncate">{ticket.subject || '(No subject)'}</p>
                    {!expanded && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.message}</p>
                    )}
                  </div>
                </div>
              </button>

              {expanded === ticket.id && (
                <div className="px-5 pb-5 border-t border-gray-50">
                  <div className="pt-4">
                    {/* Message */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-xs text-gray-400 mb-1.5">Message</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{ticket.message}</p>
                    </div>

                    {/* Contact info */}
                    <div className="flex flex-wrap gap-4 mb-4">
                      {ticket.phone && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                          <p className="text-sm text-gray-800">{ticket.phone}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Submitted</p>
                        <p className="text-sm text-gray-800">{formatDate(ticket.created_at)}</p>
                      </div>
                    </div>

                    {/* Existing admin note */}
                    {ticket.admin_note && ticket.status === 'resolved' && (
                      <div className="bg-blue-50 rounded-xl p-3 mb-4 border border-blue-100">
                        <p className="text-xs text-blue-500 mb-1 font-medium">Admin note</p>
                        <p className="text-sm text-blue-800">{ticket.admin_note}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {ticket.status === 'open' ? (
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-xs text-gray-500 font-medium block mb-1.5">Admin note (optional)</label>
                          <textarea
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            rows={2}
                            placeholder="Add a note for your records…"
                            value={adminNote[ticket.id] || ''}
                            onChange={e => setAdminNote(p => ({ ...p, [ticket.id]: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => resolve(ticket)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                          >
                            Mark as resolved
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => reopen(ticket)}
                        className="text-xs font-semibold px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        Reopen ticket
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

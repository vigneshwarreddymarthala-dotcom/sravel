import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

export default function AdminSupport() {
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTickets() }, [])

  async function fetchTickets() {
    const { data } = await supabase
      .from('support_tickets')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false })
    setTickets(data || [])
    setLoading(false)
  }

  async function resolve(ticket) {
    await supabase.from('support_tickets').update({ status: 'resolved' }).eq('id', ticket.id)
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'resolved' } : t))
  }

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Support Tickets</h1>
      <div className="flex gap-3 mb-4">
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{ticket.users?.name}</p>
                    <Badge variant={ticket.status === 'resolved' ? 'green' : 'orange'}>{ticket.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{ticket.users?.email} {ticket.phone && `· ${ticket.phone}`}</p>
                  <p className="text-sm font-medium text-blue-700 mb-1">{ticket.subject}</p>
                  <p className="text-sm text-gray-700">{ticket.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(ticket.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                {ticket.status === 'open' && (
                  <button onClick={() => resolve(ticket)} className="text-sm text-green-600 font-medium hover:underline shrink-0">
                    Mark resolved
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No tickets found</div>}
        </div>
      )}
    </div>
  )
}

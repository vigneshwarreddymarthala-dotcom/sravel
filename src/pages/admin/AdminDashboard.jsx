import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/ui/Spinner'

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color || 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('posts').select('id', { count: 'exact' }).eq('status', 'open'),
      supabase.from('connections').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('support_tickets').select('id', { count: 'exact' }).eq('status', 'open'),
      supabase.from('reports').select('id', { count: 'exact' }).eq('status', 'pending'),
    ]).then(([users, posts, conns, tickets, reports]) => {
      setStats({
        users: users.count || 0,
        posts: posts.count || 0,
        connections: conns.count || 0,
        tickets: tickets.count || 0,
        reports: reports.count || 0,
      })
    })
  }, [])

  if (!stats) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total users" value={stats.users} color="text-blue-600" />
        <StatCard label="Active posts" value={stats.posts} color="text-green-600" />
        <StatCard label="Connections made" value={stats.connections} color="text-purple-600" />
        <StatCard label="Open support tickets" value={stats.tickets} color="text-orange-600" />
        <StatCard label="Pending reports" value={stats.reports} color="text-red-600" />
      </div>
    </div>
  )
}

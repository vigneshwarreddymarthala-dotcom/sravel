import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/ui/Spinner'

function StatCard({ label, value, icon, bg, iconColor, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 p-5 text-left transition-all w-full ${onClick ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-0.5 font-medium">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </button>
  )
}

function timeAgo(d) {
  const mins = Math.floor((Date.now() - new Date(d)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const activityStyles = {
  user: { emoji: '👤', bg: 'bg-blue-50', text: 'text-blue-700', label: 'New user' },
  post: { emoji: '📋', bg: 'bg-purple-50', text: 'text-purple-700', label: 'New post' },
  report: { emoji: '⚠️', bg: 'bg-red-50', text: 'text-red-700', label: 'Report' },
  ticket: { emoji: '🎫', bg: 'bg-orange-50', text: 'text-orange-700', label: 'Support' },
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({})
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [usersRes, postsRes, reportsRes, ticketsRes, connsRes] = await Promise.all([
      supabase.from('users').select('id, name, created_at').order('created_at', { ascending: false }),
      supabase.from('posts').select('id, status, title, created_at').order('created_at', { ascending: false }),
      supabase.from('reports').select('id, created_at, status').order('created_at', { ascending: false }),
      supabase.from('support_tickets').select('id, subject, created_at, status').order('created_at', { ascending: false }),
      supabase.from('connections').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ])

    const allPosts = postsRes.data || []
    const allReports = reportsRes.data || []
    const allTickets = ticketsRes.data || []
    const allUsers = usersRes.data || []

    setStats({
      users: allUsers.length,
      posts: allPosts.length,
      openPosts: allPosts.filter(p => p.status === 'open').length,
      acceptedPosts: allPosts.filter(p => p.status === 'accepted').length,
      pendingReports: allReports.filter(r => r.status === 'pending').length,
      openTickets: allTickets.filter(t => t.status === 'open').length,
      connections: connsRes.count ?? 0,
    })

    const items = [
      ...allUsers.slice(0, 4).map(u => ({ type: 'user', text: `${u.name} joined`, created_at: u.created_at })),
      ...allPosts.slice(0, 4).map(p => ({ type: 'post', text: p.title || 'New post', created_at: p.created_at })),
      ...allReports.slice(0, 3).map(r => ({ type: 'report', text: `Report #${r.id.slice(0, 6)} submitted`, created_at: r.created_at })),
      ...allTickets.slice(0, 3).map(t => ({ type: 'ticket', text: t.subject || 'Support request', created_at: t.created_at })),
    ]
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setActivity(items.slice(0, 12))
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={stats.users}
          bg="bg-blue-50" iconColor="text-blue-600"
          onClick={() => navigate('/admin/users')}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
        />
        <StatCard
          label="Total Posts"
          value={stats.posts}
          sub={`${stats.openPosts} open · ${stats.acceptedPosts} matched`}
          bg="bg-purple-50" iconColor="text-purple-600"
          onClick={() => navigate('/admin/posts')}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />}
        />
        <StatCard
          label="Active Connections"
          value={stats.connections}
          bg="bg-green-50" iconColor="text-green-600"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />}
        />
        <StatCard
          label="Pending Reports"
          value={stats.pendingReports}
          sub={`${stats.openTickets} open tickets`}
          bg={stats.pendingReports > 0 ? 'bg-red-50' : 'bg-gray-50'}
          iconColor={stats.pendingReports > 0 ? 'text-red-500' : 'text-gray-400'}
          onClick={() => navigate('/admin/reports')}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
          ) : (
            <div className="flex flex-col">
              {activity.map((item, i) => {
                const s = activityStyles[item.type] || activityStyles.user
                return (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-base w-7 text-center shrink-0">{s.emoji}</span>
                    <p className="text-sm text-gray-700 flex-1 truncate">{item.text}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${s.bg} ${s.text}`}>{s.label}</span>
                    <span className="text-xs text-gray-400 shrink-0 w-14 text-right">{timeAgo(item.created_at)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick nav */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-1">
            {[
              { label: 'Manage Users', to: '/admin/users', count: stats.users, color: 'blue' },
              { label: 'Manage Posts', to: '/admin/posts', count: `${stats.openPosts} open`, color: 'purple' },
              { label: 'Review Reports', to: '/admin/reports', count: stats.pendingReports, color: 'red', urgent: stats.pendingReports > 0 },
              { label: 'Support Tickets', to: '/admin/support', count: stats.openTickets, color: 'orange', urgent: stats.openTickets > 0 },
            ].map(a => (
              <button
                key={a.to}
                onClick={() => navigate(a.to)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group text-left"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{a.label}</p>
                  <p className="text-xs text-gray-400">{a.count}</p>
                </div>
                <div className="flex items-center gap-2">
                  {a.urgent && (
                    <span className={`min-w-5 h-5 px-1.5 text-white text-[10px] font-bold rounded-full flex items-center justify-center ${a.color === 'red' ? 'bg-red-500' : 'bg-orange-500'}`}>
                      {typeof a.count === 'number' ? (a.count > 9 ? '9+' : a.count) : '!'}
                    </span>
                  )}
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

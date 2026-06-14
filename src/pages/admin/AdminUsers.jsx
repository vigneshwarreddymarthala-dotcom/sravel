import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/ui/Spinner'

function initials(name) {
  if (!name) return '?'
  return name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function Avatar({ name, size = 'md' }) {
  const colors = ['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500','bg-teal-500']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} ${colors[idx]} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {initials(name)}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-orange-100 text-orange-700',
    banned: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status || 'active'}
    </span>
  )
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    const { data } = await supabase
      .from('users')
      .select('*, posts(id)')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  async function toggleStatus(user) {
    const newStatus = user.status === 'active' ? 'paused' : 'active'
    await supabase.from('users').update({ status: newStatus }).eq('id', user.id)
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
    setConfirmAction(null)
  }

  async function deleteUser(user) {
    await supabase.from('users').delete().eq('id', user.id)
    setUsers(prev => prev.filter(u => u.id !== user.id))
    setConfirmAction(null)
    setExpanded(null)
  }

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.home_city?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (u.status || 'active') === filter
    return matchSearch && matchFilter
  })

  return (
    <div>
      {/* Confirm modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">{confirmAction.title}</h3>
            <p className="text-sm text-gray-500 mb-5">{confirmAction.desc}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.action}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium text-white ${confirmAction.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {confirmAction.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} total registered</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-48 relative">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            placeholder="Search name, email or city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {['all','active','paused'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
            {['User', 'Email', 'City', 'Posts', 'Status'].map(h => (
              <p key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</p>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No users match your search</p>
            </div>
          ) : (
            filtered.map(user => (
              <div key={user.id}>
                <button
                  onClick={() => setExpanded(expanded === user.id ? null : user.id)}
                  className="w-full grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 md:gap-4 items-center px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left"
                >
                  {/* User */}
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate md:hidden">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">ADMIN</span>
                      )}
                    </div>
                  </div>
                  <p className="hidden md:block text-sm text-gray-600 truncate">{user.email}</p>
                  <p className="hidden md:block text-sm text-gray-600">{user.home_city || '—'}</p>
                  <p className="hidden md:block text-sm text-gray-700 font-medium">{user.posts?.length || 0}</p>
                  <StatusBadge status={user.status} />
                </button>

                {/* Expanded row */}
                {expanded === user.id && (
                  <div className="px-5 py-4 bg-blue-50/40 border-b border-gray-100">
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">University</p>
                        <p className="text-sm text-gray-800">{user.university || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Home city</p>
                        <p className="text-sm text-gray-800">{user.home_city || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Joined</p>
                        <p className="text-sm text-gray-800">{formatDate(user.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Posts</p>
                        <p className="text-sm text-gray-800">{user.posts?.length || 0}</p>
                      </div>
                      {user.bio && (
                        <div className="w-full">
                          <p className="text-xs text-gray-400 mb-0.5">Bio</p>
                          <p className="text-sm text-gray-700">{user.bio}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => setConfirmAction({
                              title: user.status === 'active' ? `Pause ${user.name}?` : `Reactivate ${user.name}?`,
                              desc: user.status === 'active'
                                ? 'They will not be able to log in or create posts.'
                                : 'They will regain full access to the platform.',
                              confirm: user.status === 'active' ? 'Pause user' : 'Reactivate',
                              action: () => toggleStatus(user),
                            })}
                            className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-colors ${user.status === 'active' ? 'border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100' : 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'}`}
                          >
                            {user.status === 'active' ? 'Pause account' : 'Reactivate'}
                          </button>
                          <button
                            onClick={() => setConfirmAction({
                              title: `Delete ${user.name}?`,
                              desc: 'This permanently removes the user and all their data. This cannot be undone.',
                              confirm: 'Delete user',
                              danger: true,
                              action: () => deleteUser(user),
                            })}
                            className="text-xs font-semibold px-4 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            Delete user
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

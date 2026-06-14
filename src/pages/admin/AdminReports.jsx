import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

function statusVariant(s) {
  return { pending: 'orange', reviewed: 'blue', dismissed: 'gray' }[s] || 'gray'
}

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    const { data } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:users!reports_reporter_id_fkey(name, email),
        reported_user:users!reports_reported_user_id_fkey(id, name),
        reported_post:posts!reports_reported_post_id_fkey(id, title)
      `)
      .order('created_at', { ascending: false })
    setReports(data || [])
    setLoading(false)
  }

  async function updateStatus(report, status) {
    await supabase.from('reports').update({ status }).eq('id', report.id)
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, status } : r))
  }

  async function pauseUser(userId) {
    await supabase.from('users').update({ status: 'paused' }).eq('id', userId)
    alert('User paused.')
  }

  async function removePost(postId) {
    await supabase.from('posts').update({ status: 'removed' }).eq('id', postId)
    alert('Post removed.')
  }

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>
      <div className="flex gap-3 mb-4">
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(report => (
            <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={statusVariant(report.status)}>{report.status}</Badge>
                    <span className="text-sm font-medium text-red-600">{report.reason}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Reported by <strong>{report.reporter?.name}</strong> on{' '}
                    {new Date(report.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>

              {report.reported_post && (
                <div className="text-sm text-gray-700 mb-1">
                  <span className="text-gray-500">Post: </span>
                  <strong>{report.reported_post.title}</strong>
                </div>
              )}
              {report.reported_user && (
                <div className="text-sm text-gray-700 mb-1">
                  <span className="text-gray-500">User: </span>
                  <strong>{report.reported_user.name}</strong>
                </div>
              )}
              {report.description && (
                <p className="text-sm text-gray-600 mt-2 mb-3 bg-gray-50 rounded-lg p-3">{report.description}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {report.reported_user && report.status === 'pending' && (
                  <button onClick={() => pauseUser(report.reported_user.id)} className="text-xs text-orange-600 font-medium hover:underline">
                    Pause user
                  </button>
                )}
                {report.reported_post && report.status === 'pending' && (
                  <button onClick={() => removePost(report.reported_post.id)} className="text-xs text-red-600 font-medium hover:underline">
                    Remove post
                  </button>
                )}
                {report.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(report, 'reviewed')} className="text-xs text-blue-600 font-medium hover:underline">
                      Mark reviewed
                    </button>
                    <button onClick={() => updateStatus(report, 'dismissed')} className="text-xs text-gray-500 font-medium hover:underline">
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No reports found</div>}
        </div>
      )}
    </div>
  )
}

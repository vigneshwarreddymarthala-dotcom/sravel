import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/ui/Spinner'

const REASON_SEVERITY = {
  'Safety concern': 'high',
  'Fake post': 'medium',
  'Inappropriate content': 'medium',
  'Spam': 'low',
  'Other': 'low',
}

const SEVERITY_STYLES = {
  high: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'High' },
  medium: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400', label: 'Medium' },
  low: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', label: 'Low' },
}

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-700',
  dismissed: 'bg-gray-100 text-gray-500',
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })
}

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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
      {msg}
    </div>
  )
}

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    const { data } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:users!reports_reporter_id_fkey(id, name, email),
        reported_user:users!reports_reported_user_id_fkey(id, name, email),
        reported_post:posts!reports_reported_post_id_fkey(id, title, type, host_city)
      `)
      .order('created_at', { ascending: false })
    setReports(data || [])
    setLoading(false)
  }

  async function updateStatus(report, status) {
    await supabase.from('reports').update({ status }).eq('id', report.id)
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, status } : r))
    setToast(status === 'reviewed' ? 'Report marked as reviewed' : 'Report dismissed')
    setExpanded(null)
  }

  async function pauseUser(report) {
    await supabase.from('users').update({ status: 'paused' }).eq('id', report.reported_user.id)
    await updateStatus(report, 'reviewed')
    setToast(`${report.reported_user.name} has been paused`)
  }

  async function removePost(report) {
    await supabase.from('posts').update({ status: 'removed' }).eq('id', report.reported_post.id)
    await updateStatus(report, 'reviewed')
    setToast('Post removed from feed')
  }

  async function restorePost(report) {
    await supabase.from('posts').update({ status: 'open' }).eq('id', report.reported_post.id)
    await updateStatus(report, 'dismissed')
    setToast(`Post restored to feed`)
  }

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter)
  const pendingCount = reports.filter(r => r.status === 'pending').length

  return (
    <div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {pendingCount > 0 ? `${pendingCount} pending review` : 'All reports reviewed'}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100/70 p-1 rounded-xl w-fit">
        {[
          { key: 'pending', label: 'Pending', count: reports.filter(r => r.status === 'pending').length },
          { key: 'reviewed', label: 'Reviewed', count: reports.filter(r => r.status === 'reviewed').length },
          { key: 'dismissed', label: 'Dismissed', count: reports.filter(r => r.status === 'dismissed').length },
          { key: 'all', label: 'All', count: reports.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 text-xs font-semibold ${filter === t.key && t.key === 'pending' ? 'text-red-500' : 'text-gray-400'}`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-500 font-medium">No {filter !== 'all' ? filter : ''} reports</p>
          <p className="text-sm text-gray-400 mt-1">Nothing to review here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(report => {
            const severity = REASON_SEVERITY[report.reason] || 'low'
            const sev = SEVERITY_STYLES[severity]
            const isExpanded = expanded === report.id
            return (
              <div
                key={report.id}
                className={`bg-white rounded-2xl border transition-all ${isExpanded ? 'border-blue-200 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : report.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-start gap-3">
                    {/* Severity dot */}
                    <div className="mt-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${sev.dot}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[report.status]}`}>
                            {report.status}
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sev.badge}`}>
                            {sev.label} · {report.reason}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{timeAgo(report.created_at)}</span>
                      </div>

                      {/* Subject */}
                      <div className="flex flex-wrap gap-3 text-sm">
                        {report.reported_post && (
                          <span className="text-gray-700">
                            Post: <strong>{report.reported_post.title}</strong>
                            <span className="text-gray-400 ml-1 text-xs">({report.reported_post.host_city})</span>
                          </span>
                        )}
                        {report.reported_user && (
                          <span className="text-gray-700">
                            User: <strong>{report.reported_user.name}</strong>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        Reported by {report.reporter?.name} · {formatDate(report.created_at)}
                      </p>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-50">
                    <div className="pt-4 space-y-4">
                      {/* Reporter */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-1 font-medium">Reported by</p>
                          <p className="text-sm font-semibold text-gray-900">{report.reporter?.name}</p>
                          <p className="text-xs text-gray-500">{report.reporter?.email}</p>
                        </div>
                        {report.reported_user && (
                          <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                            <p className="text-xs text-red-400 mb-1 font-medium">Reported user</p>
                            <p className="text-sm font-semibold text-gray-900">{report.reported_user.name}</p>
                            <p className="text-xs text-gray-500">{report.reported_user.email}</p>
                          </div>
                        )}
                        {report.reported_post && (
                          <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-orange-400 font-medium">Reported post</p>
                              <span className="text-[10px] bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">Hidden from feed</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{report.reported_post.title}</p>
                            <p className="text-xs text-gray-500 capitalize">{report.reported_post.type} · {report.reported_post.host_city}</p>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {report.description && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-400 mb-1.5 font-medium">Reporter's description</p>
                          <p className="text-sm text-gray-700 whitespace-pre-line">{report.description}</p>
                        </div>
                      )}

                      {/* Actions */}
                      {report.status === 'pending' ? (
                        <div className="flex flex-wrap gap-2">
                          {report.reported_user && (
                            <button
                              onClick={() => pauseUser(report)}
                              className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 transition-colors"
                            >
                              Pause user
                            </button>
                          )}
                          {report.reported_post && (
                            <>
                              <button
                                onClick={() => removePost(report)}
                                className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors"
                              >
                                Keep removed
                              </button>
                              <button
                                onClick={() => restorePost(report)}
                                className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors"
                              >
                                Restore to feed
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => updateStatus(report, 'reviewed')}
                            className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            Mark reviewed
                          </button>
                          <button
                            onClick={() => updateStatus(report, 'dismissed')}
                            className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_BADGE[report.status]}`}>
                            {report.status === 'reviewed' ? 'Reviewed — action taken' : 'Dismissed — no action'}
                          </span>
                          {report.status !== 'pending' && (
                            <button
                              onClick={() => updateStatus(report, 'pending')}
                              className="text-xs text-gray-400 hover:text-gray-700 hover:underline"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

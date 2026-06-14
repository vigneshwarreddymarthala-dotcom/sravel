import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'

export default function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ hosted: 0, stayed: 0 })
  const [loading, setLoading] = useState(true)
  const [showReport, setShowReport] = useState(false)
  const [reportData, setReportData] = useState({ reason: '', description: '' })
  const [reportSent, setReportSent] = useState(false)

  useEffect(() => {
    if (userId === user?.id) { navigate('/profile'); return }
    fetchProfile()
  }, [userId])

  async function fetchProfile() {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single()
    if (!data) { navigate(-1); return }
    setProfile(data)
    const [h, s] = await Promise.all([
      supabase.from('connections').select('id', { count: 'exact' }).eq('acceptor_id', userId).eq('status', 'active'),
      supabase.from('connections').select('id', { count: 'exact' }).eq('requester_id', userId).eq('status', 'active'),
    ])
    setStats({ hosted: h.count || 0, stayed: s.count || 0 })
    setLoading(false)
  }

  async function submitReport() {
    await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_user_id: userId,
      reason: reportData.reason,
      description: reportData.description,
      status: 'pending',
    })
    setReportSent(true)
    setTimeout(() => { setShowReport(false); setReportSent(false) }, 2000)
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!profile) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900 flex-1">{profile.name}</h2>
        <button onClick={() => setShowReport(true)} className="p-1 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar name={profile.name} size="xl" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-sm text-gray-600">{profile.university}</p>
              <p className="text-sm text-gray-500">{profile.home_city}</p>
            </div>
          </div>
          {profile.bio && <p className="text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-4">{profile.bio}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.hosted}</p>
            <p className="text-sm text-gray-600 mt-1">Times hosted</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.stayed}</p>
            <p className="text-sm text-gray-600 mt-1">Times stayed</p>
          </div>
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowReport(false)}>
          <div className="bg-white w-full rounded-t-2xl p-6" onClick={e => e.stopPropagation()}>
            {reportSent ? (
              <div className="text-center py-4">
                <p className="text-green-600 font-medium">Report submitted. Thank you!</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4">Report user</h3>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
                  value={reportData.reason}
                  onChange={e => setReportData(p => ({ ...p, reason: e.target.value }))}
                >
                  <option value="">Select reason</option>
                  {['Fake post','Inappropriate content','Spam','Safety concern','Other'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none mb-4"
                  rows={3}
                  placeholder="Additional details…"
                  value={reportData.description}
                  onChange={e => setReportData(p => ({ ...p, description: e.target.value }))}
                />
                <Button className="w-full" onClick={submitReport} disabled={!reportData.reason}>
                  Submit report
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

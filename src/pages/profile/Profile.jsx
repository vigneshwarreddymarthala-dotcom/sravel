import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ hosted: 0, stayed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchStats()
  }, [user])

  async function fetchStats() {
    const [hostedRes, stayedRes] = await Promise.all([
      supabase.from('connections').select('id', { count: 'exact' }).eq('acceptor_id', user.id).eq('status', 'active'),
      supabase.from('connections').select('id', { count: 'exact' }).eq('requester_id', user.id).eq('status', 'active'),
    ])
    setStats({ hosted: hostedRes.count || 0, stayed: stayedRes.count || 0 })
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading || !profile) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 pt-12 pb-4 sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <button onClick={() => navigate('/profile/edit')} className="text-blue-600 text-sm font-medium">Edit</button>
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
          {profile.bio && (
            <p className="text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-4">{profile.bio}</p>
          )}
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

        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          <button
            onClick={() => navigate('/my-posts')}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">My posts</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/support')}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">Support</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/support/tickets')}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">My support tickets</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="text-center text-xs text-gray-400 pb-2">
          Member since {new Date(profile.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </div>

        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </div>
  )
}

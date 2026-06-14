import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import PostCard from './PostCard'
import Spinner from '../../components/ui/Spinner'

export default function Feed() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('seeking')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [tab, profile])

  async function fetchPosts() {
    if (!profile) return
    setLoading(true)

    let query = supabase
      .from('posts')
      .select('*, users(id, name, university, home_city)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(20)

    if (tab === 'seeking') {
      query = query.eq('type', 'seeking').eq('target_city', profile.home_city)
    } else {
      query = query.eq('type', 'hosting')
    }

    const { data } = await query
    setPosts(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 pt-12 md:pt-6 pb-0 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Home Feed</h1>
            {profile && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <span>📍</span> {profile.home_city}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/post/create')}
            className="hidden md:flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New post
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0">
          {[
            { key: 'seeking', label: '🔍 Seeking', desc: 'Looking for a place' },
            { key: 'hosting', label: '🏠 Hosting', desc: 'Offering a place' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px flex flex-col items-start gap-0 ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      <div className="p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏙️</p>
            <p className="text-gray-800 font-semibold text-lg">
              {tab === 'seeking'
                ? `No one is looking to stay in ${profile?.home_city} right now`
                : 'No hosting posts yet'}
            </p>
            <p className="text-gray-400 text-sm mt-2">Check back soon — or be the first to post!</p>
            <button
              onClick={() => navigate('/post/create')}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Create a post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </div>
    </div>
  )
}

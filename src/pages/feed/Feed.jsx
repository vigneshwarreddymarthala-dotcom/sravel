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
    if (!profile) return
    fetchPosts()

    const channel = supabase
      .channel(`feed-${tab}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
        if (payload.new.status !== 'open') {
          setPosts(prev => prev.filter(p => p.id !== payload.new.id))
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
        setPosts(prev => prev.filter(p => p.id !== payload.old.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [tab, profile])

  async function fetchPosts() {
    if (!profile) return
    setLoading(true)

    let query = supabase
      .from('posts')
      .select('*, users(id, name, university, home_city, avatar_url)')
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
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 pt-12 md:pt-6 pb-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Feed</h1>
            {profile && (
              <div className="flex items-center gap-1 mt-0.5">
                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span className="text-xs text-gray-400 font-medium">{profile.home_city}</span>
              </div>
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

        {/* Pill tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[
            { key: 'seeking', label: 'Seeking', icon: '🔍' },
            { key: 'hosting', label: 'Hosting', icon: '🏠' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{tab === 'seeking' ? '🔍' : '🏠'}</span>
            </div>
            <p className="text-gray-800 font-semibold text-lg">
              {tab === 'seeking'
                ? `No one seeking in ${profile?.home_city} right now`
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </div>
    </div>
  )
}

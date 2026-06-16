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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-black/[0.06] px-4 md:px-8 pt-4 md:pt-7 pb-3 sticky top-14 md:top-0 z-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-gray-900 leading-none">Feed</h1>
            {profile && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span className="text-[13px] text-gray-400 font-medium">{profile.home_city}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/post/create')}
            className="hidden md:flex items-center gap-1.5 bg-blue-600 text-white text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-sm mb-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New post
          </button>
        </div>

        {/* Segmented control */}
        <div className="flex bg-black/[0.06] rounded-xl p-1 max-w-xs">
          {[
            { key: 'seeking', label: 'Seeking' },
            { key: 'hosting', label: 'Hosting' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-lg transition-all ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="p-4 md:p-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-black/[0.04]">
              <span className="text-3xl">{tab === 'seeking' ? '🔍' : '🏠'}</span>
            </div>
            <p className="text-gray-900 font-semibold text-[17px]">
              {tab === 'seeking'
                ? `No one seeking in ${profile?.home_city} right now`
                : 'No hosting posts yet'}
            </p>
            <p className="text-gray-400 text-[14px] mt-1.5">Check back soon — or be the first to post!</p>
            <button
              onClick={() => navigate('/post/create')}
              className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-full text-[14px] font-semibold hover:bg-blue-500 transition-colors shadow-sm"
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

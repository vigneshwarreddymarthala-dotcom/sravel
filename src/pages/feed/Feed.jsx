import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import PostCard from './PostCard'
import Spinner from '../../components/ui/Spinner'

export default function Feed() {
  const { profile } = useAuth()
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
      .in('status', ['open'])
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
      <div className="bg-white border-b border-gray-200 px-4 pt-12 pb-0 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Speilfinder</h1>
            {profile && (
              <p className="text-xs text-gray-500">{profile.home_city}</p>
            )}
          </div>
        </div>
        <div className="flex gap-0 border-b border-gray-100">
          {['seeking', 'hosting'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🏙️</p>
            <p className="text-gray-700 font-medium">
              {tab === 'seeking'
                ? `No one is looking to stay in ${profile?.home_city} right now`
                : 'No one is hosting right now'}
            </p>
            <p className="text-gray-400 text-sm mt-1">Check back soon.</p>
          </div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}

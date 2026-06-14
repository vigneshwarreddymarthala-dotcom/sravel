import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

function formatDate(d) {
  return new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [alreadyConnected, setAlreadyConnected] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportData, setReportData] = useState({ reason: '', description: '' })
  const [reportSent, setReportSent] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [id])

  async function fetchPost() {
    const { data: postData } = await supabase
      .from('posts')
      .select('*, users(*)')
      .eq('id', id)
      .single()
    if (!postData) { navigate('/feed'); return }
    setPost(postData)
    setAuthor(postData.users)

    if (user && postData.user_id !== user.id) {
      const { data: conn } = await supabase
        .from('connections')
        .select('id')
        .eq('post_id', id)
        .eq('requester_id', user.id)
        .maybeSingle()
      setAlreadyConnected(!!conn)
    }
    setLoading(false)
  }

  async function handleAccept() {
    setAccepting(true)
    const { data: conn, error } = await supabase
      .from('connections')
      .insert({
        post_id: post.id,
        requester_id: user.id,
        acceptor_id: post.user_id,
        status: 'active',
      })
      .select()
      .single()

    if (!error) {
      await supabase.from('posts').update({ status: 'accepted' }).eq('id', post.id)
      navigate(`/messages/${conn.id}`)
    }
    setAccepting(false)
  }

  async function submitReport() {
    await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_post_id: post.id,
      reason: reportData.reason,
      description: reportData.description,
      status: 'pending',
    })
    setReportSent(true)
    setTimeout(() => { setShowReport(false); setReportSent(false) }, 2000)
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!post) return null

  const isOwn = user?.id === post.user_id
  const canAccept = !isOwn && !alreadyConnected && post.status === 'open'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900 flex-1 truncate">Post</h2>
        {!isOwn && (
          <button onClick={() => setShowReport(true)} className="p-1 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={post.type === 'seeking' ? 'purple' : post.target_city ? 'blue' : 'green'}>
              {post.type === 'seeking' ? 'Seeking' : post.target_city ? 'Targeted hosting' : 'Open hosting'}
            </Badge>
            {post.status !== 'open' && (
              <Badge variant={post.status === 'accepted' ? 'blue' : 'gray'}>
                {post.status}
              </Badge>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span>📍 {post.host_city}{post.target_city && ` → ${post.target_city}`}</span>
            <span>📅 {formatDate(post.date_from)} – {formatDate(post.date_to)}</span>
          </div>

          <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">{post.story}</p>
        </div>

        <Link to={`/profile/${author?.id}`} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
          <Avatar name={author?.name} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{author?.name}</p>
            <p className="text-sm text-gray-500 truncate">{author?.university}</p>
            <p className="text-sm text-gray-500">{author?.home_city}</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {isOwn && post.status === 'open' && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate(`/post/${post.id}/edit`)}>
              Edit post
            </Button>
          </div>
        )}

        {canAccept && (
          <Button size="lg" className="w-full" onClick={handleAccept} disabled={accepting}>
            {accepting ? 'Connecting…' : '✓ Accept & connect'}
          </Button>
        )}
        {alreadyConnected && (
          <div className="text-center py-3 bg-blue-50 rounded-xl text-sm text-blue-700 font-medium">
            You're already connected on this post
          </div>
        )}
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
                <h3 className="text-lg font-semibold mb-4">Report post</h3>
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

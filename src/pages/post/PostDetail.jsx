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
  const [existingConnId, setExistingConnId] = useState(null)
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
      setExistingConnId(conn?.id || null)
    }
    setLoading(false)
  }

  async function handleAccept() {
    setAccepting(true)

    // Check if these two users already have an active connection from any previous post
    const { data: existing } = await supabase
      .from('connections')
      .select('id')
      .eq('status', 'active')
      .or(
        `and(requester_id.eq.${user.id},acceptor_id.eq.${post.user_id}),and(requester_id.eq.${post.user_id},acceptor_id.eq.${user.id})`
      )
      .limit(1)
      .maybeSingle()

    if (existing) {
      await supabase.from('posts').update({ status: 'accepted' }).eq('id', post.id)
      setAccepting(false)
      navigate(`/messages/${existing.id}`)
      return
    }

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

      // Send automatic first message so chat is not empty
      const autoMsg = `Hi! I accepted your post "${post.title}" 👋 Looking forward to connecting!`
      await supabase.from('messages').insert({
        connection_id: conn.id,
        sender_id: user.id,
        content: autoMsg,
        read: false,
      })

      navigate(`/messages/${conn.id}`)
    }
    setAccepting(false)
  }

  async function submitReport() {
    await supabase.rpc('report_post', {
      p_post_id: post.id,
      p_reason: reportData.reason,
      p_description: reportData.description || null,
    })
    setReportSent(true)
    setTimeout(() => {
      setShowReport(false)
      setReportSent(false)
      navigate('/feed')
    }, 2500)
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
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
            Report
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
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-semibold text-blue-800">You're already connected on this post</p>
            </div>
            <button
              onClick={() => navigate(`/messages/${existingConnId}`)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Open chat
            </button>
          </div>
        )}
      </div>

      {showReport && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => !reportSent && setShowReport(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            {reportSent ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-gray-900 mb-1">Report submitted</p>
                <p className="text-sm text-gray-500">This post has been taken down and is under review by our team. Thank you for keeping the community safe.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Report this post</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Post will be hidden immediately pending review</p>
                  </div>
                  <button onClick={() => setShowReport(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Reason</p>
                <div className="flex flex-col gap-2 mb-4">
                  {['Safety concern', 'Fake post', 'Inappropriate content', 'Spam', 'Other'].map(r => (
                    <button
                      key={r}
                      onClick={() => setReportData(p => ({ ...p, reason: r }))}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-colors ${
                        reportData.reason === r
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${reportData.reason === r ? 'border-red-500' : 'border-gray-300'}`}>
                        {reportData.reason === r && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                      </span>
                      {r}
                    </button>
                  ))}
                </div>

                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 mb-4"
                  rows={3}
                  placeholder="Additional details (optional)…"
                  value={reportData.description}
                  onChange={e => setReportData(p => ({ ...p, description: e.target.value }))}
                />

                <button
                  onClick={submitReport}
                  disabled={!reportData.reason}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Submit report & hide post
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

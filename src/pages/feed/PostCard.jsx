import { useNavigate } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'

function formatDate(d) {
  return new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

function timeAgo(d) {
  const diff = Date.now() - new Date(d)
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getPostBadge(post) {
  if (post.type === 'seeking') return { label: 'Seeking', variant: 'purple' }
  if (!post.target_city) return { label: 'Open hosting', variant: 'green' }
  return { label: 'Targeted hosting', variant: 'blue' }
}

export default function PostCard({ post }) {
  const navigate = useNavigate()
  const { label, variant } = getPostBadge(post)
  const user = post.users

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/post/${post.id}`)}
    >
      <div className="flex items-start gap-3">
        <Avatar name={user?.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
            <span className="text-xs text-gray-400 shrink-0">{timeAgo(post.created_at)}</span>
          </div>
          <p className="text-xs text-gray-500 truncate">{user?.university}</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={variant}>{label}</Badge>
        </div>
        <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">{post.title}</h3>
        <p className="text-gray-500 text-xs line-clamp-2">{post.story}</p>
      </div>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <span className="text-blue-500">📍</span>
          <span>{post.host_city}</span>
          {post.target_city && (
            <>
              <span className="text-gray-300">→</span>
              <span>{post.target_city}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>📅</span>
          <span>{formatDate(post.date_from)} – {formatDate(post.date_to)}</span>
        </div>
      </div>
    </div>
  )
}

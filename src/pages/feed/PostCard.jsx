import { useNavigate } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function timeAgo(d) {
  const diff = Date.now() - new Date(d)
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const TYPE_CONFIG = {
  seeking:          { label: 'Seeking',          pill: 'bg-purple-100 text-purple-700', bar: 'border-l-purple-400' },
  hosting_targeted: { label: 'Targeted hosting', pill: 'bg-blue-100 text-blue-700',   bar: 'border-l-blue-400'   },
  hosting_open:     { label: 'Open hosting',     pill: 'bg-green-100 text-green-700',  bar: 'border-l-green-400'  },
}

export default function PostCard({ post }) {
  const navigate = useNavigate()
  const user = post.users
  const configKey = post.type === 'seeking' ? 'seeking' : post.target_city ? 'hosting_targeted' : 'hosting_open'
  const { label, pill, bar } = TYPE_CONFIG[configKey]

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm border-l-4 ${bar} cursor-pointer active:scale-[0.99] active:shadow-sm hover:shadow-md transition-all duration-150`}
      onClick={() => navigate(`/post/${post.id}`)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pill}`}>{label}</span>
          <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
        </div>

        <div className="flex items-center gap-2.5 mb-3">
          <Avatar name={user?.name} src={user?.avatar_url} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.university}</p>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{post.title}</h3>
        <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{post.story}</p>

        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{post.host_city}{post.target_city && ` → ${post.target_city}`}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(post.date_from)} – {formatDate(post.date_to)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

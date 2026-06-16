import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import Spinner from '../../components/ui/Spinner'

function timeAgo(d) {
  const mins = Math.floor((Date.now() - new Date(d)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function NotifIcon({ type }) {
  if (type === 'connection') {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )
  }
  return (
    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    </div>
  )
}

export default function Notifications() {
  const navigate = useNavigate()
  const { notifications, unread, markAllRead } = useNotifications()

  useEffect(() => {
    if (unread > 0) markAllRead()
  }, [])

  function handleClick(notif) {
    if (notif.type === 'connection' && notif.data?.connection_id) {
      navigate(`/messages/${notif.data.connection_id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 md:pt-6 pb-4 sticky top-14 md:top-0 z-10 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-xs text-gray-400 mt-0.5">{notifications.length} total</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex flex-col divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔔</p>
            <p className="text-gray-700 font-semibold text-base">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">You'll be notified when someone accepts your post</p>
          </div>
        ) : (
          notifications.map(notif => (
            <button
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-colors ${
                notif.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
              }`}
            >
              <NotifIcon type={notif.type} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold text-gray-900 ${!notif.read ? 'text-blue-900' : ''}`}>
                    {notif.title}
                  </p>
                  <span className="text-[11px] text-gray-400 shrink-0">{timeAgo(notif.created_at)}</span>
                </div>
                {notif.body && (
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                )}
                {notif.type === 'connection' && (
                  <p className="text-xs text-blue-600 font-medium mt-1">Tap to open chat →</p>
                )}
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

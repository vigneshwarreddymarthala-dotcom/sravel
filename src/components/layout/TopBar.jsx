import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import Avatar from '../ui/Avatar'

export default function TopBar() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { unread } = useNotifications()

  return (
    <div
      className="fixed left-0 right-0 top-0 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] z-50"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="h-14 flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-base leading-none">S</span>
          </div>
          <span className="font-black text-gray-900 text-lg leading-none">sravel</span>
        </div>

        {/* Right: bell + avatar */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-xl active:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="ml-0.5 active:scale-95 transition-transform"
          >
            <Avatar name={profile?.name || ''} src={profile?.avatar_url} size="sm" />
          </button>
        </div>
      </div>
    </div>
  )
}

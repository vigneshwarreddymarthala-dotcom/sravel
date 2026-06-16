import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useNotifications } from '../../hooks/useNotifications'
import Avatar from '../ui/Avatar'

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      {
        to: '/feed',
        label: 'Feed',
        icon: (active) => (
          <svg className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        to: '/messages',
        label: 'Messages',
        icon: (active) => (
          <svg className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        ),
      },
      {
        to: '/activity',
        label: 'Activity',
        icon: (active) => (
          <svg className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      {
        to: '/blogs',
        label: 'Travel Stories',
        icon: (active) => (
          <svg className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        to: '/profile',
        label: 'Profile',
        icon: (active) => (
          <svg className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
      {
        to: '/my-posts',
        label: 'My Posts',
        icon: (active) => (
          <svg className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      },
      {
        to: '/notifications',
        label: 'Notifications',
        badge: true,
        icon: (active) => (
          <svg className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ),
      },
      {
        to: '/support',
        label: 'Support',
        icon: (active) => (
          <svg className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ],
  },
]

export default function SideNav() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { unread } = useNotifications()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="h-full bg-[#F5F5F7] border-r border-black/[0.06] flex flex-col">
      {/* App identity */}
      <div className="px-5 pt-7 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-lg leading-none">S</span>
          </div>
          <div>
            <p className="font-black text-gray-900 text-[17px] leading-none tracking-tight">sravel</p>
            <p className="text-[11px] text-gray-400 leading-none mt-1 font-medium">student travel</p>
          </div>
        </div>
      </div>

      {/* User card */}
      {profile && (
        <div
          onClick={() => navigate('/profile')}
          className="mx-3 mb-4 bg-white rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.04]"
        >
          <Avatar name={profile.name} src={profile.avatar_url} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-gray-900 truncate leading-tight">{profile.name}</p>
            <p className="text-[12px] text-gray-400 truncate mt-0.5 font-medium">{profile.home_city}</p>
          </div>
          <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}

      {/* Nav sections */}
      <nav className="flex-1 px-3 overflow-y-auto flex flex-col gap-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-[0.08em] px-2 mb-1">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13.5px] font-medium transition-all ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04]'
                        : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.icon(isActive)}
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && unread > 0 && (
                        <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* Create post CTA */}
        <button
          onClick={() => navigate('/post/create')}
          className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13.5px] font-semibold bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-sm mt-1"
        >
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </button>
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-black/[0.06]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors w-full font-medium"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  )
}

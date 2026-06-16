import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import Avatar from '../ui/Avatar'

const NAV_ITEMS = [
  {
    to: '/feed',
    label: 'Feed',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/messages',
    label: 'Messages',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    to: '/post/create',
    label: '',
    isAction: true,
    icon: () => (
      <div className="w-12 h-12 md:w-11 md:h-11 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 active:scale-95 transition-transform hover:bg-blue-500">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    ),
  },
  {
    to: '/activity',
    label: 'Activity',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    to: '/blogs',
    label: 'Stories',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  return (
    <>
      {/* ── Mobile: full-width bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-black/[0.06] z-50 shadow-[0_-1px_0_rgba(0,0,0,0.06)]">
        <div className="flex items-end justify-around px-1 h-16 max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-end gap-0.5 pb-2 flex-1 min-w-0"
            >
              {({ isActive }) => (
                <>
                  {item.icon(isActive)}
                  {!item.isAction && (
                    <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
        <div className="bg-white/90" style={{ height: 'env(safe-area-inset-bottom)' }} />
      </nav>

      {/* ── Desktop/tablet: floating dock ── */}
      <nav className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 items-center gap-1 bg-white/80 backdrop-blur-2xl border border-black/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] rounded-2xl px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all hover:bg-black/[0.04] active:bg-black/[0.08] min-w-[56px]"
          >
            {({ isActive }) => (
              <>
                {item.icon(isActive)}
                {!item.isAction && (
                  <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

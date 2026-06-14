import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'

const links = [
  {
    to: '/admin/dashboard', label: 'Dashboard',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
  {
    to: '/admin/users', label: 'Users',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
  },
  {
    to: '/admin/posts', label: 'Posts',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />,
  },
  {
    to: '/admin/support', label: 'Support',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />,
  },
  {
    to: '/admin/reports', label: 'Reports',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
  },
  {
    to: '/admin/notifications', label: 'Notifications',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
  },
]

function NavItem({ link, collapsed, onClick }) {
  return (
    <NavLink
      to={link.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-blue-600 text-white shadow'
            : 'text-gray-400 hover:text-white hover:bg-gray-800'
        } ${collapsed ? 'justify-center px-2' : ''}`
      }
    >
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {link.icon}
      </svg>
      {!collapsed && <span>{link.label}</span>}
    </NavLink>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Logo */}
      <div className={`flex items-center border-b border-gray-700/50 shrink-0 ${collapsed ? 'justify-center px-3 py-4' : 'gap-3 px-5 py-4'}`}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow">
          <span className="text-white font-black text-base">S</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-base leading-none">sravel</p>
            <p className="text-gray-500 text-xs mt-0.5">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {links.map(l => (
          <NavItem key={l.to} link={l} collapsed={collapsed} onClick={() => setMobileOpen(false)} />
        ))}
      </nav>

      {/* Profile + Logout */}
      <div className="p-3 border-t border-gray-700/50 shrink-0">
        {!collapsed && profile && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-xl">
            <Avatar name={profile.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{profile.name}</p>
              <p className="text-gray-500 text-[10px] truncate">{profile.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
        {sidebarContent}
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-16 w-6 h-6 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-gray-300 hover:text-white shadow"
        >
          <svg className={`w-3 h-3 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? 'md:ml-16' : 'md:ml-60'}`}>
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 h-14 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            onClick={() => setMobileOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-3 py-1 rounded-full border border-blue-100">
            Admin
          </span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

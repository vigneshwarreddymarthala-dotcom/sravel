import { Outlet, useLocation } from 'react-router-dom'
import { Component } from 'react'
import BottomNav from './BottomNav'
import SideNav from './SideNav'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center">
          <div>
            <p className="text-2xl mb-2">Something went wrong</p>
            <p className="text-gray-500 text-sm mb-4">{this.state.error.message}</p>
            <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm">Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function AppLayout() {
  const { pathname } = useLocation()
  // Hide bottom nav inside chat — same as WhatsApp behaviour
  const isChat = /^\/messages\/.+/.test(pathname)

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar — tablet & desktop */}
        <div className="hidden md:flex md:flex-col md:w-64 lg:w-72 md:fixed md:inset-y-0 md:left-0 z-30">
          <ErrorBoundary><SideNav /></ErrorBoundary>
        </div>

        {/* Main content */}
        <div className="flex-1 md:ml-64 lg:ml-72 min-h-screen">
          <div className={`max-w-3xl mx-auto w-full ${!isChat ? 'pb-16 md:pb-0' : ''}`}>
            <Outlet />
          </div>
        </div>

        {/* Bottom nav — mobile only, hidden inside chat */}
        {!isChat && (
          <div className="md:hidden">
            <ErrorBoundary><BottomNav /></ErrorBoundary>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

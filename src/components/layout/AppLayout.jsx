import { Outlet, useLocation } from 'react-router-dom'
import { Component } from 'react'
import BottomNav from './BottomNav'
import TopBar from './TopBar'

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
  const isChat = /^\/messages\/.+/.test(pathname)

  return (
    <ErrorBoundary>
      {/* Global top bar — all screen sizes */}
      <ErrorBoundary><TopBar /></ErrorBoundary>

      {/* Spacer for fixed top bar */}
      <div style={{ height: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }} />

      {/* Main content — centered, full width */}
      <div
        className="max-w-4xl mx-auto w-full"
        style={!isChat ? { paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' } : undefined}
      >
        <Outlet />
      </div>

      {/* Bottom nav / dock — all screen sizes, hidden inside chat */}
      {!isChat && (
        <ErrorBoundary><BottomNav /></ErrorBoundary>
      )}
    </ErrorBoundary>
  )
}

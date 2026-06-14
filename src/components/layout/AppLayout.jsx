import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import SideNav from './SideNav'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — tablet & desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 lg:w-72 md:fixed md:inset-y-0 md:left-0 z-30">
        <SideNav />
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64 lg:ml-72 min-h-screen">
        <div className="max-w-3xl mx-auto w-full">
          <Outlet />
        </div>
      </div>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}

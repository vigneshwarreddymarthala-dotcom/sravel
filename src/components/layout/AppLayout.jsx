import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-white relative">
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import AdminLayout from './components/layout/AdminLayout'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Onboarding from './pages/onboarding/Onboarding'
import Feed from './pages/feed/Feed'
import PostDetail from './pages/post/PostDetail'
import CreatePost from './pages/post/CreatePost'
import EditPost from './pages/post/EditPost'
import Messages from './pages/messages/Messages'
import Chat from './pages/messages/Chat'
import MyPosts from './pages/myposts/MyPosts'
import Activity from './pages/activity/Activity'
import Profile from './pages/profile/Profile'
import EditProfile from './pages/profile/EditProfile'
import UserProfile from './pages/profile/UserProfile'
import Support from './pages/support/Support'
import MyTickets from './pages/support/MyTickets'
import Notifications from './pages/notifications/Notifications'
import BlogList from './pages/blogs/BlogList'
import CreateBlog from './pages/blogs/CreateBlog'
import BlogDetail from './pages/blogs/BlogDetail'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPosts from './pages/admin/AdminPosts'
import AdminSupport from './pages/admin/AdminSupport'
import AdminReports from './pages/admin/AdminReports'
import AdminNotifications from './pages/admin/AdminNotifications'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* Guest routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Student app */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/post/create" element={<CreatePost />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/post/:id/edit" element={<EditPost />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:id" element={<Chat />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/support" element={<Support />} />
            <Route path="/support/tickets" element={<MyTickets />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blogs/create" element={<CreateBlog />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
          </Route>

          {/* Admin panel */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

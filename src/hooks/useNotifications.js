import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!user) return
    fetchNotifications()

    // Always clean up any previous channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    try {
      const channel = supabase
        .channel(`notif-${user.id}-${Date.now()}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setNotifications(prev => [payload.new, ...prev])
          setUnread(prev => prev + 1)
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          fetchNotifications()
        })
        .subscribe()
      channelRef.current = channel
    } catch (_) {}

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user?.id])

  async function fetchNotifications() {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (!error && data) {
        setNotifications(data)
        setUnread(data.filter(n => !n.read).length)
      }
    } catch (_) {}
  }

  async function markAllRead() {
    try {
      await supabase.from('notifications').update({ read: true }).eq('read', false)
    } catch (_) {}
    setUnread(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return { notifications, unread, markAllRead, refetch: fetchNotifications }
}

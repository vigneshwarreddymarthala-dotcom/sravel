import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) return
    fetchNotifications()

    const channel = supabase
      .channel(`notif-${user.id}`)
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

    return () => supabase.removeChannel(channel)
  }, [user])

  async function fetchNotifications() {
    if (!user) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) {
      setNotifications(data)
      setUnread(data.filter(n => !n.read).length)
    }
  }

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false)
    setUnread(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return { notifications, unread, markAllRead, refetch: fetchNotifications }
}

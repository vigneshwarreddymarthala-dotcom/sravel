-- ============================================================
-- Speilfinder — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text UNIQUE NOT NULL,
  name       text NOT NULL,
  university text NOT NULL,
  home_city  text NOT NULL,
  bio        text,
  role       text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status     text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at timestamptz DEFAULT now()
);

-- ─── POSTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('seeking', 'hosting')),
  host_city   text NOT NULL,
  target_city text,
  date_from   date NOT NULL,
  date_to     date NOT NULL,
  title       text NOT NULL,
  story       text NOT NULL,
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'expired', 'removed')),
  created_at  timestamptz DEFAULT now()
);

-- ─── CONNECTIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.connections (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id      uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  acceptor_id  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active')),
  created_at   timestamptz DEFAULT now()
);

-- ─── MESSAGES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id uuid NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  sender_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content       text NOT NULL,
  read          boolean NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- ─── REPORTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id       uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_user_id  uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reported_post_id  uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  reason            text NOT NULL,
  description       text,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at        timestamptz DEFAULT now()
);

-- ─── SUPPORT TICKETS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject    text NOT NULL,
  message    text NOT NULL,
  phone      text,
  status     text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at timestamptz DEFAULT now()
);

-- ─── NOTIFICATIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       text NOT NULL,
  message    text NOT NULL,
  link       text,
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "users_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (auth.uid() = id);

-- POSTS: city-based visibility
CREATE POLICY "posts_select" ON public.posts FOR SELECT USING (
  status NOT IN ('removed') AND (
    (type = 'hosting' AND target_city IS NULL)
    OR (target_city = (SELECT home_city FROM public.users WHERE id = auth.uid()))
    OR (user_id = auth.uid())
  )
);
CREATE POLICY "posts_insert" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update" ON public.posts FOR UPDATE USING (auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "posts_delete" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- CONNECTIONS
CREATE POLICY "connections_select" ON public.connections FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = acceptor_id
);
CREATE POLICY "connections_insert" ON public.connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "connections_update" ON public.connections FOR UPDATE USING (
  auth.uid() = requester_id OR auth.uid() = acceptor_id
);

-- MESSAGES
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.connections
    WHERE id = connection_id AND (requester_id = auth.uid() OR acceptor_id = auth.uid())
  )
);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.connections
    WHERE id = connection_id AND (requester_id = auth.uid() OR acceptor_id = auth.uid())
  )
);
CREATE POLICY "messages_update" ON public.messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.connections
    WHERE id = connection_id AND (requester_id = auth.uid() OR acceptor_id = auth.uid())
  )
);

-- REPORTS
CREATE POLICY "reports_insert" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_admin" ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- SUPPORT TICKETS
CREATE POLICY "tickets_insert" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets_select" ON public.support_tickets FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "tickets_update_admin" ON public.support_tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- NOTIFICATIONS
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- REALTIME
-- ═══════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ═══════════════════════════════════════════════════════════
-- POST EXPIRY FUNCTION (run via pg_cron or Supabase cron)
-- ═══════════════════════════════════════════════════════════
-- ═══════════════════════════════════════════════════════════
-- MIGRATIONS
-- Run these in Supabase SQL Editor if schema already exists
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS home_country text NOT NULL DEFAULT 'Germany',
  ADD COLUMN IF NOT EXISTS home_state   text,
  ADD COLUMN IF NOT EXISTS avatar_url   text,
  ADD COLUMN IF NOT EXISTS languages    text[] DEFAULT '{}';

-- Storage: create the avatars bucket manually in Supabase Dashboard
-- (Storage → New bucket → name: "avatars", Public: on)
-- Then add these RLS policies on storage.objects:

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "avatars_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION expire_old_posts()
RETURNS void LANGUAGE sql AS $$
  UPDATE public.posts
  SET status = 'expired'
  WHERE date_to < CURRENT_DATE AND status = 'open';
$$;

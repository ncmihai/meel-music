-- ========================================
-- MeelMusic — Full Database Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ========================================

-- ========================================
-- 1. PROFILES TABLE (extends auth.users)
-- ========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS: users can read all profiles (only 2 users), update own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ========================================
-- 2. SONGS_METADATA TABLE (cached song info)
-- ========================================
CREATE TABLE IF NOT EXISTS public.songs_metadata (
  id TEXT PRIMARY KEY,  -- YouTube video ID
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT DEFAULT NULL,
  duration_ms INTEGER DEFAULT 0
);

-- RLS: any authenticated user can read, insert (upsert)
ALTER TABLE public.songs_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Songs metadata readable by authenticated users"
  ON public.songs_metadata FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Songs metadata insertable by authenticated users"
  ON public.songs_metadata FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Songs metadata updatable by authenticated users"
  ON public.songs_metadata FOR UPDATE
  TO authenticated
  USING (true);

-- ========================================
-- 3. LIKED_SONGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.liked_songs (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL REFERENCES public.songs_metadata(id) ON DELETE CASCADE,
  liked_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, song_id)
);

-- RLS: users see/manage only own liked songs
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own liked songs"
  ON public.liked_songs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can like songs"
  ON public.liked_songs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike songs"
  ON public.liked_songs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- 4. PLAYLISTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: owner can CRUD, collaborators can read (defined after collaborators table)
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own playlists"
  ON public.playlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create playlists"
  ON public.playlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists"
  ON public.playlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists"
  ON public.playlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- 5. PLAYLIST_COLLABORATORS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.playlist_collaborators (
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (playlist_id, user_id)
);

ALTER TABLE public.playlist_collaborators ENABLE ROW LEVEL SECURITY;

-- Owner of the playlist can manage collaborators
CREATE POLICY "Playlist owner can manage collaborators"
  ON public.playlist_collaborators FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_collaborators.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- Collaborators can view their own collaboration entries
CREATE POLICY "Collaborators can view their entries"
  ON public.playlist_collaborators FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- NOW add policy so collaborators can also view the playlist itself
CREATE POLICY "Collaborators can view shared playlists"
  ON public.playlists FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.playlist_collaborators
      WHERE playlist_collaborators.playlist_id = playlists.id
      AND playlist_collaborators.user_id = auth.uid()
    )
  );

-- ========================================
-- 6. PLAYLIST_SONGS TABLE (junction)
-- ========================================
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL REFERENCES public.songs_metadata(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  order_index INTEGER DEFAULT 0,
  UNIQUE (playlist_id, song_id)
);

ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- Owner can manage songs in their playlists
CREATE POLICY "Playlist owner can manage songs"
  ON public.playlist_songs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- Collaborators can manage songs in shared playlists
CREATE POLICY "Collaborators can manage songs in shared playlists"
  ON public.playlist_songs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.playlist_collaborators
      WHERE playlist_collaborators.playlist_id = playlist_songs.playlist_id
      AND playlist_collaborators.user_id = auth.uid()
    )
  );

-- Anyone authenticated can view songs in playlists they have access to
CREATE POLICY "Users can view songs in accessible playlists"
  ON public.playlist_songs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND (
        playlists.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.playlist_collaborators
          WHERE playlist_collaborators.playlist_id = playlists.id
          AND playlist_collaborators.user_id = auth.uid()
        )
      )
    )
  );

-- ========================================
-- 7. REALTIME_SESSIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.realtime_sessions (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_song_id TEXT REFERENCES public.songs_metadata(id) ON DELETE SET NULL,
  is_playing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: users update own session, can read partner's session
ALTER TABLE public.realtime_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all sessions"
  ON public.realtime_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own session"
  ON public.realtime_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session"
  ON public.realtime_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- 8. ENABLE REALTIME on relevant tables
-- ========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_sessions;

-- ========================================
-- DONE! All 7 tables created with RLS policies.
-- Next step: Create 2 user accounts from Supabase Dashboard → Authentication → Users
-- ========================================

// ========================================
// MeelMusic — Core TypeScript Interfaces
// Aligned with Supabase schema (tabels.csv)
// ========================================

/** User profile (maps to `profiles` table) */
export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  updated_at: string;
}

/** Song metadata (maps to `songs_metadata` table) */
export interface Song {
  id: string;           // YouTube ID
  title: string;
  artist: string;
  cover_url: string;    // Spotify HD cover preferred
  duration_ms: number;
}

/** Playlist (maps to `playlists` table) */
export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

/** Playlist song entry (maps to `playlist_songs` junction table) */
export interface PlaylistSong {
  playlist_id: string;
  song_id: string;
  added_at: string;
  order_index: number;
  // Joined data (when fetching with song metadata)
  song?: Song;
}

/** Liked song entry (maps to `liked_songs` table) */
export interface LikedSong {
  user_id: string;
  song_id: string;
  liked_at: string;
  // Joined data
  song?: Song;
}

/** Playlist collaborator (maps to `playlist_collaborators` table) */
export interface PlaylistCollaborator {
  playlist_id: string;
  user_id: string;
}

/** Realtime listening session (maps to `realtime_sessions` table) */
export interface RealtimeSession {
  user_id: string;
  current_song_id: string | null;
  is_playing: boolean;
  updated_at: string;
  // Joined data
  song?: Song;
}

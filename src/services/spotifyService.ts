// ========================================
// Spotify API Service — Task 5.3 & 5.4
// Fetches Metadata (search, popular, album covers)
// ========================================

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

let accessToken = '';
let tokenExpirationTime = 0;

/**
 * Implements the OAuth 2.0 Client Credentials flow.
 * We fetch an access token server-to-server style (no user login required).
 */
export async function getSpotifyToken(): Promise<string> {
  // Return cached token if still valid (adding 60s buffer)
  if (accessToken && Date.now() < tokenExpirationTime - 60000) {
    return accessToken;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Missing Spotify credentials in .env');
  }

  const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Spotify token: ${response.statusText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Token usually valid for 3600 seconds (1 hour)
    tokenExpirationTime = Date.now() + (data.expires_in * 1000);
    
    return accessToken;
  } catch (error) {
    console.error('Spotify token error:', error);
    throw error;
  }
}

/** Helper to make authenticated requests to Spotify */
async function fetchSpotify(endpoint: string, params?: Record<string, string>) {
  const token = await getSpotifyToken();
  const url = new URL(`https://api.spotify.com/v1${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`);
  }

  return response.json();
}

/** Map Spotify track to our internal Song type */
function mapSpotifyTrack(track: any) {
  return {
    id: track.id, // Using Spotify ID as primary key
    title: track.name,
    artist: track.artists.map((a: any) => a.name).join(', '),
    cover_url: track.album?.images[0]?.url || '',
    duration_ms: track.duration_ms,
    album: track.album?.name,
  };
}

/**
 * Searches Spotify for tracks
 */
export async function searchSpotifySongs(query: string, limit = 20) {
  if (!query.trim()) return [];
  
  const data = await fetchSpotify('/search', {
    q: query,
    type: 'track',
    limit: limit.toString(),
  });
  
  return data.tracks.items.map(mapSpotifyTrack);
}

/**
 * Gets "popular" / returning tracks (e.g. from a global top 50 playlist)
 * Uses Spotify's "Top 50 - Global" playlist ID: 37i9dQZEVXbMDoHDwVN2tF
 */
export async function getPopularSongs(limit = 10) {
  const data = await fetchSpotify('/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks', {
    limit: limit.toString(),
  });
  
  return data.items
    .filter((item: any) => item.track) // Filter out nulls
    .map((item: any) => mapSpotifyTrack(item.track));
}

/**
 * Gets recommendations based on a seed track (useful for infinite auto-play)
 */
export async function getRecommendations(seedTrackId: string, limit = 5) {
  const data = await fetchSpotify('/recommendations', {
    seed_tracks: seedTrackId,
    limit: limit.toString(),
  });
  
  return data.tracks.map(mapSpotifyTrack);
}

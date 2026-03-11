// ========================================
// YouTube Service — Task 5.5
// Matches songs to YouTube and extracts streams
// ========================================

const PIPED_API_URL = 'https://pipedapi.kavin.rocks';

// Simple cache for stream URLs so we don't spam the API on repeat
const streamCache = new Map<string, string>();

/**
 * Searches for a song and returns a direct audio stream URL (Opus/M4A).
 * This uses a public Piped API instance as a lightweight proxy for YouTube data.
 */
export async function getAudioStream(title: string, artist: string): Promise<string | null> {
  const query = `${title} ${artist} audio`;
  const cacheKey = query.toLowerCase();
  
  if (streamCache.has(cacheKey)) {
    return streamCache.get(cacheKey)!;
  }

  try {
    // 1. Search for the video
    const searchRes = await fetch(`${PIPED_API_URL}/search?q=${encodeURIComponent(query)}&filter=music_songs`);
    const searchData = await searchRes.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      console.error('No audio found for:', title);
      return null;
    }
    
    // Take the first result (usually the official audio)
    const videoId = searchData.items[0].url.replace('/watch?v=', '');
    
    // 2. Get the stream extracts for this video
    const streamRes = await fetch(`${PIPED_API_URL}/streams/${videoId}`);
    const streamData = await streamRes.json();
    
    // Find highest quality audio-only stream (preferably Opus or M4A)
    const audioStreams = streamData.audioStreams;
    if (!audioStreams || audioStreams.length === 0) {
      return null;
    }
    
    // Sort by bitrate descending to get best quality
    audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate);
    
    const streamUrl = audioStreams[0].url;
    streamCache.set(cacheKey, streamUrl);
    
    return streamUrl;
    
  } catch (error) {
    console.error('Error fetching stream from Piped:', error);
    return null;
  }
}

// ========================================
// Audio Service — Task 5.5 (JioSaavn API Pivot)
// Reliably fetches direct MP4 stream URLs for full songs
// ========================================

// Public instance of the open-source JioSaavn API
const JIOSAAVN_API = 'https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=';

// Simple cache for stream URLs
const streamCache = new Map<string, string>();

/**
 * Searches for a song and returns a direct audio stream URL (320kbps MP4).
 * This completely bypasses YouTube IFrame blocks, CORS issues, and Cloudflare 
 * protections, allowing native HTML5 <audio> playback with seeking support!
 */
export async function getAudioStream(title: string, artist: string): Promise<string | null> {
  // Format query strictly for better matching
  const query = `${title} ${artist}`.replace(/[^a-zA-Z0-9 ]/g, '');
  const cacheKey = query.toLowerCase();
  
  if (streamCache.has(cacheKey)) {
    return streamCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(`${JIOSAAVN_API}${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) throw new Error(`JioSaavn API error: ${response.status}`);
    
    const data = await response.json();
    
    if (data.status === "SUCCESS" && data.data?.results?.length > 0) {
      const topResult = data.data.results[0];
      
      // Get the highest quality download URL (usually the last in the array)
      if (topResult.downloadUrl && topResult.downloadUrl.length > 0) {
        const streamUrl = topResult.downloadUrl[topResult.downloadUrl.length - 1].link;
        streamCache.set(cacheKey, streamUrl);
        return streamUrl;
      }
    }
    
    console.warn('No audio stream found on JioSaavn for:', title);
    return null;
    
  } catch (error) {
    console.error('Error fetching stream from JioSaavn:', error);
    return null;
  }
}


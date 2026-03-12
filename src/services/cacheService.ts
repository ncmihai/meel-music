import localforage from 'localforage';
import { getAudioStream } from './youtubeService';
import type { Song } from '../types';

// ========================================
// Offline Cache Service — Task 6.3
// Stores MP4 blobs in IndexedDB for offline playback
// ========================================

// Configure localForage instance
const audioStore = localforage.createInstance({
  name: 'meelmusic',
  storeName: 'audio_cache',
  description: 'Stores downloaded MP4 audio streams for offline playback'
});

export const cacheService = {
  /**
   * Downloads a song stream and saves it as a Blob in IndexedDB
   */
  async downloadSong(song: Song): Promise<boolean> {
    try {
      // 1. Get the stream URL 
      // (Bypasses caching to ensure we get a fresh, working URL for the download)
      const streamUrl = await getAudioStream(song.title, song.artist, song.duration_ms);
      
      if (!streamUrl) {
        throw new Error('No stream URL available to download.');
      }

      // 2. Fetch the actual MP4 data
      const response = await fetch(streamUrl);
      if (!response.ok) throw new Error(`HTTP Error ${response.status} when downloading.`);
      
      const blob = await response.blob();

      // 3. Save Blob to IndexedDB using the generic song ID as key
      await audioStore.setItem(song.id, blob);
      
      return true;
    } catch (error) {
      console.error(`Failed to download song ${song.title}:`, error);
      return false;
    }
  },

  /**
   * Checks if a song is available offline
   */
  async isSongCached(songId: string): Promise<boolean> {
    try {
      const keys = await audioStore.keys();
      return keys.includes(songId);
    } catch (e) {
      return false;
    }
  },

  /**
   * Retrieves the Blob URL for a cached song
   * Note: The caller MUST call URL.revokeObjectURL() when done or when the song changes to avoid memory leaks.
   */
  async getCachedSongUrl(songId: string): Promise<string | null> {
    try {
      const blob: Blob | null = await audioStore.getItem(songId);
      if (!blob) return null;
      
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`Failed to retrieve cached song ${songId}:`, error);
      return null;
    }
  },

  /**
   * Deletes a song from the offline cache
   */
  async deleteCachedSong(songId: string): Promise<boolean> {
    try {
      await audioStore.removeItem(songId);
      return true;
    } catch (error) {
      console.error(`Failed to delete cached song ${songId}:`, error);
      return false;
    }
  },

  /**
   * Returns a list of all downloaded song IDs
   */
  async getAllCachedSongIds(): Promise<string[]> {
    try {
      return await audioStore.keys();
    } catch (error) {
      console.error('Failed to get cached song IDs:', error);
      return [];
    }
  }
};

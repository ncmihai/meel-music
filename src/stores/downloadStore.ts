import { create } from 'zustand';
import { cacheService } from '../services/cacheService';
import type { Song } from '../types';

interface DownloadState {
  downloadedIds: string[];
  downloadingIds: string[];
  
  // Actions
  init: () => Promise<void>;
  downloadSong: (song: Song) => Promise<void>;
  deleteSong: (songId: string) => Promise<void>;
  isDownloaded: (songId: string) => boolean;
  isDownloading: (songId: string) => boolean;
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  downloadedIds: [],
  downloadingIds: [],

  init: async () => {
    const ids = await cacheService.getAllCachedSongIds();
    set({ downloadedIds: ids });
  },

  downloadSong: async (song: Song) => {
    // Prevent duplicate downloads
    if (get().downloadedIds.includes(song.id) || get().downloadingIds.includes(song.id)) {
      return; 
    }

    set((state) => ({
      downloadingIds: [...state.downloadingIds, song.id]
    }));

    try {
      const success = await cacheService.downloadSong(song);
      
      set((state) => ({
        downloadingIds: state.downloadingIds.filter((id) => id !== song.id),
        downloadedIds: success 
          ? [...state.downloadedIds, song.id] 
          : state.downloadedIds,
      }));
    } catch (error) {
      set((state) => ({
        downloadingIds: state.downloadingIds.filter((id) => id !== song.id),
      }));
    }
  },

  deleteSong: async (songId: string) => {
    const success = await cacheService.deleteCachedSong(songId);
    if (success) {
      set((state) => ({
        downloadedIds: state.downloadedIds.filter((id) => id !== songId)
      }));
    }
  },

  isDownloaded: (songId: string) => {
    return get().downloadedIds.includes(songId);
  },

  isDownloading: (songId: string) => {
    return get().downloadingIds.includes(songId);
  }
}));

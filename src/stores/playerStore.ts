import { create } from 'zustand';
import type { Song } from '../types';

// ========================================
// Player Store — Task 5.1
// Global state for HTML5 Audio playback
// ========================================

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number; // 0.0 to 1.0
  progress: number; // current time in seconds
  duration: number; // total time in seconds
  queue: Song[];
  seekTarget: number | null; // time to seek to (handled by AudioPlayer)
  
  // Actions
  play: (song?: Song) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  clearSeek: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  addToQueue: (song: Song) => void;
  setQueue: (songs: Song[]) => void;
  clearQueue: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  volume: 0.5,
  progress: 0,
  duration: 0,
  queue: [],
  seekTarget: null,

  seek: (time) => set({ seekTarget: time, progress: time }),
  clearSeek: () => set({ seekTarget: null }),

  play: (song) => {
    if (song) {
      // If a song is provided, play it and optionally add it to front of queue
      const { currentSong, queue } = get();
      
      // If playing a new song that isn't the current one
      if (currentSong?.id !== song.id) {
        // If it's already in the queue, remove it so we don't duplicate it
        const newQueue = queue.filter(s => s.id !== song.id);
        
        set({ 
          currentSong: song, 
          isPlaying: true, 
          progress: 0,
          // Put the current song back in the queue, behind the new one
          queue: currentSong ? [currentSong, ...newQueue] : newQueue 
        });
      } else {
        // Just resume playing the exact same song
        set({ isPlaying: true });
      }
    } else {
      // Just resume whatever is loaded
      set({ isPlaying: true });
    }
  },

  pause: () => set({ isPlaying: false }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  next: () => {
    const { queue } = get();
    if (queue.length > 0) {
      const nextSong = queue[0];
      const newQueue = queue.slice(1);
      
      // We don't keep a full history yet, but we drop the current song
      // (Could be expanded later into a `history` array for the `prev` action)
      set({ 
        currentSong: nextSong, 
        isPlaying: true, 
        progress: 0, 
        queue: newQueue 
      });
    } else {
      // End of queue -> stop playback
      set({ isPlaying: false, progress: 0 });
    }
  },

  prev: () => {
    const { progress } = get();
    // Simplified behavior for now: just reset to 0 if we're past 3 seconds
    // Full behavior would need a `history` array to go back to previous songs
    if (progress > 3) {
      set({ progress: 0 });
    } else {
      // TODO: implement back to previous song from history
      set({ progress: 0 });
    }
  },

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  
  setProgress: (progress) => set({ progress }),
  
  setDuration: (duration) => set({ duration }),

  addToQueue: (song) => set((state) => {
    // Prevent exactly identical songs from crowding the queue sequentially
    if (state.queue[state.queue.length - 1]?.id === song.id) {
      return state;
    }
    return { queue: [...state.queue, song] };
  }),

  setQueue: (songs) => set({ queue: songs }),

  clearQueue: () => set({ queue: [] }),
}));

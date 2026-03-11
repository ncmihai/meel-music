import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { getAudioStream } from '../services/youtubeService';

// ========================================
// AudioPlayer (Hidden Component) — Task 5.5 Final Pivot
// Controls the actual HTML5 <audio> element natively
// via direct MP4 URLs from JioSaavn API
// ========================================

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentSong = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  
  const setProgress = usePlayerStore((state) => state.setProgress);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const next = usePlayerStore((state) => state.next);
  const pause = usePlayerStore((state) => state.pause);
  const seekTarget = usePlayerStore((state) => state.seekTarget);
  const clearSeek = usePlayerStore((state) => state.clearSeek);

  // 1. Handle Song Change — fetch stream URL and play
  useEffect(() => {
    let active = true;

    const loadAndPlaySong = async () => {
      if (!currentSong) return;
      if (!audioRef.current) return;

      try {
        // Find best audio stream (now via JioSaavn MP4 direct links)
        const streamUrl = await getAudioStream(currentSong.title, currentSong.artist);
        
        if (!active) return; // Prevent race conditions if song changes fast
        
        if (streamUrl) {
          audioRef.current.src = streamUrl;
          
          if (isPlaying) {
            audioRef.current.play().catch(err => {
              console.error("Playback prevented by browser policy:", err);
              pause(); // Sync state with reality
            });
          }
        } else {
          console.warn("No stream URL found, skipping song.");
          pause();
          next(); // Skip to next if this one is completely unplayable
        }
      } catch (error) {
        console.error("Failed to load audio stream:", error);
        pause();
      }
    };

    loadAndPlaySong();

    return () => { active = false; };
  }, [currentSong]);

  // 2. Handle Play/Pause toggle from UI
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying && audioRef.current.src) {
      audioRef.current.play().catch(err => {
        console.error("Autoplay prevented:", err);
        pause();
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // 3. Handle Volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 4. Handle Seeking
  useEffect(() => {
    if (seekTarget !== null && audioRef.current) {
      // HTML5 audio seeking is just setting currentTime
      audioRef.current.currentTime = seekTarget;
      clearSeek();
    }
  }, [seekTarget, clearSeek]);

  // Event Handlers for the <audio> element
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      // JioSaavn might return a completely different duration than Spotify
      // But we'll trust the actual audio file's duration for playback progress
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    next();
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error("Audio playback error:", e.currentTarget.error);
    pause(); 
    next(); // Skip broken streams
  };

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      onError={handleError}
      className="hidden" // Never visible, UI is built separately
      autoPlay={false}
      preload="auto"
    />
  );
}

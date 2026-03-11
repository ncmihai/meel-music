import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { getAudioStream } from '../services/youtubeService';

// ========================================
// AudioPlayer (Hidden Component) — Task 5.2
// Controls the actual HTML5 <audio> element
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

  // 1. Handle Song Change — fetch stream URL and play
  useEffect(() => {
    let active = true;

    const loadAndPlaySong = async () => {
      if (!currentSong) return;
      if (!audioRef.current) return;

      try {
        // Find best audio stream via YouTube proxy / Piped API
        const streamUrl = await getAudioStream(currentSong.title, currentSong.artist);
        
        if (!active) return; // Prevent race conditions if song changes fast
        
        if (streamUrl) {
          audioRef.current.src = streamUrl;
          
          // We must wait for the audio subsystem to engage
          if (isPlaying) {
            audioRef.current.play().catch(err => {
              console.error("Playback prevented by browser policy:", err);
              pause(); // Sync state with reality
            });
          }
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
    
    // Only attempt to play if we have a source loaded
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

  // Event Handlers for the <audio> element
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    // Auto-play the next song in queue when this one finishes
    next();
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error("Audio playback error:", e.currentTarget.error);
    pause(); // Stop state so UI doesn't look like it's playing silence
  };

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      onError={handleError}
      className="hidden" // Never visible, UI is built separately
    />
  );
}

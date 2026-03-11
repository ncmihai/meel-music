import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePlayerStore } from '../stores/playerStore';
import { searchSpotifySongs } from '../services/spotifyService';

// ========================================
// Home Page — Temporary Dev UI for Audio Testing
// Task 5 - Audio Engine
// ========================================

export default function Home() {
  const { user, signOut } = useAuth();
  
  // Audio Player State
  const { currentSong, isPlaying, volume, progress, duration, play, togglePlay, setVolume } = usePlayerStore();
  
  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const tracks = await searchSpotifySongs(query, 5);
      setResults(tracks);
    } catch (err) {
      console.error(err);
      alert('Error searching Spotify. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 pb-32">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">🏠 Home (Dev Audio Test)</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{user.email}</span>
            <button
              onClick={signOut}
              className="rounded-lg bg-white/5 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary"
            >
              Logout
            </button>
          </div>
        ) : (
          <span className="text-sm text-text-secondary border border-white/10 rounded-full px-3 py-1">Mode: Guest</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT: Search & Results */}
        <div className="bg-bg-card p-6 rounded-2xl border border-white/5">
          <h2 className="text-xl font-semibold mb-4 text-white">1. Search Spotify</h2>
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g. The Weeknd Blinding Lights"
              className="flex-1 rounded-lg border border-white/10 bg-bg-surface px-4 py-2 text-text-primary outline-none focus:border-primary"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </button>
          </form>

          <div className="space-y-3">
            {results.map((track) => (
              <div key={track.id} className="flex items-center gap-4 p-3 rounded-xl bg-bg-surface hover:bg-white/5 transition group">
                <img src={track.cover_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{track.title}</p>
                  <p className="text-sm text-text-secondary truncate">{track.artist}</p>
                </div>
                <button 
                  onClick={() => play(track)}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-primary hover:text-white transition-colors"
                  title="Play"
                >
                  ▶
                </button>
              </div>
            ))}
            {results.length === 0 && !loading && <p className="text-text-secondary text-sm">No results yet.</p>}
          </div>
        </div>

        {/* RIGHT: Player State & Controls */}
        <div className="bg-bg-card p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
            <span className="text-2xl">📻</span> Audio Engine State
          </h2>

          <div className="w-48 h-48 rounded-2xl bg-bg-surface mb-6 overflow-hidden shadow-2xl relative">
            {currentSong ? (
              <img src={currentSong.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary text-4xl">🎵</div>
            )}
            
            {/* Playing indicator overlay */}
            {isPlaying && (
              <div className="absolute top-3 right-3 flex gap-1 items-end h-4">
                <div className="w-1 bg-primary h-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 bg-primary h-4/5 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 bg-primary h-3/5 animate-bounce"></div>
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-white mb-1 truncate w-full px-4">
            {currentSong?.title || 'No Song Loaded'}
          </h3>
          <p className="text-text-secondary mb-8 truncate w-full px-4">
            {currentSong?.artist || 'Search and play a track...'}
          </p>

          {/* Progress Bar (Interactive Seek) */}
          <div className="w-full px-8 mb-8">
            <input 
              type="range" 
              min="0" 
              max={duration || 0} 
              step="1"
              value={progress}
              onChange={(e) => usePlayerStore.getState().seek(parseFloat(e.target.value))}
              disabled={!currentSong || duration === 0}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none outline-none accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: `linear-gradient(to right, var(--color-primary) ${(progress / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${(progress / (duration || 1)) * 100}%)`
              }}
            />
            <div className="flex justify-between text-xs text-text-secondary mt-2">
              <span>{Math.floor(progress / 60)}:{(Math.floor(progress % 60)).toString().padStart(2, '0')}</span>
              <span>
                {duration ? `${Math.floor(duration / 60)}:${(Math.floor(duration % 60)).toString().padStart(2, '0')}` : '0:00'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mb-8">
            <button className="text-text-secondary hover:text-white transition-colors" title="Previous">⏮</button>
            <button 
              onClick={togglePlay}
              disabled={!currentSong}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-primary text-white text-xl hover:scale-105 hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="text-text-secondary hover:text-white transition-colors" title="Next">⏭</button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 w-48 text-text-secondary">
            <span>🔈</span>
            <input 
              type="range" 
              min="0" max="1" step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span>🔊</span>
          </div>

        </div>
      </div>
    </div>
  );
}

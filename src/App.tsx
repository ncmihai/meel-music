import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Login from './pages/Login';
import AudioPlayer from './components/AudioPlayer';
import MainLayout from './components/MainLayout';
import { useDownloadStore } from './stores/downloadStore';

export default function App() {
  useEffect(() => {
    // Initialize offline cache tracking on app load
    useDownloadStore.getState().init();
  }, []);
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* The AudioPlayer persists across all pages and manages the HTML5 audio element */}
        <AudioPlayer />
        
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes — wrapped in MainLayout for global Sidebar/Player */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Login from './pages/Login';
import AudioPlayer from './components/AudioPlayer';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* The AudioPlayer persists across all pages and manages the HTML5 audio element */}
        <AudioPlayer />
        
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes — redirect to /login if not authenticated */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

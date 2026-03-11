# MeelMusic — Task-uri Granulare 🎵

> **Cum funcționează:** Fiecare task e mic, verificabil, și pe cât posibil independent.
> Bifează cu `[x]` ce e gata, `[/]` ce e în lucru. Poți reordona sau sări peste orice.
> **"Ce înveți"** explică conceptele noi din fiecare task.

---

## 🏗️ FAZA 1 — Setup Proiect & Deployment

### 1.1 Scaffold Vite + React + TypeScript
- [x] Inițializează proiectul: `npm create vite@latest ./ -- --template react-ts`
- [x] Verifică structura: `src/`, `index.html`, `vite.config.ts`
- [x] `npm run dev` → pagina default apare în browser
- **Ce înveți:** Vite ca bundler (ESBuild + HMR), structura unui proiect React+TS

### 1.2 Instalare & Configurare Tailwind CSS
- [x] Instalează `tailwindcss` + `@tailwindcss/vite` (v4 folosește Vite plugin, nu PostCSS separat)
- [x] Adaugă plugin-ul Tailwind în `vite.config.ts`
- [x] Adaugă `@import "tailwindcss"` + custom theme în `src/index.css`
- [x] Test: `text-primary` (purple) apare corect pe pagini ✓
- **Ce înveți:** Tailwind v4 (Vite plugin approach), CSS custom properties, @theme directive

### 1.3 Routing cu React Router
- [x] Instalează `react-router-dom`
- [x] Creează pagini goale: `Home`, `Search`, `Library`, `Login`
- [x] Configurează `<BrowserRouter>` + `<Routes>` în `App.tsx`
- [x] Verifică: `/`, `/search`, `/library`, `/login` funcționează ✓
- **Ce înveți:** Client-side routing, SPA navigation, React Router v6

### 1.4 Structură de foldere
- [x] Creează structura:
  ```
  src/
  ├── components/    # Componente reutilizabile
  ├── pages/         # Home, Search, Library, Login
  ├── layouts/       # MainLayout (sidebar + player bar)
  ├── hooks/         # Custom hooks
  ├── lib/           # Supabase client, utilități
  ├── services/      # API calls (Spotify, YouTube.js, cache)
  ├── stores/        # Zustand stores
  ├── types/         # TypeScript interfaces
  └── assets/        # Imagini, fonturi
  ```
- [x] Creează `types/index.ts` cu interfețele: `Song`, `Playlist`, `Profile`, `LikedSong`, `PlaylistSong`, `PlaylistCollaborator`, `RealtimeSession`
- **Ce înveți:** Separarea responsabilităților, convenții React project structure

### 1.5 Prima deploiare pe Vercel *(skipped — facem mai târziu)*
- [ ] Conectează repo-ul la Vercel
- [ ] Configurează: Framework = Vite, Build = `npm run build`, Output = `dist`
- [ ] Deploy → site-ul live funcționează
- [ ] Verifică auto-deploy la push pe `main`
- **Ce înveți:** CI/CD basics, Vercel pipeline, environment variables

---

## 🔐 FAZA 2 — Supabase: Autentificare

### 2.1 Creare proiect Supabase
- [x] Creează proiect pe [supabase.com](https://supabase.com)
- [x] Notează `SUPABASE_URL` + `SUPABASE_ANON_KEY`
- [x] `.env` local + `.env` în `.gitignore`
- **Ce înveți:** BaaS, API keys (anon key vs service key)

### 2.2 Supabase Client în React
- [x] Instalează `@supabase/supabase-js`
- [x] Creează `src/lib/supabase.ts` — inițializează clientul cu error handling
- [x] Test: conexiunea la Supabase funcționează (login error = API connected) ✓
- **Ce înveți:** SDK patterns, singleton, PostgREST + GoTrue

### 2.3 Pagina de Login
- [x] Formular email + parolă → `supabase.auth.signInWithPassword()`
- [x] Handling erori (parolă greșită → mesaj în română)
- [x] Dark theme styling cu Tailwind ✓
- [x] Verifică login cu cont real creat din Dashboard *(trebuie creat user)*
- **Ce înveți:** JWT auth, sesiuni, GoTrue

### 2.4 Auth Context & Protected Routes
- [x] `AuthContext` + `AuthProvider` în `useAuth.tsx`
- [x] `onAuthStateChange` → actualizează starea
- [x] `ProtectedRoute` → redirect la `/login` dacă neautentificat ✓
- [x] Test: accesezi `/` fără login → redirect ✓
- **Ce înveți:** React Context API, auth guard pattern, JWT lifecycle

### 2.5 Logout & Persistență sesiune
- [x] Buton Logout pe Home page → `supabase.auth.signOut()`
- [x] Verifică: refresh → logat; logout → redirect *(trebuie user real)*
- **Ce înveți:** Session persistence, token refresh flow

---

## 🗄️ FAZA 3 — Schema Baza de Date (Supabase)

### 3.1–3.7 Toate tabelele — SQL Migration Script ✅
- [x] Script complet: `supabase/migration.sql` cu toate 7 tabelele + RLS + triggers
- [x] **⏳ USER ACTION: Rulează migration.sql în Supabase SQL Editor**
- [x] **⏳ USER ACTION: Creează 2 conturi de user din Dashboard → Authentication → Users**
- [x] Test: verifică tabelele în Supabase Dashboard → Table Editor
- **Ce înveți:** PostgreSQL, triggers, RLS, Foreign Keys, cascading, upsert, realtime

---

## 🔄 FAZA 4 — Supabase Realtime (Sincronizare)

### 4.1 Subscribe la `realtime_sessions`
- [ ] `supabase.channel()` → ascultă UPDATE pe `realtime_sessions`
- [ ] Hook `usePartnerSession()` → sesiunea celuilalt user
- [ ] Test: schimbă date în Dashboard → UI se actualizează instant
- **Ce înveți:** WebSockets, Supabase Realtime, pub/sub

### 4.2 Update sesiune la schimbarea melodiei
- [ ] La play/pause → update `is_playing`
- [ ] La schimbare melodie → update `current_song_id` + `updated_at`
- [ ] ⚠️ Multi-device: folosim **last-write-wins** (ultimul device care interacționează câștigă)
- [ ] Test: schimbă melodia → apare în Dashboard
- **Ce înveți:** Last-write-wins strategy, realtime sync patterns

### 4.3 Widget "Partenerul ascultă..."
- [ ] Componenta `PartnerStatus`: cover + titlu + artist + stare (play/pauză)
- [ ] Animație pulse/glow când ascultă activ
- [ ] "Offline" dacă `updated_at` > 5 minute
- [ ] Test: 2 tab-uri (2 useri) → sync real-time
- **Ce înveți:** Conditional rendering, timestamp comparisons, live UI

---

## 🎵 FAZA 5 — Audio Engine (Hybrid: Spotify + YouTube.js)

### 5.1 Zustand Player Store
- [ ] Instalează `zustand`
- [ ] `usePlayerStore`: `currentSong`, `isPlaying`, `volume`, `progress`, `queue`
- [ ] Acțiuni: `play()`, `pause()`, `next()`, `prev()`, `setVolume()`, `seek()`, `addToQueue()`
- [ ] Test: din DevTools, acțiunile funcționează
- **Ce înveți:** Zustand (mai simplu ca Redux, mai performant ca Context), store patterns

### 5.2 Componenta `<AudioPlayer>` (HTML5 Audio)
- [ ] Element `<audio>` ascuns, conectat la Zustand
- [ ] `currentSong` schimbat → setează `src`
- [ ] Evenimente: `onTimeUpdate`, `onEnded`, `onError`, `onLoadedMetadata`
- [ ] Test: URL audio valid → se aude muzica
- **Ce înveți:** HTML5 Audio API, React refs, event-driven programming

### 5.3 Spotify Web API — Setup & Autentificare
- [ ] Creează aplicație pe [Spotify Developer Dashboard](https://developer.spotify.com)
- [ ] Obține `Client ID` + `Client Secret`
- [ ] Implementează **Client Credentials Flow** (nu necesită user login — doar API key)
- [ ] `src/services/spotifyService.ts` → funcție `getSpotifyToken()` cu token caching
- [ ] Test: obține un token valid
- **Ce înveți:** OAuth2 Client Credentials flow, API tokens, caching strategies

### 5.4 Spotify Web API — Search & Browse
- [ ] `searchSpotifySongs(query)` → returnează: `title`, `artist`, `album`, `cover_url`, `duration_ms`, `spotify_id`
- [ ] `getPopularSongs()` → top tracks / new releases (pentru Home page)
- [ ] `getAlbumCovers(albumId)` → imagini de calitate pentru UI
- [ ] Pagina Search: input + rezultate cu cover art de la Spotify
- [ ] Test: caută o melodie → rezultate cu imagini HD
- **Ce înveți:** Spotify API endpoints, pagination, rate limiting (429 status)

### 5.5 YouTube.js — Matching & Stream Extraction
- [ ] `src/services/youtubeService.ts` → `getAudioStream(title, artist)`
- [ ] Logica: primește titlu+artist de la Spotify → caută pe YouTube → extrage best audio stream URL
- [ ] Validare match: verifică durata (±10s tolerance) pentru a evita versiuni greșite
- [ ] Test: dă titlu+artist → primești URL audio funcțional
- **Ce înveți:** Audio stream extraction, matching algorithms, YouTube data structures

### 5.6 Vercel Serverless Proxy (`/api/stream`)
- [ ] Creează `api/stream.ts` (Vercel serverless function)
- [ ] Primește `songId` → returnează proxied stream URL sau stream direct
- [ ] Handlează CORS headers
- [ ] Test: fetch de la `/api/stream?id=xyz` → primești audio stream fără CORS error
- **Ce înveți:** Serverless functions, CORS mechanics, proxy patterns, Vercel API routes

### 5.7 Media Session API (Lock Screen Controls)
- [ ] `navigator.mediaSession.metadata` = `title`, `artist`, `artwork` (de la Spotify covers)
- [ ] Action handlers: `play`, `pause`, `previoustrack`, `nexttrack`
- [ ] Conectează handlers la Zustand actions
- [ ] Test pe telefon: blochează ecranul → controale funcționează
- **Ce înveți:** Media Session API, OS integration, browser ↔ OS communication

---

## 📱 FAZA 6 — PWA & Offline (Caching)

### 6.1 Configurare PWA
- [ ] Instalează `vite-plugin-pwa`
- [ ] `manifest.json`: name, icons (192x192, 512x512), theme_color, `display: standalone`
- [ ] Test Chrome DevTools → Application → Manifest OK
- [ ] Test pe telefon: "Add to Home Screen"
- **Ce înveți:** PWA fundamentals, Web App Manifest

### 6.2 Service Worker caching
- [ ] Precache: HTML, CSS, JS bundles
- [ ] Runtime cache: thumbnails/covers cu `StaleWhileRevalidate`
- [ ] Test: oprește wifi → pagina se încarcă
- **Ce înveți:** Service Worker lifecycle, caching strategies

### 6.3 IndexedDB pentru melodii offline
- [ ] Instalează `localforage`
- [ ] `src/services/cacheService.ts`: `cacheSong()`, `getCachedSong()`, `deleteCachedSong()`, `getCacheSize()`
- [ ] Test: descarcă → oprește wifi → play funcționează
- **Ce înveți:** IndexedDB, Blob storage, storage quotas

### 6.4 UI Download & Cache Management
- [ ] Buton "⬇ Download" pe fiecare melodie + progress bar
- [ ] Secțiune "Downloaded Songs"
- [ ] Indicator vizual (✓) pe melodii descărcate
- [ ] "Clear Cache" + afișare spațiu ocupat
- [ ] Test: descarcă 3, verifică, șterge una
- **Ce înveți:** Download progress (fetch ReadableStream), storage management UX

---

## 🎨 FAZA 7 — UI/UX Design

### 7.1 Design System
- [ ] Paletă culori (dark theme) în `tailwind.config.js`
- [ ] Google Fonts (heading + body)
- [ ] Componente de bază: `Button`, `Input`, `Card`, `Badge`
- [ ] Instalează `react-hot-toast` pentru notificări
- [ ] Pagină demo cu toate componentele
- **Ce înveți:** Design systems, design tokens, component-driven UI

### 7.2 Layout Principal
- [ ] `MainLayout`: Sidebar (stânga) + Content (centru) + Player Bar (jos, fixed)
- [ ] Sidebar: logo, navigație, playlisturi
- [ ] Mobile: sidebar → bottom nav bar
- [ ] Test: navigație consistentă
- **Ce înveți:** CSS Grid/Flexbox, responsive design, persistent UI

### 7.3 Player Bar complet
- [ ] Info: thumbnail (Spotify cover) + titlu + artist
- [ ] Controale: Prev, Play/Pause, Next
- [ ] Progress bar clickabil + draggable
- [ ] Volum slider + mute
- [ ] Buton Like (❤️) → toggle `liked_songs`
- [ ] Buton Queue
- [ ] Animații hover + tranziții smooth
- **Ce înveți:** Complex composition, CSS animations, range inputs, drag events

### 7.4 Pagina Home
- [ ] Widget `PartnerStatus`
- [ ] "Ascultate recent" (date locale din localStorage)
- [ ] "Playlisturile tale"
- [ ] "Popular acum" (de la Spotify API)
- [ ] Cards cu scroll orizontal pe mobile
- **Ce înveți:** Dashboard layout, horizontal scroll, skeleton loading

### 7.5 Pagina Search
- [ ] Search bar cu debounce (200ms) → Spotify API
- [ ] Rezultate: cover (Spotify), titlu, artist, durată
- [ ] Butoane: Play (→ YouTube.js stream), Add to Queue, Add to Playlist, Like, Download
- [ ] States: loading, empty, error
- **Ce înveți:** Debounced search, hybrid data flow (Spotify UI → YouTube audio)

### 7.6 Pagina Library
- [ ] Tab-uri: "Playlists" + "Liked Songs"
- [ ] Grid playlisturi: cover (auto-generated din primele 4 melodii), name, nr. melodii
- [ ] "Create Playlist" → modal
- [ ] Pagină playlist: listă melodii, remove, reorder, invite collaborator
- [ ] CRUD complet funcțional
- **Ce înveți:** CRUD UI, modals, optimistic updates, auto-generated covers

### 7.7 Queue View
- [ ] Sidebar/modal cu melodiile din queue
- [ ] Melodia curentă highlighted
- [ ] Remove + reorder
- [ ] Test: adaugă, reordonează, play order corect
- **Ce înveți:** Queue data structure, list manipulation

---

## ✅ FAZA 8 — Mobile, Testare & Polish

### 8.1 Optimizări mobile
- [ ] Touch targets minim 44x44px
- [ ] Background playback: melodia continuă cu ecranul blocat
- [ ] Test pe iOS Safari + Android Chrome
- **Ce înveți:** Mobile-first, iOS audio quirks, background execution

### 8.2 Testare offline
- [ ] Descarcă 5 melodii → Airplane Mode → app + melodii funcționează
- [ ] Erori clare pentru acțiuni ce necesită network
- **Ce înveți:** Offline-first testing, error boundaries

### 8.3 Performance & Cross-browser
- [ ] Lighthouse > 90 (Performance, Accessibility, PWA)
- [ ] Lazy loading imagini, bundle size optimization
- [ ] Test: Chrome, Safari (desktop + mobile), Firefox
- **Ce înveți:** Lighthouse, code splitting, lazy loading

### 8.4 Polish final
- [ ] Empty states, error states, loading states pe toate paginile
- [ ] Tranziții smooth între pagini
- [ ] Consistență vizuală globală
- **Ce înveți:** UX completeness, defensive UI

---

## 📊 REZUMAT

| Faza | Taskuri | Complexitate | Dependențe minime |
|------|---------|-------------|-------------------|
| 1. Setup | 5 | ⭐ | Niciuna |
| 2. Auth | 5 | ⭐⭐ | Faza 1 |
| 3. Schema DB | 7 | ⭐⭐ | Faza 2 |
| 4. Realtime | 3 | ⭐⭐⭐ | Faza 3 + 5 |
| 5. Audio Engine | 7 | ⭐⭐⭐⭐ | Faza 1 |
| 6. PWA & Offline | 4 | ⭐⭐⭐ | Faza 5 |
| 7. UI/UX | 7 | ⭐⭐⭐ | Faza 1-5 |
| 8. Mobile & Polish | 4 | ⭐⭐ | Toate |
| **TOTAL** | **42** | | |

> **Ordine sugerată (flexibilă):**
> `1.1→1.5` → `2.1→2.5` → `3.1→3.7` → `5.1→5.2` → `7.1→7.2` → `5.3→5.6` → `7.3` → `5.7` → `4.1→4.3` → `7.4→7.7` → `6.1→6.4` → `8.1→8.4`
>
> Spune-mi cu ce vrei să începem!

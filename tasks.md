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

- [ ] Evenimente: `onTimeUpdate`, `onEnded`, `onError`, `onLoadedMetadata`
- [x] Test: URL audio valid → se aude muzica
- **Ce înveți:** HTML5 Audio API, React refs, event-driven programming

### 5.3 Spotify Web API — Setup & Autentificare
- [x] Creează aplicație pe [Spotify Developer Dashboard](https://developer.spotify.com)
- [x] Obține `Client ID` + `Client Secret`
- [x] Implementează **Client Credentials Flow** (nu necesită user login — doar API key)
- [x] `src/services/spotifyService.ts` → funcție `getSpotifyToken()` cu token caching
- [x] Test: obține un token valid
- **Ce înveți:** OAuth2 Client Credentials flow, API tokens, caching strategies

### 5.4 Spotify Web API — Search & Browse
- [x] `searchSpotifySongs(query)` → returnează: `title`, `artist`, `album`, `cover_url`, `duration_ms`, `spotify_id`
- [x] Pagina Dev Audio Test: input + rezultate cu cover art de la Spotify
- [x] Test: caută o melodie → rezultate cu imagini HD
- **Ce înveți:** Spotify API endpoints, pagination, rate limiting (429 status)

### 5.5 JioSaavn API — Full Songs & Native HTML5 Audio 🚀 (Pivot Final)
- [x] Renunțat la YouTube și iframe-uri (problemă cu Black Screens și autoplay blocat de browser).
- [x] Logica `youtubeService.ts` a fost reimplementată pentru a interoga o instanță publică de **JioSaavn API** open-source.
- [x] Acum primim linkuri directe `.mp4`/`.m4a` la 320kbps.
- [x] Reîntors la elementul nativ `<audio>` în `AudioPlayer.tsx` pentru fiabilitate maximă, lipsa erorilor de CORS, și suport nativ pentru **Seek**.
- [x] **NEW:** Matching Strict (Duration Check). Când JioSaavn returnează rezultate, comparăm durata audio cu `duration_ms` de la Spotify. Dacă diferența e > 15 secunde, trecem la următorul rezultat JioSaavn pentru a evita remixuri/versiuni greșite.

### 5.6 Vercel Serverless Proxy (Anulat / Obsoleto)
- [x] S-a renunțat la proxy-uri locale și Vercel rules, deoarece iTunes API funcționează nativ direct în browser având `Access-Control-Allow-Origin: *`.

### 5.7 Media Session API (Lock Screen Controls)
- [x] `navigator.mediaSession.metadata` = `title`, `artist`, `artwork` (de la Spotify covers)
- [x] Action handlers: `play`, `pause`, `previoustrack`, `nexttrack`
- [x] Conectează handlers la Zustand actions
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
- [x] `MainLayout`: Sidebar (stânga) + Content (centru) + Player Bar (jos, fixed)
- [x] Sidebar: logo, navigație, playlisturi
- [ ] Mobile: sidebar → bottom nav bar
- [x] Test: navigație consistentă
- **Ce înveți:** CSS Grid/Flexbox, responsive design, persistent UI

### 7.3 Player Bar complet
- [x] Info: thumbnail (Spotify cover) + titlu + artist
- [x] Controale: Prev, Play/Pause, Next
- [x] Progress bar clickabil + draggable
- [x] Volum slider + mute
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

### 7.5 Pagina Search & Recommendations 🎵
- [x] Search bar cu debounce (200ms) → Căutare live "as you type" implementată.
- [x] Rezultate: cover, titlu, artist, durată (populate via JioSaavn Music API).
- [x] **NEW:** Secțiune "Recomandări pentru tine" folosind Music Recommendations API (Afișată când bara de căutare e goală).
- [ ] Butoane: Play (→ JioSaavn stream), Add to Queue, Add to Playlist, Like, Download
- [x] States: loading, empty, error
- **Ce înveți:** Debounced search, hybrid data flow.

### 7.5.1 Versuri Sincronizate (Lyrics Toggle) 🎤
- [x] Implementare buton "Lyrics" în PlayerBar.
- [x] La activare, interfața principală culisează spre stânga (Spotify style).
- [x] Se deschide un panel lateral dreapta cu versurile curente.
- [x] Integrare **LRCLIB API** pentru a aduce versurile per melodie.
- [x] Sincronizare vizuală a versurilor cu secundele melodiilor.
- **Ce înveți:** UI sliding animations, third-party lyrics API, time-syncing text cu `<audio>`.

### 7.6 Pagina Library
- [x] Tab-uri: "Playlists" + "Liked Songs"
- [x] Grid playlisturi: cover (auto-generated din melodii), name, nr. melodii
- [x] "Create Playlist" → modal/prompt
- [x] CRUD local (LocalStorage + Zustand pssist)
- **Ce înveți:** Local state management, CRUD UI, auto-generated multiple-covers grid

### 7.7 Queue View
- [x] Sidebar/modal cu melodiile din queue (QueuePanel slide animation)
- [x] Melodia curentă highlighted ("Now Playing")
- [x] Remove melodie
- [x] Test: adaugă, reordonează (handled via play tracking)
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

### 8.4 Server Backend (API Key Censor Proxy) — Nou 🔒
- [ ] Creare server de NodeJS / Next.js API Routes / Cloudflare Worker.
- [ ] Mutarea `VITE_SPOTIFY_CLIENT_SECRET` exclusiv pe server (pentru a nu mai ajunge la client).
- [ ] Endpoint de proxy pentru fetch-urile de token-uri Spotify și request-uri sensibile direct de la browser.
- **Ce înveți:** Security best practices, backend proxy, ascunderea cheilor de API pe server.

### 8.5 Polish final
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

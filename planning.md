# MeelMusic - Project Planning & Agentic Workflow

## 🤖 ANTIGRAVITY AGENT INSTRUCTIONS & GLOBAL RULES

**IMPORTANT FOR THE AI AGENT:** Before executing any development steps, you must acknowledge and adhere strictly to the following global rules:

### Rule 1: MCP Sequential Thinking
* **Action Required:** Access the MCP menu in Antigravity and download/enable the `mcp-sequential-thinking` module.
* **Usage:** You MUST use this module for planning steps, architectural decisions, and troubleshooting complex bugs. Do not write code for major features without a documented sequential thought process.

### Rule 2: Time-Boxed Deep Work
* **Pre-Implementation Phase (Min. 15 Minutes):** For every major phase below, spend at least 15 minutes iterating internally: Brainstorming -> Debating approaches -> Stress testing ideas for edge cases.
* **Implementation & Post-Implementation Phase (Min. 15 Minutes):** Spend at least 15 minutes implementing, testing the application of ideas, debating the implementation's success, reiterating if needed, and logging conclusions. *Adjust times based on task complexity, but maintain this deliberate pace.*

### Rule 3: Agentic Workflow (The "Virtual Team")
Act as a swarm of 5-10 specialized agents working in sequence. For every major task, simulate this workflow in your logs:
1.  **Brainstorm (Architect & UI/UX):** Propose solutions.
2.  **Debate/Stress Test (Senior Dev & Security):** Find flaws (e.g., CORS issues, Vercel serverless limits, mobile battery drain).
3.  **Iterate & Implement (Code Generator):** Write the actual code.
4.  **Test Application (QA Agent):** Review the written code against requirements.
5.  **Debate Implementation (Lead Dev):** Are there better abstractions? Is it performant?
6.  **Reiterate/Finalize (Code Generator):** Apply final fixes.
7.  **Log Conclusion:** State what was done and what's next.

---

## 🛠️ TECH STACK
* **Frontend & Framework:** Vite + React (sau Vue) + TypeScript.
* **State Management:** Zustand (pentru un store global rapid și curat al playerului audio).
* **Styling:** Tailwind CSS.
* **Hosting:** Vercel.
* **Backend / Auth / Database:** Supabase (PostgreSQL + Realtime WebSockets for "currently listening" sync).
* **Metadata Source:** Spotify Web API (popular songs, album covers, search results for UI display).
* **Audio Source:** YouTube Music ecosystem (via YouTube.js / LuanRT OR Piped REST API). Hybrid: UI shows Spotify data → audio stream fetched from YouTube.js by matching title/artist.
* **Audio Proxy:** Vercel Serverless Functions (proxy stream URLs to avoid CORS issues).
* **Caching & Native Feel:** PWA (Service Workers), IndexedDB (stocare offline piese), Media Session API (control ecran blocat).

---

## 🗄️ DATABASE STRUCTURE (Supabase)

### 1. `profiles`
* `id` (UUID, PK) - Legat de `auth.users.id`
* `username` (Text)
* `avatar_url` (Text)
* `updated_at` (Timestamp)

### 2. `songs_metadata`
* `id` (Text, PK) - ID-ul unic al piesei (ex: YouTube ID)
* `title` (Text)
* `artist` (Text)
* `cover_url` (Text)
* `duration_ms` (Integer)

### 3. `liked_songs`
* `user_id` (UUID, FK) → profiles
* `song_id` (Text, FK) → songs_metadata
* `liked_at` (Timestamp)
* UNIQUE(`user_id`, `song_id`)

### 4. `playlists`
* `id` (UUID, PK)
* `user_id` (UUID, FK) - Creatorul playlistului
* `name` (Text)
* `created_at` (Timestamp)

### 5. `playlist_collaborators`
* `playlist_id` (UUID, FK) → playlists
* `user_id` (UUID, FK) → profiles
* UNIQUE(`playlist_id`, `user_id`)

### 6. `playlist_songs` (Junction Table)
* `playlist_id` (UUID, FK)
* `song_id` (Text, FK) → songs_metadata (upsert on add)
* `added_at` (Timestamp)
* `order_index` (Integer)

### 7. `realtime_sessions` (For "Listening Now" Sync)
* `user_id` (UUID, PK)
* `current_song_id` (Text, FK)
* `is_playing` (Boolean)
* `updated_at` (Timestamp)

---

## 📋 DEVELOPMENT PHASES

### Phase 1: Initial Setup & Vercel Deployment
* **Goal:** Initialize the repo, configure the Vite project, and set up CI/CD to Vercel.
* **Tasks:**
    * Scaffold Vite project (React/TypeScript).
    * Install Tailwind CSS and setup basic routing.
    * Deploy "Hello World" to Vercel to ensure pipeline works.
* *Agent Focus:* Ensure Vite config is optimized for Vercel deployment and PWA plugins are ready.

### Phase 2: Supabase Integration (Auth & Realtime DB)
* **Goal:** Create a secure environment for 2 users and set up the database tables.
* **Tasks:**
    * Set up Supabase project and connect to the app.
    * Implement Email/Password Login.
    * Apply DB Schema (profiles, songs_metadata, liked_songs, playlists, playlist_collaborators, playlist_songs, realtime_sessions).
    * Configure RLS policies for all tables.
    * Implement Supabase Realtime logic for the active session.
* *Agent Focus:* Debate RLS (Row Level Security) policies to ensure only the 2 users can read/write.

### Phase 3: The Audio Engine (Hybrid: Spotify + YouTube.js) & Media Session API
* **Goal:** Build the core audio logic with hybrid metadata/audio approach, state management, and OS integration.
* **Tasks:**
    * Create a global state using **Zustand** (`currentSong`, `isPlaying`, `queue`).
    * Integrate **Spotify Web API** for search, browse, and metadata (covers, popular songs).
    * Integrate **YouTube.js** (or Piped API) to match song titles and extract audio stream URLs (Opus/AAC).
    * Build a **Vercel Serverless proxy** (`/api/stream`) to handle CORS for audio streams.
    * Implement **Media Session API**: Sync metadata (title, artist, artwork) so OS lock-screen controls work and map them to Zustand actions.
* *Agent Focus:* Hybrid matching accuracy (Spotify title → YouTube match), CORS proxy, mobile autoplay policies, `<audio>` lifecycle.

### Phase 4: Local Caching & PWA (Offline Mode)
* **Goal:** Make the app installable on mobile and cache songs for stutter-free playback.
* **Tasks:**
    * Configure `vite-plugin-pwa` for manifest and Service Worker.
    * Implement an "Add to Cache" (Download) button.
    * Use IndexedDB (`localforage`) to store audio Blobs locally.
    * Logic: Check IndexedDB first; play local Blob if found, else fetch the stream from the network.
* *Agent Focus:* Mobile storage limits, blob URL memory management, and providing UI to clear cache.

### Phase 5: UI / UX & Playlists
* **Goal:** Build the interface (player bar, search, library).
* **Tasks:**
    * Build the Player Bar (Play, Pause, Next, Prev, Progress Bar).
    * Build Search page (querying YouTube Music via our API choice).
    * Build Playlist management UI (CRUD synced to Supabase).
    * Add the "Partner's Status" widget (shows what the GF is listening to via Supabase Realtime).
* *Agent Focus:* Mobile-first, responsive design with large touch targets. Ensure smooth animations.

### Phase 6: Final Polish & Testing
* **Goal:** Bug fixing and performance optimization.
* **Tasks:**
    * Test background play on mobile (iOS/Android) with the screen locked.
    * Test PWA offline capabilities.
    * Final UI/UX design tweaks.
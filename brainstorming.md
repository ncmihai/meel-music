# MeelMusic — Brainstorming & Decizii 🧠

> Document viu. Deciziile luate sunt marcate cu ✅.
> Discuțiile noi și propunerile viitoare rămân deschise.

---

## ✅ DECIZII LUATE

### 1. ~~Lipsea tabelul `liked_songs`~~ → REZOLVAT
**Decizie:** Tabel separat `liked_songs` cu `UNIQUE(user_id, song_id)`.
Avantaj: poți vedea liked songs indiferent de playlist-ul în care se află.

### 2. ~~Cine inserează în `songs_metadata`~~ → REZOLVAT
**Decizie:** Opțiunea B — **upsert la save** (când dai like sau adaugi în playlist).
Se folosește `ON CONFLICT DO NOTHING` pentru a evita duplicarea.

### 3. ~~CORS cu Piped/YouTube.js~~ → REZOLVAT
**Decizie:** **Vercel Serverless proxy** (`/api/stream`) care preia stream URL-ul server-side.
Clientul primește URL-ul proxied, fără probleme de CORS.

### 4. ~~Hi-Fi API pentru Lossless~~ → ELIMINAT
**Decizie:** Fără Lossless. Folosim doar YouTube.js/Piped (Opus/AAC).
**NOU:** Adăugăm **Spotify Web API** pentru metadata:
- Abordare **hibridă**: UI arată date de la Spotify (covers, titluri, popular tracks) → audio vine de la YouTube.js
- Client Credentials Flow (nu necesită login Spotify de la user)

### 5. ~~`progress_ms` în `realtime_sessions`~~ → ELIMINAT
**Decizie:** Partenerul vede doar "ascultă X" — fără sync de progress bar.
Simplificăm tabelul: eliminate `progress_ms`.

### 6. ~~Vercel Serverless limits~~ → REZOLVAT
**Decizie:** Proxy-ăm doar URL-ul stream-ului (text mic), nu conținutul audio.

### 7. ~~`is_shared` pe playlists~~ → ÎNLOCUIT
**Decizie:** Tabel `playlist_collaborators` în loc de câmpul `is_shared`.
Mai flexibil (scalable dacă adaugi mai mulți useri în viitor) și mai curat în RLS.

### 8. ~~Error Handling~~ → REZOLVAT
**Decizie:** `react-hot-toast` pentru notificări non-intrusive.

### 9. ~~Listening history~~ → REZOLVAT
**Decizie:** Stocare locală (localStorage). Nu merită un tabel Supabase pentru asta acum.

### 10. ~~Playlist covers~~ → REZOLVAT
**Decizie:** Folosim Spotify Web API pentru cover-uri HD ale albumelor.
Bonus: auto-generăm cover din primele 4 melodii (grid 2x2) ca fallback.

---

## 🆕 DISCUȚII DESCHISE

### Multi-device sync (desktop + mobil, același user)

**Problema:** Dacă tu ești logat pe mobil ȘI pe desktop, ambele instanțe scriu în `realtime_sessions` pentru același `user_id`. Ce se întâmplă?

**Opțiuni:**

| Abordare | Cum funcționează | Pro | Contra |
|----------|-----------------|-----|--------|
| **A. Last-write-wins** | Ultimul device care face acțiune (play/pause/next) suprascrie rândul. Celălalt device e "pasiv". | Super simplu, 0 cod extra | Dacă dai play pe ambele simultan, flickering pe widget-ul partenerului |
| **B. Device registration** | Adaugi `device_id` în `realtime_sessions`. Fiecare device are propriul rând. Partenerul vede ultimul activ. | Accurate, fără flickering | Mai complex (trebuie generat device_id, cleanup la disconnect) |
| **C. Spotify-style "handoff"** | Când deschizi pe alt device, un toast: "Playing on Desktop — Transfer here?" | UX elegant | Mult mai complex de implementat |

**Recomandarea mea:** Începe cu **A (last-write-wins)** — e simplu și funcționează bine dacă nu redai pe 2 device-uri simultan (ceea ce oricum nu ai de ce să faci). Dacă apare flickering în practică, upgradem la B.

---

### Abordarea hibridă — potențiale capcane

> [!WARNING]
> **Match accuracy:** Când cauți "Song Title - Artist" pe YouTube, nu primești întotdeauna rezultatul corect.
> Poți primi: live versions, remixuri, covers, lyric videos cu audio diferit, etc.

**Strategii de matching (le vom implementa în task 5.5):**
1. **Compară durata**: Spotify returnează `duration_ms`. YouTube returnează durata. Diferența trebuie < 10 secunde.
2. **Filtrează**: Exclude rezultate cu "live", "remix", "cover", "karaoke" din titlu (dacă originalul nu le are).
3. **Prioritizează canale oficiale**: Dacă YouTube returnează un rezultat de pe canalul oficial al artistului, preferă-l.
4. **Fallback**: Dacă niciun match nu e bun, afișează "Cannot play this song" în loc să redai ceva greșit.

---

### Spotify API — limitări de știut

> [!NOTE]
> **Client Credentials Flow** (ce folosim noi) NU îți dă acces la:
> - Biblioteca personală a userului
> - Playback control
> - Playlists private
>
> Dar ÎȚI DĂ acces la:
> - ✅ Search (tracks, albums, artists)
> - ✅ Browse (new releases, categories)
> - ✅ Track/album metadata (covers, duration, popularity)
> - ✅ Artist info + top tracks
>
> Asta e **exact** ce ne trebuie. Nu vrem să controlăm Spotify playback — vrem doar metadata.

**Rate limiting:** 
- ~180 requests/minut pe Client Credentials
- Implementăm caching (dacă am căutat "Dua Lipa" acum 5 min, servim din cache)

---

### Vercel Serverless proxy — implementare detaliată

```
Flow:
1. User dă click "Play" pe o melodie
2. Frontend trimite: GET /api/stream?title=Song&artist=Artist
3. Vercel function:
   a. Caută pe YouTube.js: "Song Artist" 
   b. Extrage audio stream URL (best quality Opus/AAC)
   c. Returnează: { streamUrl, duration, format }
4. Frontend setează streamUrl pe <audio src="...">
5. Browser-ul streamează direct de la YouTube CDN
```

> [!IMPORTANT]
> **Nu proxy-ăm conținutul audio** prin Vercel (ar depăși bandwidth-ul).
> Proxy-ăm doar **cererea de rezolvare** a stream URL-ului, care e text mic (~1KB).

---

### DE CE A EȘUAT YOUTUBE IFRAME (Black Screen Issue) ❌

Am încercat să folosim un player YouTube invizibil (`react-youtube`) pentru a ocoli blocurile Piped/Invidious.
**Problema:** Browser-ele moderne (în special Safari și Chrome pe anumite extensii/setări) blochează redarea auto-play din iframe-uri dacă acestea sunt:
1. `display: none`
2. `opacity: 0`
3. Nu sunt vizibile complet pe ecran.
Acest lucru împiedică declanșarea API-ului YouTube și lasă interfața blocată la `0:00` cu un ecran negru (sau fără sunet deloc pe client).

### ABORDAREA NOUĂ: API-uri Neoficiale JioSaavn ✅ (Recomandare viitoare)

Pentru a oferi melodii complete (nu doar cele 30s de la iTunes) FĂRĂ iframe-uri și FĂRĂ proxy-uri YouTube blocate de Cloudflare:
**Soluția optimă:** Folosirea unor instanțe publice de **JioSaavn API** (ex. `jiosaavn-api-privatecvc2.vercel.app`).
*   **Pro:** Returnează direct link-uri `.mp4` / `.m4a` cu calitate de până la 320kbps.
*   **Pro:** Putem reveni la folosirea simplă și elegantă a `<audio>`-ului nativ HTML5 (`AudioPlayer.tsx` simplificat din nou).
*   **Pro:** Fără blocaje de Cloudflare, fără probleme de focus iframe. Perfect pentru o aplicație de muzică (Spotify Clone).

---

## 💡 IDEI VIITOARE (post-launch)

- [ ] **Shared queue** — ambii useri contribuie la aceeași coadă (ca o petrecere)
- [ ] **Song recommendations** — bazate pe liked songs (Spotify recommendations API)
- [ ] **Lyrics** — afișare versuri sincronizate (Musixmatch API sau similar)
- [ ] **Equalizer** — Web Audio API pentru bass boost, etc.
- [ ] **Import playlists** — import un playlist Spotify existent
- [ ] **Dark/Light theme toggle**

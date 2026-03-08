# Story 3.1: Service Worker & Offline Play

Status: ready-for-dev

## Story

As a player,
I want to play ch3ss without an internet connection,
So that I can play in the subway, on a plane, or anywhere without network.

## Acceptance Criteria

1. After loading ch3ss once with network, the app loads fully and gameplay works identically offline (FR19, NFR12)
2. Stockfish WASM binary, app shell, and all assets are served from Service Worker cache when offline (FR21)
3. vite-plugin-pwa is configured with Workbox to generate a Service Worker that precaches app shell and WASM binary
4. Cached app loads in <1 second on subsequent visits (NFR4)
5. Initial app load (including Service Worker registration and caching) completes in <3 seconds on 4G (NFR3)
6. Service Worker updates automatically when new version is deployed (`registerType: 'autoUpdate'`)

## Tasks / Subtasks

- [ ] Task 1: Install vite-plugin-pwa (AC: #3)
  - [ ] Run `npm install -D vite-plugin-pwa`
  - [ ] Verify vite-plugin-pwa v1.x is installed (compatible with Vite 6.x)
- [ ] Task 2: Configure vite-plugin-pwa in vite.config.ts (AC: #2, #3)
  - [ ] Add `VitePWA` plugin to Vite config:
    ```typescript
    import { VitePWA } from 'vite-plugin-pwa'

    // Inside plugins array:
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        maximumFileSizeToCacheInBytes: 5_000_000, // 5MB — Stockfish WASM is ~2-4MB
      },
    })
    ```
  - [ ] Ensure `globPatterns` includes `.wasm` files — Stockfish WASM is NOT auto-cached by default
  - [ ] Set `maximumFileSizeToCacheInBytes` to at least 5MB (Stockfish WASM is ~2-4MB, default Workbox limit is 2MB)
- [ ] Task 3: Register Service Worker in app (AC: #6)
  - [ ] In `src/main.tsx`, add SW registration:
    ```typescript
    import { registerSW } from 'virtual:pwa-register'

    registerSW({
      onOfflineReady() {
        console.log('ch3ss ready for offline play')
      },
    })
    ```
  - [ ] Add type declaration if needed — vite-plugin-pwa provides `virtual:pwa-register` types automatically via `vite-plugin-pwa/client`
  - [ ] Ensure `src/vite-env.d.ts` includes: `/// <reference types="vite-plugin-pwa/client" />`
- [ ] Task 4: Verify Stockfish WASM caching (AC: #2)
  - [ ] Confirm Stockfish WASM binary location in the build output (`dist/`)
  - [ ] Verify the WASM file is included in the Workbox precache manifest after build
  - [ ] If the Stockfish npm package loads WASM from a CDN or different origin, configure runtime caching:
    ```typescript
    runtimeCaching: [{
      urlPattern: /\.wasm$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'wasm-cache',
        expiration: { maxEntries: 5 },
      },
    }]
    ```
- [ ] Task 5: Verify chess piece SVG caching (AC: #2)
  - [ ] Confirm `public/pieces/*.svg` files are included in precache via `globPatterns`
  - [ ] Confirm `public/icons/*.png` PWA icons are included
- [ ] Task 6: Build and verify offline functionality (AC: #1, #4, #5)
  - [ ] Run `npm run build` and verify SW is generated in `dist/`
  - [ ] Serve production build locally (`npx serve dist` or `npm run preview`)
  - [ ] Load app in browser, verify SW registers and caches assets
  - [ ] Go offline (DevTools > Network > Offline) and reload — app must load and function
  - [ ] Play a complete game offline — Stockfish works, moves execute, game ends correctly
- [ ] Task 7: Write tests (AC: all)
  - [ ] Test: vite.config.ts includes VitePWA plugin configuration
  - [ ] Test: build output includes service-worker.js or sw.js
  - [ ] Test: Workbox precache manifest includes .wasm files

## Dev Notes

### Architecture Compliance

- **vite-plugin-pwa** with `generateSW` strategy — Workbox generates the Service Worker automatically, no custom SW code needed
- **`registerType: 'autoUpdate'`** — SW updates silently without user prompt (appropriate for a game)
- **Precache strategy** — all static assets (JS, CSS, HTML, WASM, SVG, PNG) are precached on first visit
- **No runtime caching needed** unless Stockfish WASM loads from a different origin

### Critical: WASM File Caching

The Stockfish npm package (`stockfish` v18.0.5) bundles the WASM binary. During build, Vite may:
1. Copy the WASM to `dist/assets/` (if imported via Vite) — precached via `globPatterns`
2. Load from `node_modules` at runtime — requires `runtimeCaching` config

Verify which path Stockfish uses in the existing `stockfish.worker.ts` (Story 1.2) and configure caching accordingly. The **most likely** scenario is that the WASM file ends up in `dist/` via Vite's asset handling, making precaching sufficient.

### Key Dependency: Stories 1.2 (Stockfish Worker)

The Service Worker must not interfere with the Web Worker (Stockfish). These are separate browser APIs:
- **Service Worker** = network proxy, intercepts fetch requests, manages cache
- **Web Worker** = background thread running Stockfish

They do not conflict. The Service Worker caches the WASM file; the Web Worker loads it from cache transparently.

### Performance Budget (NFR3, NFR4)

- **Initial load (4G)**: <3 seconds. The Service Worker registration and precaching happen asynchronously after first render — they do NOT block the initial load.
- **Subsequent load (cached)**: <1 second. All assets served from SW cache, no network requests.

### File Structure Impact

- **Modifies**: `vite.config.ts` (add VitePWA plugin), `src/main.tsx` (add SW registration), `src/vite-env.d.ts` (add type reference)
- **No new component files** — PWA config is infrastructure, not UI
- **Depends on**: Story 1.1 (project foundation), Story 1.2 (Stockfish WASM binary exists)

### Project Structure Notes

- Alignment: vite.config.ts already exists from Story 1.1. VitePWA is added as another plugin in the existing plugins array.
- No new directories created — Service Worker is auto-generated in `dist/` during build.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment — vite-plugin-pwa]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure — vite.config.ts]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1]
- [Source: _bmad-output/planning-artifacts/prd.md#FR19, FR21, NFR3, NFR4, NFR12]
- [Source: vite-plugin-pwa docs — registerType, workbox config, WASM caching]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

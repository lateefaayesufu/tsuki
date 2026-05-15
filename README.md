# 月夜 · Tsukiyo

### A moonlit Japanese inn you can't stop thinking about.

**Live URL:** [your-deployment-url.vercel.app]
**GitHub:** [your-repo-url]

---

## Concept

月夜 (Tsukiyo — "moonlit night") is not a portfolio. It's a place.

The visitor arrives at night, outside a Japanese inn. They watch the scene materialise from white mist — a darkroom develop effect. They push open the gate, walk forward into the building, part the noren curtain, and step inside. Every section of the portfolio is a different room of the inn. They navigate laterally — not scrolling up and down, but moving between rooms. At the end, the camera walks back outside. The inn shrinks behind them. The moon is low. The night is ending.

The premise: your portfolio as a world. A moonlit inn, a tasting menu, a living newspaper. The visitor doesn't just see your work. They experience a place.

---

## Setup

```bash
git clone [repo-url]
cd tsukiyo
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm run preview    # preview production build
```

**Deployment:** Push to GitHub → connect to Vercel → auto-deploys via `@sveltejs/adapter-auto`

---

## Architecture

```
src/
├── app.css                          # Global design tokens, keyframes
├── app.html                         # HTML shell, Google Fonts
├── lib/
│   ├── stores/
│   │   └── state.js                 # Central reactive store (Svelte stores)
│   └── components/
│       ├── scene/                   # Canvas-based visual components
│       │   ├── Moon.svelte          # Phasing moon with tweened animations
│       │   ├── Cat.svelte           # Behavior state machine (alert/idle/lying)
│       │   ├── Lantern.svelte       # Wind-reactive, per-instance physics
│       │   ├── Rain.svelte          # Canvas rain with wind angle
│       │   └── Fireflies.svelte     # Idle-triggered particle system
│       ├── ui/                      # Interface components
│       │   ├── Cursor.svelte        # Lerp-smoothed custom cursor (4 states)
│       │   ├── BrushStroke.svelte   # Calligraphy brush canvas transition
│       │   ├── Noren.svelte         # CSS 3D fabric curtain
│       │   ├── OmakaseMenu.svelte   # Folded paper omakase navigation
│       │   ├── Vinyl.svelte         # Animated record player
│       │   └── GuestBook.svelte     # Persistent word collection
│       └── rooms/                   # The five sections of the inn
│           ├── RoomJo.svelte        # Prelude — who I am
│           ├── RoomZensai.svelte    # Newspaper — my story
│           ├── RoomTsukuri.svelte   # Corkboard — projects
│           ├── RoomOrizuru.svelte  # Classifieds — draggable skills
│           └── RoomMizugashi.svelte # Writing desk — contact
└── routes/
    ├── +layout.svelte               # Root layout
    └── +page.svelte                 # Main orchestrator (1,000 lines of intent)
```

### State Management

All shared state lives in `src/lib/stores/state.js` as Svelte writable/derived stores:

- `phase` — entry | walking | inside | secret | closing
- `room` — 0–4 (current room index)
- `moonPhase` — derived from room, drives moon size/brightness/glow
- `weather` — persisted to localStorage, fixed per visitor
- `idleSeconds` — drives firefly spawning and cat behavior
- `windStrength` — driven by scroll velocity, affects rain angle and lanterns
- `haikuFound` — tracks discovery of the three hidden haiku fragments

---

## Animation Decisions

**Darkroom develop entry** — The name starts at `opacity:0; filter:blur(22px)` and transitions over 2.8s. The white mist overlay fades simultaneously. The effect simulates a photograph developing in chemical baths. The wait is the experience.

**Camera walk-in** — Parallax layers (sky / distant / inn / foreground) scale independently at different rates using CSS transforms, simulating a camera moving forward. The noren curtain opens with CSS `rotateY` perspective transforms creating a 3D fold.

**Brush stroke transitions** — Between rooms, a Canvas path sweeps horizontally with a thick, slightly wobbly bezier curve. The stroke width scales to viewport height, creating a calligraphy brush effect. Callback fires at completion; stroke then fades out.

**Moon phasing** — The moon size, brightness, glow radius and glow opacity are all `tweened` Svelte stores derived from the current room index. Changes are smooth 2-second interpolations.

**Condensation wipe** — The corkboard projects are hidden behind a Canvas overlay filled with a translucent blue-grey. `destination-out` composite operation carves out a radial gradient at cursor position. After 2.5s of stillness, a slow `source-over` fill gradually re-fogs the surface.

**Firefly system** — Each firefly has sinusoidal pulse opacity, mouse-repulsion physics, wall bounce, and a lifespan with fade-in/fade-out. Spawning is triggered by idle seconds to reward patient visitors.

**Cat state machine** — 5 states: `watching`, `alert`, `idle`, `lying`, `yawning`. State driven by cursor velocity and idle timer. Eye pupils track cursor via `atan2` with bounded offset. Random yawn scheduled at 12–32 second intervals when idle.

**Draggable physics** — Skills are absolutely positioned elements with mouse drag, release velocity capture, and a custom bounce simulation with per-skill mass values. Heavy skills (SvelteKit, React) bounce less and settle faster.

**Tide line** — Animates via `requestAnimationFrame` using a sinusoidal path. Wave height driven by `moonPhase` store — new moon = flat, full moon = generous swell.

---

## Performance Optimization

- All canvas animations run in single `requestAnimationFrame` loops — never stacked
- Parallax uses `will-change: transform` to promote layers to GPU
- Rain, firefly, and koi canvases are separate elements — clears only their own rect
- Room components mount/unmount with `{#if}` — no hidden DOM accumulation
- Google Fonts loaded with `display=swap` — no render blocking
- `tweened` stores batch DOM updates through Svelte's scheduler
- Images: none. Every visual is SVG or Canvas — zero image HTTP requests
- Svelte's compiler eliminates dead code per component — bundle is ~58KB gzipped

---

## Accessibility

- Custom cursor disabled on mobile (`display:none` via media query, `cursor:auto` on body)
- All interactive elements have `aria-label` attributes
- Keyboard navigation: `←/→` or `A/D` keys between rooms, `Escape` closes modals
- Room navigation arrows, omakase menu items, and guest book all keyboard-accessible
- `tabindex="-1"` on modal overlays for focus management
- Haiku fragments have `aria-label="Discover hidden text"` — screen readers won't give away the game
- Semantic HTML throughout: `<button>`, `<nav>`, `<a>`, `<dialog>` roles
- Motion: the breath animation is subtle enough to be safe; full `prefers-reduced-motion` support can be added via a store check (noted as future enhancement)

---

## Trade-offs

**Audio:** The vinyl record UI is complete but actual audio playback is not wired — this requires a hosted audio file and user gesture handling. The `musicPlaying` store is ready; connect Howler.js to it.

**Supabase guest book:** Currently persists to `localStorage` only. Connecting Supabase gives real shared guest words across visitors. Schema: `{ id, word, created_at }`. Replace the `guestWords` store subscription with a Supabase realtime listener.

**Ink-wash portrait:** The portrait in the Jo room is an SVG placeholder. The concept calls for a canvas-drawn portrait that redraws itself on each visit with slightly different stroke order. This would use a pre-defined set of bezier control points with randomised interpolation.

**Per-phase music arrangement:** Concept calls for different musical layers per moon phase. Would implement with Howler.js spatial audio and per-track volume driven by `moonPhase` store.

**Mobile:** Layout adapts — cursors hidden, arrows hidden, dots hidden. Room content scrolls. The parallax scene still renders. Full mobile gesture support (swipe between rooms) is the next build priority.

---

## The Hidden Things

There are three things in this portfolio most people will never find:

1. **The reverse section** — scroll backward past the Jo room. The cat disappears from the roof.
2. **The haiku** — three fragments scattered across three rooms in near-invisible ink. Click each to reveal. When all three are found, the complete poem appears and three fireflies rise.
3. **The fireflies** — sit completely still for 8 seconds in the Jo room. Then 14 seconds. Then 20. Patience is rewarded.

The portfolio remembers your weather. If it rained when you first visited, it always rains.

---

_Built with SvelteKit · Canvas API · CSS physics · Svelte stores · Pure intent._

_月夜 — lee Yousuf — 2026_

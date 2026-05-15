<script>
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import '../app.css';

  import {
    phase, room, weather, idleSeconds, windStrength, scrollVel,
    haikuFound, moonPhase, isInside, mx, my,
    goToRoom, ROOM_NAMES
  } from '$lib/stores/state.js';

  import Moon      from '$lib/components/scene/Moon.svelte';
  import Cat       from '$lib/components/scene/Cat.svelte';
  import Lantern   from '$lib/components/scene/Lantern.svelte';
  import Rain      from '$lib/components/scene/Rain.svelte';
  import Fireflies from '$lib/components/scene/Fireflies.svelte';

  import BrushStroke     from '$lib/components/ui/BrushStroke.svelte';
  import Noren           from '$lib/components/ui/Noren.svelte';
  import OmakaseMenu     from '$lib/components/ui/OmakaseMenu.svelte';
  import Vinyl           from '$lib/components/ui/Vinyl.svelte';
  import GuestBook       from '$lib/components/ui/GuestBook.svelte';
  import GhostFootprints from '$lib/components/scene/GhostFootprints.svelte';
  import AudioEngine     from '$lib/components/ui/AudioEngine.svelte';

  import { initPresence, updatePresenceRoom, destroyPresence } from '$lib/stores/presence.js';


  import RoomJo from '$lib/components/rooms/RoomJo.svelte';
  let RoomZensai, RoomTsukuri, RoomYakimono, RoomOrizuru;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const STAR_COUNT = isMobile ? 60 : 200;

  let entryStage = 0;
  let curtainOpen = false;
  let nameRevealed = false;
  let tagRevealed  = false;
  let ctaRevealed  = false;

  let brushStroke;
  let norenOpen         = false;
  let showSecret        = false;
  let showClosing       = false;
  let showHaikuComplete = false;
  let scrollHintVisible = false;
  let scrollCooldown    = false;
  let lanternLit        = [true, true, true];
  let idleInterval;
  let itineraryVisible  = false;

  $: swayFactor = Math.min($windStrength / 8, 1);

  
  let rawPx = 0, rawPy = 0;
  let px = 0, py = 0;
  let parallaxRAF;

  function onMouseMove(e) {
    resetIdle();
    if (isMobile) return;
    rawPx = (e.clientX / window.innerWidth)  - 0.5;
    rawPy = (e.clientY / window.innerHeight) - 0.5;
    mx.set(e.clientX);
    my.set(e.clientY);
  }

 
  let tidePath = '';
  let tideOffset = 0;
  let tideRAF;
  let tideLastTime = 0;

  function animTide(ts = 0) {
    if (ts - tideLastTime > 50) {  
      tideLastTime = ts;
      tideOffset += 0.018;
      const h = $moonPhase * 14;
      const w = 1440;
      let d = `M0,${20 - h}`;
      for (let x = 0; x <= w; x += 72) { 
        const y = 20 - h + Math.sin(x / 110 + tideOffset) * h * 0.55;
        d += ` L${x},${y}`;
      }
      d += ` L${w},20 L0,20 Z`;
      tidePath = d;
    }
    tideRAF = requestAnimationFrame(animTide);
  }

  onMount(() => {
    setTimeout(() => { curtainOpen = true; entryStage = 1; }, 600);
    setTimeout(() => { nameRevealed = true; entryStage = 2; }, 2200);
    setTimeout(() => { tagRevealed  = true; }, 3200);
    setTimeout(() => { ctaRevealed  = true; entryStage = 3; }, 4400);

    idleInterval = setInterval(() => { idleSeconds.update(s => s + 1); }, 1000);
    initPresence(0);
    if ($weather === 'wind') windStrength.set(3);

    const hr = new Date().getHours();
    if (hr >= 6  && hr < 9)  document.documentElement.style.setProperty('--sky', '#1f2e50');
    if (hr >= 9  && hr < 17) document.documentElement.style.setProperty('--sky', '#141e38');
    if (hr >= 17 && hr < 21) document.documentElement.style.setProperty('--sky', '#1a2744');

   
    if (!isMobile) {
      function lerpParallax() {
        px += (rawPx - px) * 0.06;
        py += (rawPy - py) * 0.06;
        parallaxRAF = requestAnimationFrame(lerpParallax);
      }
      parallaxRAF = requestAnimationFrame(lerpParallax);
    }

    tideRAF = requestAnimationFrame(animTide);
let starRAF;

const canvas = document.getElementById('star-canvas');
if (canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const isMob = window.innerWidth < 768;
  const COUNT = isMob ? 80 : 200;

  const stars = Array.from({ length: COUNT }, (_, i) => ({
    x: (i * 7.7) % canvas.width,
    y: Math.sin(i * 1.61) * 0.4 * canvas.height + 0.3 * canvas.height,
    r: 0.4 + (i % 3) * 0.55,
    base: 0.3 + (i % 4) * 0.18,
    phase: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 1.2,
    hero: false,
  }));

  const heroes = [
    [0.22,0.12,3],[0.55,0.08,2.5],[0.78,0.18,2.8],
    [0.38,0.06,2],[0.90,0.22,2.4],[0.08,0.05,2.2],
  ].map(([lx,ty,sz]) => ({
    x: lx*canvas.width, y: ty*canvas.height,
    r: sz, base: 0.95, phase: Math.random()*Math.PI*2,
    speed: 0.3+Math.random()*0.5, hero: true, glow: sz*3,
  }));

  const all = [...stars, ...heroes];
let t = 0;
  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.016;
    for (const s of all) {
      const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
      const op = s.base * (s.hero ? (0.6 + 0.4 * twinkle) : twinkle);
      if (s.hero) {
        const g = ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.glow);
        g.addColorStop(0, `rgba(255,255,255,${op*0.4})`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(s.x,s.y,s.glow,0,Math.PI*2);
        ctx.fillStyle = g; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${op})`; ctx.fill();
    }
    starRAF = requestAnimationFrame(drawStars);
  }
  drawStars();

 
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

 return () => {
  clearInterval(idleInterval);
  destroyPresence();
  cancelAnimationFrame(parallaxRAF);
  cancelAnimationFrame(tideRAF);
  cancelAnimationFrame(starRAF);
};
  });

  function resetIdle() { idleSeconds.set(0); }

 
  async function enterInn() {
    phase.set('walking');
    norenOpen = true;

    Promise.all([
      import('$lib/components/rooms/RoomZensai.svelte'),
      import('$lib/components/rooms/RoomTsukuri.svelte'),
      import('$lib/components/rooms/RoomYakimono.svelte'),
      import('$lib/components/rooms/RoomOrizuru.svelte'),
    ]).then(([z, t, y, o]) => {
      RoomZensai   = z.default;
      RoomTsukuri  = t.default;
      RoomYakimono = y.default;
      RoomOrizuru  = o.default;
    });

    setTimeout(() => {
      phase.set('inside');
      norenOpen = false;
      goToRoom(0, false);
      itineraryVisible = true;
      scrollHintVisible = true;
      setTimeout(() => { scrollHintVisible = false; }, 5000);
    }, 1800);
  }

  function navigate(dir) {
    if (!$isInside || scrollCooldown) return;
    const next = $room + dir;
    if (dir < 0 && $room === 0) { triggerSecret(); return; }
    if (next < 0 || next >= ROOM_NAMES.length) return;
    scrollCooldown = true;
    setTimeout(() => { scrollCooldown = false; }, 750);
    windStrength.set(Math.min(Math.abs(dir) * 3, 8));
    setTimeout(() => windStrength.set(0), 900);
    if (brushStroke) {
      brushStroke.sweep(() => { goToRoom(next, true); updatePresenceRoom(next); });
    } else {
      goToRoom(next, true);
      updatePresenceRoom(next);
    }
  }

  function triggerSecret() {
    showSecret = true;
    setTimeout(() => { showSecret = false; }, 8500);
  }

  function startClosing() {
    showClosing = true;
    setTimeout(() => { lanternLit = [true,  true,  false]; }, 600);
    setTimeout(() => { lanternLit = [false, true,  false]; }, 1600);
    setTimeout(() => { lanternLit = [false, false, false]; }, 2400);
  }

  $: if ($haikuFound.every(Boolean) && !showHaikuComplete) {
    showHaikuComplete = true;
    setTimeout(() => { showHaikuComplete = false; }, 7000);
  }

  function onKeydown(e) {
    resetIdle();
    if (!$isInside) return;
    if (e.target !== document.body) return;
    if (e.key === 'ArrowRight' || e.key === 'd') navigate(1);
    if (e.key === 'ArrowLeft'  || e.key === 'a') navigate(-1);
    if (e.key === 'Escape' && $room === 4) startClosing();
  }
  let touchStartX = 0, touchStartY = 0;
function onTouchStart(e) { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }
function onTouchEnd(e) {
  if (!$isInside || scrollCooldown) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
  navigate(dx < 0 ? 1 : -1);
}

</script>

<svelte:window
  on:keydown={onKeydown}
  on:mousemove={onMouseMove}
  on:touchstart={onTouchStart}
  on:touchend={onTouchEnd}
/>

<Rain />
<GhostFootprints />
<Fireflies />
<BrushStroke bind:this={brushStroke} />
<AudioEngine />

{#if $phase === 'walking' || norenOpen}
  <Noren open={norenOpen} />
{/if}

<!-- ══ SCENE ══ -->
<div class="scene">

  <div class="layer layer-sky" style="transform: translate({px * -18}px, {py * -8}px)">
    <canvas class="star-canvas" id="star-canvas"></canvas>
  </div>

  <Moon />
  <Vinyl />
  <GuestBook />

  <div class="layer layer-distant" style="transform: translate({px * -38}px, {py * -14}px)">
    <svg width="100%" height="100%" viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,500 L0,280 Q180,160 360,240 Q540,180 720,200 Q900,140 1080,220 Q1260,160 1440,240 L1440,500 Z" fill="#162038" opacity="0.85"/>
      <path d="M0,500 L0,320 Q200,240 400,280 Q600,220 800,260 Q1000,200 1200,250 Q1350,220 1440,260 L1440,500 Z" fill="#1a2744" opacity="0.6"/>
      <g transform="translate(680,185)" opacity="0.38">
        <rect x="-62" y="0" width="124" height="9" rx="2" fill="#c0392b"/>
        <rect x="-52" y="9" width="104" height="5" rx="1" fill="#c0392b"/>
        <rect x="-4"  y="14" width="8"  height="82" fill="#c0392b"/>
        <rect x="44"  y="14" width="8"  height="82" fill="#c0392b"/>
      </g>
      <path d="M100,350 L130,200 L160,350 Z" fill="#162038" opacity="0.6"/>
      <path d="M90,300 L130,180 L170,300 Z"  fill="#1a2744" opacity="0.5"/>
    </svg>
  </div>

  <div class="layer layer-inn" style="transform: translate({px * -58}px, {py * -20}px)">
    <svg width="100%" height="100%" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
      <path d="M300,125 L720,38 L1140,125 L1118,146 L720,62 L322,146 Z" fill="#2a2018"/>
      <path d="M322,146 L1118,146 L1118,168 L322,168 Z" fill="#3a2e20"/>
      <rect x="680" y="36" width="80" height="7" rx="2" fill="#4a3a28"/>
      <rect x="350" y="168" width="740" height="380" fill="#221a10"/>
      <g opacity="0.22" stroke="#3a2e20" stroke-width="0.8" fill="none">
        {#each Array(8) as _, i}
          <line x1={350 + i * 92} y1="168" x2={350 + i * 92} y2="548"/>
        {/each}
        {#each Array(5) as _, i}
          <line x1="350" y1={208 + i * 45} x2="1090" y2={208 + i * 45}/>
        {/each}
      </g>
      <rect x="390" y="208" rx="2" width="145" height="200" fill="rgba(245,200,66,0.08)" stroke="rgba(139,105,20,0.4)" stroke-width="2"/>
      <rect x="570" y="208" rx="2" width="82"  height="200" fill="rgba(245,200,66,0.12)" stroke="rgba(139,105,20,0.4)" stroke-width="2"/>
      <rect x="788" y="208" rx="2" width="82"  height="200" fill="rgba(245,200,66,0.1)"  stroke="rgba(139,105,20,0.4)" stroke-width="2"/>
      <rect x="900" y="208" rx="2" width="145" height="200" fill="rgba(245,200,66,0.07)" stroke="rgba(139,105,20,0.4)" stroke-width="2"/>
      <g stroke="rgba(139,105,20,0.18)" stroke-width="0.6" fill="none">
        {#each Array(4) as _, i}
          <line x1={420 + i * 28} y1="208" x2={420 + i * 28} y2="408"/>
        {/each}
        {#each Array(5) as _, i}
          <line x1="390" y1={248 + i * 38} x2="535" y2={248 + i * 38}/>
        {/each}
      </g>
      <rect x="390" y="208" rx="2" width="145" height="200" fill="rgba(245,200,66,{0.04 * $moonPhase})" pointer-events="none"/>
      <rect x="670" y="350" rx="2" width="100" height="198" fill="#120e06" stroke="rgba(139,105,20,0.5)" stroke-width="3"/>
      {#each Array(5) as _, i}
        <rect x={672 + i * 20} y="338" width="14" height="14" rx="1" fill="rgba(192,57,43,{0.5 + (i % 2) * 0.15})"/>
      {/each}
      <path d="M318,162 Q720,124 1122,162 L1132,174 L308,174 Z" fill="#3a2e20"/>
      <rect x="638" y="546" rx="1" width="164" height="13" fill="#3a2e20"/>
      <rect x="626" y="556" rx="1" width="188" height="10" fill="#2a2018"/>
    </svg>

    <div class="lantern-pos" style="left:36%;top:28%">
      <Lantern duration="3.2s" delay="0s" lit={lanternLit[0]}/>
    </div>
    <div class="lantern-pos" style="right:34%;top:26%">
      <Lantern duration="3.8s" delay="0.6s" lit={lanternLit[1]}/>
    </div>
    <div class="lantern-pos" style="left:20%;top:34%">
      <Lantern duration="4.2s" delay="1.1s" lit={lanternLit[2]} size={0.8}/>
    </div>
    <Cat />
  </div>

  <div class="layer layer-fg" style="transform: translate({px * -82}px, {py * -26}px)">
    <svg width="100%" height="100%" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="82" width="1440" height="118" fill="#1a1208"/>
      {#each [{ cx:720,cy:128,rx:32,ry:13 },{ cx:720,cy:107,rx:26,ry:11 },{ cx:718,cy:88,rx:21,ry:9 }] as s}
        <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill="#2a2018" stroke="#3a2e20" stroke-width="1"/>
      {/each}
      <ellipse cx="1100" cy="138" rx="84" ry="42" fill="#162038" stroke="rgba(139,105,20,0.28)" stroke-width="2"/>
      <ellipse cx="1100" cy="138" rx="74" ry="36" fill="rgba(18,38,68,0.85)"/>
      <rect x="618" y="44" width="13" height="100" rx="2" fill="#2a2018"/>
      <rect x="809" y="44" width="13" height="100" rx="2" fill="#2a2018"/>
      <rect x="616" y="52" width="208" height="9"  rx="2" fill="#2a2018"/>
      <rect x="622" y="50" width="196" height="5"  rx="1" fill="#3a2e20"/>
    </svg>
    <div class="bamboo">
      {#each [
        { x:14,h:290,d:3.1,dd:0.0 },{ x:44,h:330,d:3.7,dd:0.3 },
        { x:74,h:268,d:4.2,dd:0.7 },{ x:106,h:308,d:3.5,dd:0.1 },
        { x:138,h:285,d:3.9,dd:0.5 },{ x:166,h:248,d:4.5,dd:0.9 },
      ] as b}
        <div class="stalk" style="left:{b.x}px;height:{b.h}px;animation-duration:{Math.max(0.8, b.d - swayFactor*2)}s;animation-delay:{b.dd}s">
          <div class="leaf l1" style="animation-duration:{b.d+0.5}s"></div>
          <div class="leaf l2" style="animation-duration:{b.d+1.1}s"></div>
        </div>
      {/each}
    </div>
  </div>
</div>


{#if $phase === 'entry'}
<div class="curtains" class:open={curtainOpen}>
  <div class="curtain curtain-left">
    <div class="curtain-fabric">
      {#each Array(6) as _, i}<div class="fold" style="left:{i * 16.6}%"></div>{/each}
      <div class="fringe">
        {#each Array(14) as _, i}<div class="tassel" style="animation-delay:{i*0.07}s"></div>{/each}
      </div>
    </div>
    <div class="rod"></div>
  </div>
  <div class="curtain curtain-right">
    <div class="curtain-fabric">
      {#each Array(6) as _, i}<div class="fold" style="right:{i * 16.6}%"></div>{/each}
      <div class="fringe">
        {#each Array(14) as _, i}<div class="tassel" style="animation-delay:{i*0.07}s"></div>{/each}
      </div>
    </div>
    <div class="rod"></div>
  </div>
  <div class="valance">
    <div class="valance-text">月夜</div>
  </div>
  <div class="entry-overlay">
    <div class="entry-name" class:revealed={nameRevealed}>lee yousuf</div>
  <div class="entry-tag"  class:revealed={tagRevealed}>electrical + aerospace engineer· maker of worlds</div>
    <button class="entry-cta" class:revealed={ctaRevealed} on:click={enterInn} aria-label="Enter">push open the gate →</button>
  </div>
</div>
{/if}

{#if $isInside}
<div class="inside-overlay" transition:fade={{ duration: 800 }}>
  <div class="shoji-bg"></div>
  <div class="shoji-screens">
    {#each Array(32) as _}<div class="shoji-cell"></div>{/each}
  </div>
</div>
{/if}

{#if $isInside}
<div class="rooms-wrap" id="main-content">
  {#if $room === 0}<div class="room-panel" transition:fade={{ duration: 500 }}><RoomJo /></div>{/if}
  {#if $room === 1 && RoomZensai}<div class="room-panel" transition:fade={{ duration: 500 }}><svelte:component this={RoomZensai} /></div>{/if}
  {#if $room === 2 && RoomTsukuri}<div class="room-panel" transition:fade={{ duration: 500 }}><svelte:component this={RoomTsukuri} /></div>{/if}
  {#if $room === 3 && RoomYakimono}<div class="room-panel" transition:fade={{ duration: 500 }}><svelte:component this={RoomYakimono} /></div>{/if}
  {#if $room === 4 && RoomOrizuru}<div class="room-panel" transition:fade={{ duration: 500 }}><svelte:component this={RoomOrizuru} /></div>{/if}
</div>
{/if}

<OmakaseMenu />

{#if $isInside}
<button class="arrow arrow-left"  class:visible={$room > 0}                     on:click={() => navigate(-1)} aria-label="Previous room">‹</button>
<button class="arrow arrow-right" class:visible={$room < ROOM_NAMES.length - 1} on:click={() => navigate(1)}  aria-label="Next room">›</button>

{#if scrollHintVisible}
<div class="scroll-hint" transition:fade>← → navigate rooms · scroll to move</div>
{/if}

<div class="room-dots" aria-label="Room indicator">
  {#each ROOM_NAMES as _, i}
    <button class="dot" class:active={$room === i}
      on:click={() => { if (brushStroke) brushStroke.sweep(() => goToRoom(i)); else goToRoom(i); }}
      aria-label="Go to room {i + 1}"></button>
  {/each}
</div>
{/if}

<!-- Tide -->
<div class="tide-line">
  <svg viewBox="0 0 1440 20" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d={tidePath} stroke="rgba(139,105,20,0.35)" stroke-width="1" fill="rgba(139,105,20,0.04)"/>
  </svg>
</div>

<!-- Secret -->
{#if showSecret}
<div class="secret" transition:fade={{ duration: 800 }}>
  <div class="secret-moon"></div>
  <p class="secret-text">
    You went the wrong way.<br/>Most people don't.<br/><br/>
    I built this for the ones who do.<br/>
    The ones who scroll past beginnings<br/>
    looking for what wasn't meant to be found.<br/><br/>
    You are exactly the kind of person I want to work with.<br/><br/>
    — lee yousuf
  </p>
  <p class="secret-note">[ the cat is gone from the roof ]</p>
</div>
{/if}

<!-- Haiku complete -->
{#if showHaikuComplete}
<div class="haiku-overlay" transition:fade>
  <p>ink on still water<br/>a door found ajar at dusk<br/>the cat was not there</p>
</div>
{/if}

<!-- Closing -->
{#if showClosing}
<div class="closing" transition:fade={{ duration: 2000 }}>
  <div class="closing-text" transition:fade={{ delay: 4000, duration: 2000 }}>
    thank you for staying.
    <span class="closing-sub">月夜 · tsukiyo</span>
  </div>
</div>
{/if}

<style>
  /* ── SCENE ─────────────────────────── */
  .scene { position:fixed; inset:0; overflow:hidden; animation:breathe 4s ease-in-out infinite; }
  .layer { position:absolute; inset:0; }
  /* will-change only on layers that actually move */
  .layer-distant,.layer-inn,.layer-fg { will-change:transform; }
  .layer-sky { background:radial-gradient(ellipse 80% 60% at 72% 18%, #1a2d5a 0%, #0e1e3d 40%, #070f20 100%); }
  .layer-distant,.layer-inn,.layer-fg { bottom:0; left:0; right:0; position:absolute; top:auto; }
  .layer-distant { height:80%; }
  .layer-inn     { height:90%; }
  .layer-fg      { height:35%; }

  /* ── STAR CANVAS ────────────────────── */
  .star-canvas {
    position:absolute; inset:0; width:100%; height:100%;
    opacity:0.9;
    animation: twinkleCanvas 6s ease-in-out infinite alternate;
  }
  @keyframes twinkleCanvas {
    0%   { opacity: 0.75; }
    100% { opacity: 1; }
  }

  .lantern-pos { position:absolute; }
  .bamboo { position:absolute; left:0; bottom:0; width:200px; height:70%; }
  .stalk  { position:absolute; bottom:0; width:8px; border-radius:4px 4px 0 0; background:linear-gradient(to right,#2d4a1e,#4a7a2e,#2d4a1e); animation:bambooSway ease-in-out infinite; transform-origin:bottom center; filter:brightness(0.6) saturate(0.7); }
  .leaf   { position:absolute; width:30px; height:8px; background:#3a6a22; border-radius:0 50% 0 50%; transform-origin:left center; animation:leafSway ease-in-out infinite; }
  .l1 { top:20%; left:8px; }
  .l2 { top:42%; right:8px; transform:scaleX(-1); }

  /* ── THEATRE CURTAINS ──────────────── */
  .curtains { position:fixed; inset:0; z-index:60; pointer-events:all; }
  .curtains.open { pointer-events:none; }
  .open .curtain-left,.open .curtain-right { opacity:0; transition:transform 1.6s cubic-bezier(0.76,0,0.24,1), opacity 0.4s ease 1.4s; }
  .valance { position:absolute; top:0; left:0; right:0; height:52px; background:linear-gradient(to bottom,#1a0a04,#2d1206); z-index:10; display:flex; align-items:center; justify-content:center; border-bottom:3px solid rgba(192,57,43,0.3); box-shadow:0 4px 30px rgba(0,0,0,0.6); }
  .curtains.open .valance { opacity:0; transition:opacity 0.4s ease 1.4s; }
  .valance::before,.valance::after { content:''; position:absolute; bottom:-16px; width:50%; height:16px; background:#1a0a04; clip-path:polygon(0 0,100% 0,95% 100%,5% 100%); }
  .valance::before { left:0; }
  .valance::after  { right:0; }
  .valance-text { font-family:var(--font-serif); font-size:20px; color:rgba(240,232,208,0.35); letter-spacing:0.5em; text-indent:0.5em; }
  .curtain { overflow:hidden; position:absolute; top:0; bottom:0; width:48%; transition:transform 1.6s cubic-bezier(0.76,0,0.24,1); z-index:5; }
  .curtain-left  { left:0;  transform-origin:left center; }
  .curtain-right { right:0; transform-origin:right center; }
  .open .curtain-left  { transform:translateX(-92%); }
  .open .curtain-right { transform:translateX(92%);  }
  .curtain-fabric { opacity:0.88; position:absolute; inset:0; background:linear-gradient(to bottom,#1a0a04 0%,#2d1206 10%,#3d1a08 30%,#2d1206 60%,#1f0d05 85%,#140802 100%); overflow:hidden; }
  .fold { position:absolute; top:0; bottom:0; width:20%; background:linear-gradient(to right,rgba(0,0,0,0.18) 0%,transparent 40%,rgba(255,200,100,0.04) 60%,transparent 80%,rgba(0,0,0,0.1) 100%); pointer-events:none; }
  .rod { position:absolute; top:70px; left:0; right:0; height:10px; background:linear-gradient(to bottom,#8b6914,#c8a020,#8b6914); border-radius:5px; box-shadow:0 2px 10px rgba(0,0,0,0.6); z-index:2; }
  .fringe { position:absolute; bottom:0; left:0; right:0; height:60px; display:flex; align-items:flex-start; justify-content:space-around; padding:0 4px; }
  .tassel { width:5px; height:52px; background:linear-gradient(to bottom,#8b6914,#d4a820 60%,transparent); border-radius:0 0 3px 3px; animation:tasselSwing 2.5s ease-in-out infinite; transform-origin:top center; }
  @keyframes tasselSwing { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }

  .entry-overlay { position:fixed; inset:0; z-index:55; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; text-align:center; }
  .entry-name { font-family:var(--font-display); font-size:clamp(52px,9vw,110px); color:var(--paper); letter-spacing:-0.025em; line-height:1; margin-bottom:16px; opacity:0; filter:blur(12px); transition:opacity 2s ease, filter 2s ease; text-shadow:0 0 60px rgba(245,200,66,0.15); }
  .entry-name.revealed { opacity:1; filter:blur(0); }
  .entry-tag { font-family:var(--font-mono); font-size:clamp(10px,1.3vw,13px); color:rgba(240,232,208,0.65); letter-spacing:0.22em; margin-bottom:52px; opacity:0; transition:opacity 1.8s ease; }
  .entry-tag.revealed { opacity:1; }
  .entry-cta { font-family:var(--font-mono); font-size:11px; color:rgba(245,200,66,0.75); letter-spacing:0.22em; background:none; border:1px solid rgba(245,200,66,0.15); padding:12px 28px; border-radius:1px; cursor:pointer; pointer-events:all; opacity:0; transition:opacity 1.5s ease, color 0.3s, border-color 0.3s, background 0.3s; animation:promptPulse 2.4s ease-in-out infinite; }
  .entry-cta.revealed { opacity:1; }
  .entry-cta:hover { color:var(--amber); border-color:rgba(245,200,66,0.4); background:rgba(245,200,66,0.05); }

  /* ── INSIDE ────────────────────────── */
  .inside-overlay { position:fixed; inset:0; z-index:18; pointer-events:none; }
  .shoji-bg { position:fixed; inset:0; background:rgba(22,14,8,0.82); }
  .shoji-screens { position:fixed; top:0; right:0; bottom:0; width:180px; display:grid; grid-template-columns:repeat(4,1fr); gap:1px; border-left:2px solid rgba(139,105,20,0.22); }
  .shoji-cell { background:rgba(240,232,208,0.025); border:1px solid rgba(139,105,20,0.1); }

  /* ── ROOMS ─────────────────────────── */
  .rooms-wrap { position:fixed; inset:0; z-index:22; pointer-events:none; }
  .room-panel { position:absolute; inset:0; pointer-events:all; }

  /* ── ARROWS ────────────────────────── */
  .arrow { position:fixed; top:50%; z-index:50; transform:translateY(-50%); background:rgba(240,232,208,0.04); border:1px solid rgba(240,232,208,0.08); color:rgba(240,232,208,0.35); width:42px; height:42px; border-radius:50%; font-size:22px; display:flex; align-items:center; justify-content:center; cursor:pointer; opacity:0; pointer-events:none; transition:opacity 0.3s, background 0.2s, color 0.2s; }
  .arrow.visible { opacity:1; pointer-events:all; }
  .arrow:hover   { background:rgba(240,232,208,0.1); color:rgba(240,232,208,0.8); }
  .arrow-left  { left:14px; }
  .arrow-right { right:14px; }

  .scroll-hint { position:fixed; bottom:22px; left:50%; transform:translateX(-50%); z-index:50; font-family:var(--font-mono); font-size:10px; color:rgba(240,232,208,0.55); letter-spacing:0.22em; pointer-events:none; text-align:center; }

  /* ── DOTS ──────────────────────────── */
  .room-dots { position:fixed; top:50%; right:10px; z-index:50; transform:translateY(-50%); display:flex; flex-direction:column; gap:8px; }
  .dot { width:5px; height:5px; border-radius:50%; background:rgba(240,232,208,0.15); border:none; cursor:pointer; transition:background 0.3s, transform 0.3s; padding:0; }
  .dot.active { background:var(--amber); transform:scale(1.4); }

  /* ── TIDE ──────────────────────────── */
  .tide-line { position:fixed; bottom:0; left:0; right:0; height:20px; z-index:15; pointer-events:none; }
  .tide-line svg { width:100%; height:100%; }

  /* ── SECRET ────────────────────────── */
  .secret { position:fixed; inset:0; z-index:25; background:#050505; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:28px; }
  .secret-moon { width:22px; height:22px; border-radius:50%; background:rgba(240,232,208,0.04); border:1px solid rgba(240,232,208,0.08); }
  .secret-text { font-family:var(--font-hand); font-size:20px; color:rgba(240,232,208,0.75); text-align:center; max-width:380px; line-height:2; }
  .secret-note { font-family:var(--font-mono); font-size:8px; color:rgba(240,232,208,0.1); letter-spacing:0.2em; text-align:center; }

  /* ── HAIKU ─────────────────────────── */
  .haiku-overlay { position:fixed; inset:0; z-index:200; display:flex; align-items:center; justify-content:center; pointer-events:none; background:rgba(10,18,34,0.6); }
  .haiku-overlay p { font-family:var(--font-hand); font-size:clamp(20px,2.5vw,28px); color:var(--paper); line-height:2.2; text-align:center; opacity:0.85; }

  /* ── CLOSING ───────────────────────── */
  .closing { position:fixed; inset:0; z-index:500; background:#050505; display:flex; align-items:center; justify-content:center; }
  .closing-text { font-family:var(--font-mono); font-size:12px; color:rgba(240,232,208,0.55); letter-spacing:0.32em; text-align:center; display:flex; flex-direction:column; gap:12px; }
  .closing-sub  { font-size:8px; letter-spacing:0.45em; opacity:0.45; }

  @media (max-width: 768px) {
  .arrow { width:36px; height:36px; font-size:18px; } 
    .shoji-screens { width:80px; }
    .room-dots { display:none; }
    .curtain { width:52%; }
  
    .layer-distant,.layer-inn,.layer-fg { transform:none !important; will-change:auto; }
  }
</style>

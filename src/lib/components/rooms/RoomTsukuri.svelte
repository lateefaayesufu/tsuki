<script>
  import { onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { writable } from 'svelte/store';

  const PROJECTS = [
    {
      id: 'nexus',
      kanji: '連',
      cat: 'data',
      title: 'Nexus Dashboard',
      tech: 'Vue · ECharts · Tailwind',
      desc: 'A real-time data visualization platform with live WebGL charts, streaming data pipelines, and a customizable widget system. Built for teams who need to see everything, instantly.',
      tags: ['Real-time', 'WebGL', 'Vue 3', 'Dashboard', 'Data streams'],
      color: [100, 150, 255],
      demo: 'https://ccnexuswatch.vercel.app/',
      repo: 'https://github.com/lateefaayesufu/nexuswatch',
    screenshots: [

  { label: '01 — Overview', src: '/nexus/first.png' },
  { label: '02 — Charts',   src: '/nexus/second.png' },
  { label: '03 — Settings', src: '/nexus/third.png' },
],

      palette: ['#0a1628','#1a3a6a','#4a8ad4','#a0c4f0'],
      orbitR: 90, orbitSpeed: 0.00038, size: 22, phase: 0,
    },
    {
      id: 'eventsphere',
      kanji: '球',
      cat: 'fullstack',
      title: 'EventSphere',
      tech: 'React · MongoDB · PostgreSQL',
      desc: 'An interactive event management tool with calendar views, RSVP flows, ambient audio cues, and real-time attendee presence. Every event feels alive.',
      tags: ['React', 'MongoDB', 'PostgreSQL', 'Real-time', 'Calendar'],
      color: [80, 200, 120],
      demo: 'https://eventspheres.vercel.app/',
      repo: 'https://github.com/lateefaayesufu/EventSphere',
      screenshots: [
        { label: '01 — Calendar', src: '/eventsphere/first.png'  },
        { label: '02 — RSVP Flow', src: '/eventsphere/second.png' },
        { label: '03 — Dashboard', src: '/eventsphere/third.png' },
      ],
      palette: ['#0a1a10','#1a4a28','#2a8a48','#60c880'],
      orbitR: 150, orbitSpeed: 0.00026, size: 28, phase: 1.2,
    },
 {
  id: 'cloud9',
  kanji: '旅',
  cat: 'design',
  title: 'Cloud 9 Travels',
  tech: 'HTML · CSS · JavaScript',
  desc: 'A travel website experience built with clean HTML, CSS, and vanilla JavaScript. Designed to make every destination feel like a dream worth chasing.',
  tags: ['HTML', 'CSS', 'JavaScript', 'Travel', 'Netlify'],
  color: [245, 200, 66],
  demo: 'https://cloud9travels.netlify.app/',
  repo: 'https://github.com/lateefaayesufu/Cloud-9',
  screenshots: [
    { label: '01 — Landing', src: '/cloud9/first.png' },
    { label: '02 — Destinations', src: '/cloud9/second.png' },
    { label: '03 — Explore', src: '/cloud9/third.png' },
  ],
      palette: ['#1a1600','#3a3000','#6a5a00','#c8a800'],
      orbitR: 205, orbitSpeed: 0.00017, size: 24, phase: 2.6,
    },
{
  id: 'whisperbox',
  kanji: '囁',
  cat: 'fullstack',
  title: 'Whisperbox',
  tech: 'WebSockets · TypeScript · E2E Encryption',
  desc: 'A real-time encrypted messaging app where nothing is stored and nothing lingers. Messages vanish. Identities stay anonymous. Built for conversations that were never meant to be kept.',
  tags: ['WebSockets', 'TypeScript', 'Encryption', 'Real-time', 'Privacy'],
  color: [170, 110, 255],
  demo: 'https://ccwhisper.vercel.app/',
  repo: 'https://github.com/lateefaayesufu/whisper',
  screenshots: [
  { label: '01 — Chat room' , src: '/whisper/first.png'   },
    { label: '02 — Encryption' , src: '/whisper/second.png'   },
    { label: '03 — Anonymous' , src: '/whisper/third.png' },
  ],
      palette: ['#0a0618','#1a1040','#3020a0','#8060e0'],
      orbitR: 255, orbitSpeed: 0.00011, size: 20, phase: 4.1,
    },
    {
      id: 'tsuki',
      kanji: '月',
      cat: 'design',
      title: 'Tsuki — Portfolio',
      tech: 'SvelteKit · Canvas · CSS physics',
      desc: 'This very portfolio. A moonlit Japanese inn as a navigable web experience — no images, only SVG and Canvas. A world made of code, shadow, and intent.',
      tags: ['SvelteKit', 'Canvas API', 'CSS physics', 'No images', '58KB gz'],
      color: [240, 232, 208],
      demo: 'https://lee.vercel.app',
      repo: 'https://github.com/lateefaayesufu/tsuki',
      screenshots: [
        { label: '01 — Entry scene' , src: '/tsuki/first.png'   },
        { label: '02 — Inner rooms' , src: '/tsuki/second.png'   },
        { label: '03 — Moon system' , src: '/tsuki/third.png' },
      ],
      palette: ['#080c14','#141e38','#203060','#4060a0'],
      orbitR: 298, orbitSpeed: 0.000072, size: 18, phase: 5.5,
    },
  ];

  const CATEGORIES = [
    { key: 'all', label: 'ALL' },
    { key: 'data', label: 'DATA VIZ' },
    { key: 'design', label: 'DESIGN' },
    { key: '3d', label: '3D / CANVAS' },
    { key: 'fullstack', label: 'FULL STACK' },
  ];

  let wrapEl;
  let orbCanvas;
  let orbCtx;
  let touchStartX = 0;

  let W = 0, H = 0, CX = 0, CY = 0;
  let time = 0;
  let orbPositions = [];
  let hovIdx = null;
  let raf;

  let cometActive = false;
  let cometX, cometY, cometVx, cometVy, cometLife;
  let idleTimer;

  let activeFilter = 'all';
  let stars = [];

  let activeProject = null;
  let showModal = false;
  let currentSlide = 0;
  let placeholderCanvases = [];

  const haikuFound = writable([false, false, false]);

  let mouseX = 0;
  let mouseY = 0;

  function resize() {
    if (!wrapEl || !orbCanvas) return;
    const rect = wrapEl.getBoundingClientRect();
    W = orbCanvas.width = rect.width;
    H = orbCanvas.height = rect.height;
    CX = W / 2;
    CY = H / 2 + 20;
  }

  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(fireComet, 22000);
  }

  function fireComet() {
    cometActive = true;
    cometX = -60;
    cometY = H * 0.22 + Math.random() * H * 0.38;
    cometVx = W / 80;
    cometVy = (Math.random() - 0.5) * 2;
    cometLife = 1;
  }

  function handleOrreryClick(e) {
    if (showModal) return;
    const rect = wrapEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    for (let i = 0; i < PROJECTS.length; i++) {
      const p = PROJECTS[i];
      if (activeFilter !== 'all' && p.cat !== activeFilter) continue;
      const o = orbPositions[i];
      if (!o) continue;
      const dx = clickX - o.x, dy = clickY - o.y;
      if (Math.sqrt(dx * dx + dy * dy) < p.size + 14) {
        openShowcase(p);
        return;
      }
    }
  }

  function openShowcase(p) {
    activeProject = p;
    currentSlide = 0;
    showModal = true;
    setTimeout(drawAllPlaceholders, 60);
  }

  function closeShowcase() {
    showModal = false;
    activeProject = null;
    placeholderCanvases = [];
  }

  function gotoSlide(n) {
    if (!activeProject) return;
    const total = activeProject.screenshots.length;
    currentSlide = ((n % total) + total) % total;
  }

  function drawAllPlaceholders() {
    placeholderCanvases.forEach((c, i) => {
      if (!c || !activeProject) return;
      drawPlaceholder(c, activeProject.palette, activeProject.kanji, i);
    });
  }

  function drawPlaceholder(canvas, palette, kanji, idx) {
    const cW = canvas.offsetWidth || 780;
    const cH = canvas.offsetHeight || 340;
    canvas.width = cW;
    canvas.height = cH;
    const c = canvas.getContext('2d');
    c.fillStyle = palette[0];
    c.fillRect(0, 0, cW, cH);
    for (let i = 0; i < 7; i++) {
      const x = Math.random() * cW, y = Math.random() * cH, r = 50 + Math.random() * 140;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, palette[1 + (i % 3)] + '55');
      g.addColorStop(1, 'transparent');
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fillStyle = g; c.fill();
    }
    c.fillStyle = palette[2] + '22';
    for (let y = 0; y < cH; y += 28) c.fillRect(0, y, cW, 1);
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(Math.random() * cW, Math.random() * cH);
      for (let j = 0; j < 4; j++) c.lineTo(Math.random() * cW, Math.random() * cH);
      c.strokeStyle = palette[2] + '44'; c.lineWidth = 0.5; c.stroke();
    }
    c.font = `bold ${Math.min(cW, cH) * 0.24}px var(--font-display)`;
    c.fillStyle = palette[3] + '1a';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(kanji, cW / 2, cH / 2);
    c.font = `9px var(--font-mono)`;
    c.fillStyle = 'rgba(255,255,255,0.14)';
    c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillText('[ add real screenshot path to screenshots[] ]', 14, 14);
  }

  function drawStars() {
    for (const s of stars) {
      const a = s.a * (0.6 + 0.4 * Math.sin(s.tw + time * s.ts * 1000));
      orbCtx.beginPath();
      orbCtx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      orbCtx.fillStyle = `rgba(245,232,200,${a})`;
      orbCtx.fill();
    }
  }

  function drawMoon() {
    const r = Math.max(28, Math.min(W, H) * 0.057);
    const glow = orbCtx.createRadialGradient(CX, CY, 0, CX, CY, r * 3.4);
    glow.addColorStop(0, 'rgba(245,200,66,0.2)');
    glow.addColorStop(1, 'rgba(245,200,66,0)');
    orbCtx.beginPath();
    orbCtx.arc(CX, CY, r * 3.4, 0, Math.PI * 2);
    orbCtx.fillStyle = glow; orbCtx.fill();
    const moon = orbCtx.createRadialGradient(CX - r * 0.18, CY - r * 0.18, r * 0.05, CX, CY, r);
    moon.addColorStop(0, 'rgba(255,245,200,0.94)');
    moon.addColorStop(0.7, 'rgba(245,200,66,0.8)');
    moon.addColorStop(1, 'rgba(220,160,40,0.5)');
    orbCtx.beginPath();
    orbCtx.arc(CX, CY, r, 0, Math.PI * 2);
    orbCtx.fillStyle = moon; orbCtx.fill();
    orbCtx.font = `${r * 0.3}px var(--font-display)`;
    orbCtx.fillStyle = 'rgba(28,20,16,0.5)';
    orbCtx.textAlign = 'center';
    orbCtx.fillText('月夜', CX, CY + r * 0.12);
  }

  function drawOrbit(p, bx, by, faded) {
    orbCtx.beginPath();
    const seg = 120;
    for (let i = 0; i <= seg; i++) {
      const angle = (i / seg) * Math.PI * 2;
      const ox = Math.cos(angle) * p.orbitR + CX;
      const oy = Math.sin(angle) * p.orbitR * 0.38 + CY;
      const dx = ox - bx, dy = oy - by;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const pull = Math.max(0, 1 - dist / 220);
      const fx = ox + (bx - ox) * pull * 0.18;
      const fy = oy + (by - oy) * pull * 0.12;
      i === 0 ? orbCtx.moveTo(fx, fy) : orbCtx.lineTo(fx, fy);
    }
    orbCtx.closePath();
    orbCtx.strokeStyle = `rgba(245,200,66,${faded ? 0.03 : 0.07})`;
    orbCtx.lineWidth = 0.8;
    orbCtx.stroke();
    orbCtx.strokeStyle = `rgba(255,255,255,${faded ? 0.01 : 0.03})`;
    orbCtx.lineWidth = 0.4;
    orbCtx.setLineDash([4, 12]);
    orbCtx.stroke();
    orbCtx.setLineDash([]);
  }

  function getOrbPos(p, t, bx, by) {
    const angle = p.phase + t * p.orbitSpeed * 1000;
    const ox = Math.cos(angle) * p.orbitR + CX;
    const oy = Math.sin(angle) * p.orbitR * 0.38 + CY;
    const dx = ox - bx, dy = oy - by;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const pull = Math.max(0, 1 - dist / 220);
    return { x: ox + (bx - ox) * pull * 0.18, y: oy + (by - oy) * pull * 0.12 };
  }

  function drawOrb(p, pos, hov, faded) {
    const [r, g, b] = p.color;
    const pulse = 0.85 + 0.15 * Math.sin(time * 1.8 + p.phase);
    const sz = p.size * (hov ? 1.22 : 1) * pulse;
    const alpha = faded ? 0.22 : 1;
    const gl = orbCtx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, sz * 2.8);
    gl.addColorStop(0, `rgba(${r},${g},${b},${0.22 * alpha})`);
    gl.addColorStop(1, 'transparent');
    orbCtx.beginPath();
    orbCtx.arc(pos.x, pos.y, sz * 2.8, 0, Math.PI * 2);
    orbCtx.fillStyle = gl; orbCtx.fill();
    const orb = orbCtx.createRadialGradient(pos.x - sz * 0.3, pos.y - sz * 0.3, sz * 0.1, pos.x, pos.y, sz);
    orb.addColorStop(0, `rgba(${Math.min(255,r+60)},${Math.min(255,g+60)},${Math.min(255,b+60)},${0.95*alpha})`);
    orb.addColorStop(0.65, `rgba(${r},${g},${b},${0.82*alpha})`);
    orb.addColorStop(1, `rgba(${Math.max(0,r-40)},${Math.max(0,g-40)},${Math.max(0,b-40)},${0.55*alpha})`);
    orbCtx.beginPath();
    orbCtx.arc(pos.x, pos.y, sz, 0, Math.PI * 2);
    orbCtx.fillStyle = orb; orbCtx.fill();
    orbCtx.globalAlpha = alpha;
    orbCtx.font = `${sz * 0.92}px var(--font-display)`;
    orbCtx.fillStyle = 'rgba(255,255,255,0.88)';
    orbCtx.textAlign = 'center';
    orbCtx.textBaseline = 'middle';
    orbCtx.fillText(p.kanji, pos.x, pos.y + 1);
    orbCtx.textBaseline = 'alphabetic';
    if (hov) {
      orbCtx.font = `8px var(--font-mono)`;
      orbCtx.fillStyle = `rgba(${r},${g},${b},0.9)`;
      orbCtx.fillText(p.title.toUpperCase(), pos.x, pos.y + sz + 15);
      orbCtx.fillStyle = 'rgba(255,255,255,0.28)';
      orbCtx.fillText(p.tech, pos.x, pos.y + sz + 26);
    }
    orbCtx.globalAlpha = 1;
  }

  function drawComet() {
    if (!cometActive) return;
    cometX += cometVx;
    cometY += cometVy;
    cometLife -= 0.008;
    if (cometX > W + 80 || cometLife <= 0) { cometActive = false; return; }
    const tailLen = 80;
    const tg = orbCtx.createLinearGradient(cometX - tailLen, cometY, cometX, cometY);
    tg.addColorStop(0, 'rgba(245,232,200,0)');
    tg.addColorStop(1, `rgba(245,232,200,${cometLife * 0.7})`);
    orbCtx.beginPath();
    orbCtx.moveTo(cometX - tailLen, cometY);
    orbCtx.lineTo(cometX, cometY);
    orbCtx.strokeStyle = tg; orbCtx.lineWidth = 1.5; orbCtx.stroke();
    orbCtx.beginPath();
    orbCtx.arc(cometX, cometY, 2.5, 0, Math.PI * 2);
    orbCtx.fillStyle = `rgba(255,248,220,${cometLife})`;
    orbCtx.fill();
  }

  function frame(ts) {
    time = ts * 0.001;
    if (!orbCtx) { raf = requestAnimationFrame(frame); return; }
    orbCtx.clearRect(0, 0, W, H);
    orbCtx.fillStyle = '#050a14';
    orbCtx.fillRect(0, 0, W, H);
    drawStars();
    const bx = mouseX > 0 ? mouseX : CX;
    const by = mouseY > 0 ? mouseY : CY;
    PROJECTS.forEach(p => {
      const faded = activeFilter !== 'all' && p.cat !== activeFilter;
      drawOrbit(p, bx, by, faded);
    });
    drawMoon();
    orbPositions = [];
    hovIdx = null;
    PROJECTS.forEach((p, i) => {
      const pos = getOrbPos(p, time, bx, by);
      orbPositions.push(pos);
      const faded = activeFilter !== 'all' && p.cat !== activeFilter;
      if (!faded && !showModal) {
        const d = Math.sqrt((mouseX - pos.x) ** 2 + (mouseY - pos.y) ** 2);
        if (d < p.size + 14) hovIdx = i;
      }
    });
    const sorted = [...PROJECTS.keys()].sort((a, b) => orbPositions[a].y - orbPositions[b].y);
    for (const i of sorted) {
      const faded = activeFilter !== 'all' && PROJECTS[i].cat !== activeFilter;
      drawOrb(PROJECTS[i], orbPositions[i], hovIdx === i, faded);
    }
    drawComet();
    raf = requestAnimationFrame(frame);
  }

  onMount(() => {
    orbCtx = orbCanvas.getContext('2d');
    resize();
    stars = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 0.9 + 0.2,
      a: Math.random() * 0.45 + 0.08,
      tw: Math.random() * Math.PI * 2,
      ts: 0.0004 + Math.random() * 0.001,
    }));
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(frame);
    resetIdle();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
      clearTimeout(idleTimer);
    };
  });

  onDestroy(() => {
    cancelAnimationFrame(raf);
    clearTimeout(idleTimer);
  });

  function handleKey(e) {
    if (e.key === 'Escape' && showModal) closeShowcase();
  }

  function markHaikuFound(index) {
    haikuFound.update(arr => {
      const next = [...arr];
      next[index] = true;
      return next;
    });
  }

  function handleWindowMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    resetIdle();
  }
</script>

<svelte:window on:keydown={handleKey} on:mousemove={handleWindowMove} />
<div
  class="room-tsukuri"
  bind:this={wrapEl}
  on:click={handleOrreryClick}
  on:keydown={e => (e.key === 'Enter' || e.key === ' ') && handleOrreryClick(e)}
  role="application"
  tabindex="-1"
>
  <canvas
    bind:this={orbCanvas}
    class="orr-canvas"
    class:cursor-pointer={hovIdx !== null && !showModal}
  ></canvas>

  <nav class="filters">
    {#each CATEGORIES as cat}
      <button
        class="filt-btn"
        class:active={activeFilter === cat.key}
        on:click|stopPropagation={() => (activeFilter = cat.key)}
      >
        {cat.label}
      </button>
    {/each}
  </nav>

<p class="hint">these are my projects — each planet orbits the moon · move your cursor to bend their paths · click any planet to open its dossier</p>

  <button
    class="haiku-fragment"
    class:found={$haikuFound[2]}
    on:click|stopPropagation={() => markHaikuFound(2)}
    style="position:absolute; bottom:14px; right:20px; z-index:10"
  >
    the cat was not there
  </button>

 {#if showModal && activeProject}
<div
  class="showcase-backdrop"
  on:click|self={closeShowcase}
  on:keydown={e => e.key === 'Escape' && closeShowcase()}
  role="dialog"
  aria-modal="true"
  aria-label="Project showcase"
  tabindex="-1"
  transition:fade={{ duration: 380 }}
>
  <div class="showcase-inner" transition:scale={{ duration: 420, easing: cubicOut, start: 0.96 }}>
    <div class="sc-paper">
      <div class="sc-top"
        on:touchstart={e => { touchStartX = e.touches[0].clientX; }}
        on:touchend={e => {
          const dx = e.changedTouches[0].clientX - touchStartX;
          if (Math.abs(dx) > 40) gotoSlide(dx < 0 ? currentSlide + 1 : currentSlide - 1);
        }}
      >
        <div class="sc-hanko">公開済</div>
        <button class="sc-arr sc-arr--left" on:click|stopPropagation={() => gotoSlide(currentSlide - 1)}>‹</button>
        <button class="sc-arr sc-arr--right" on:click|stopPropagation={() => gotoSlide(currentSlide + 1)}>›</button>
        <div class="sc-track" style="transform: translateX(-{currentSlide * 100}%)">
          {#each activeProject.screenshots as sc, i}
            <div class="sc-slide">
              {#if sc.src}
                <img src={sc.src} alt={sc.label} class="sc-img" />
              {:else}
                <canvas bind:this={placeholderCanvases[i]} class="sc-placeholder"></canvas>
              {/if}
              <span class="sc-img-label">{sc.label}</span>
            </div>
          {/each}
        </div>
        <div class="sc-dots">
          {#each activeProject.screenshots as _, i}
            <button class="sc-dot" class:active={i === currentSlide} on:click|stopPropagation={() => gotoSlide(i)}></button>
          {/each}
        </div>
      </div>
      <div class="sc-body">
        <div class="sc-masthead">月夜新聞 · PROJECT DOSSIER</div>
        <div class="sc-rule"></div>
        <h2 class="sc-title">{activeProject.title}</h2>
        <p class="sc-tech">{activeProject.tech}</p>
        <p class="sc-desc">{activeProject.desc}</p>
        <ul class="sc-tags">
          {#each activeProject.tags as tag}
            <li class="sc-tag">{tag}</li>
          {/each}
        </ul>
        <div class="sc-links">
          <a href={activeProject.demo} target="_blank" rel="noopener noreferrer" class="sc-link" class:sc-link--dim={activeProject.demo === '#'}>Live Demo →</a>
          <a href={activeProject.repo} target="_blank" rel="noopener noreferrer" class="sc-link" class:sc-link--dim={activeProject.repo === '#'}>GitHub →</a>
        </div>
        <button class="sc-close" on:click={closeShowcase}>✕ close dossier</button>
      </div>
    </div>
  </div>
</div>
{/if}
</div>

<style>
  :global(:root) {
    --sky2: #050a14;
    --paper: #f0e8d0;
    --ink: #1c1410;
    --vermillion: #c0392b;
    --font-mono: 'Courier New', monospace;
    --font-display: serif;
  }
  .room-tsukuri {
    position: relative;
    width: 100%;
    height: 100vh;
    min-height: 500px;
    background: #050a14;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .orr-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    cursor: default; 
  }
  .orr-canvas.cursor-pointer {
    cursor: pointer;
  }
  .filters {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 15;
    flex-wrap: wrap;
    justify-content: center;
  }
  .filt-btn {
    background: rgba(8, 12, 20, 0.72);
    border: 1px solid rgba(245, 200, 66, 0.18);
    color: rgba(245, 200, 66, 0.5);
    font-family: var(--font-mono);
    font-size: 7px;
    letter-spacing: 0.18em;
    padding: 5px 13px;
    cursor: pointer;
    border-radius: 2px;
    transition: all 0.2s;
    backdrop-filter: blur(6px);
  }
  .filt-btn:hover,
  .filt-btn.active {
    background: rgba(245, 200, 66, 0.12);
    border-color: rgba(245, 200, 66, 0.5);
    color: rgba(245, 200, 66, 0.92);
  }
  .hint {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: rgba(245, 200, 66, 0.55);
    pointer-events: none;
    white-space: nowrap;
    z-index: 5;
  }
  .haiku-fragment {
    background: none;
    border: none;
    font-family: var(--font-mono);
    font-size: 7px;
    color: rgba(240, 232, 208, 0.07);
    letter-spacing: 0.15em;
    transition: color 0.6s;
    padding: 0;
  }
  .haiku-fragment.found { color: rgba(192, 57, 43, 0.35); }
  .haiku-fragment:hover:not(.found) {
    color: rgba(240, 232, 208, 0.18);
    cursor: pointer;
  }
  .showcase-backdrop {
    position: absolute;
    inset: 0;
    z-index: 100;
    background: rgba(6, 10, 20, 0.94);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    padding: 24px;
    cursor: default;
  }
  .showcase-inner {
    width: min(800px, 100%);
    max-height: 90vh;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .sc-paper {
    background: var(--paper);
    color: var(--ink);
    border-radius: 2px;
    overflow: hidden;
    transform: rotate(-0.3deg);
    box-shadow: 24px 24px 80px rgba(0, 0, 0, 0.8);
  }
  .sc-top {
    height: 340px;
    position: relative;
    overflow: hidden;
    background: #0d1625;
  }
  .sc-track {
    display: flex;
    height: 100%;
    transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .sc-slide {
    min-width: 100%;
    height: 100%;
    position: relative;
    flex-shrink: 0;
  }
  .sc-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .sc-placeholder {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .sc-img-label {
    position: absolute;
    bottom: 12px;
    right: 14px;
    font-family: var(--font-mono);
    font-size: 8px;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.28);
  }
  .sc-hanko {
    position: absolute;
    top: 16px;
    right: 20px;
    width: 50px;
    height: 50px;
    border: 2px solid var(--vermillion);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-serif);
    font-size: 8px;
    color: var(--vermillion);
    writing-mode: vertical-rl;
    letter-spacing: 0.2em;
    z-index: 5;
    animation: hankoStamp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
  }
  .sc-arr {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(8, 12, 20, 0.55);
    border: none;
    color: rgba(245, 200, 66, 0.75);
    font-size: 20px;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 5;
    transition: background 0.2s;
  }
  .sc-arr:hover { background: rgba(8, 12, 20, 0.88); }
  .sc-arr--left { left: 12px; }
  .sc-arr--right { right: 12px; }
  .sc-dots {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 7px;
    z-index: 5;
  }
  .sc-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: 1px solid rgba(245, 200, 66, 0.4);
    background: transparent;
    cursor: pointer;
    transition: background 0.2s;
    padding: 0;
  }
  .sc-dot.active { background: rgba(245, 200, 66, 0.85); }
  .sc-body { padding: 28px 38px 26px; }
  .sc-masthead {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.3em;
    opacity: 0.5;
    margin-bottom: 8px;
  }
  .sc-rule {
    height: 1px;
    background: rgba(28, 20, 16, 0.15);
    margin: 10px 0 16px;
  }
  .sc-title {
    font-family: var(--font-display);
    font-size: clamp(22px, 4vw, 34px);
    font-weight: 400;
    line-height: 1.18;
    color: var(--ink);
    margin-bottom: 6px;
  }
  .sc-tech {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    opacity: 0.6;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .sc-desc {
    font-family: var(--font-serif);
    font-size: 15px;
    line-height: 1.92;
    opacity: 0.88;
    margin-bottom: 20px;
  }
  .sc-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    list-style: none;
    margin-bottom: 20px;
    padding: 0;
  }
  .sc-tag {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    padding: 4px 10px;
    border: 1px solid rgba(28, 20, 16, 0.2);
    border-radius: 2px;
    opacity: 0.75;
  }
  .sc-links {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }
  .sc-link {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--vermillion);
    text-decoration: none;
    border-bottom: 1px solid rgba(192, 57, 43, 0.3);
    padding-bottom: 2px;
    transition: opacity 0.2s;
  }
  .sc-link:hover { opacity: 0.65; }
  .sc-link--dim { opacity: 0.45; pointer-events: none; }
  .sc-close {
    background: none;
    border: none;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink);
    opacity: 0.28;
    cursor: pointer;
    letter-spacing: 0.15em;
    transition: opacity 0.2s;
    padding: 0;
  }
  @media (max-width: 768px) {
  .hint {
    white-space: normal;
    text-align: center;
    font-size: 8px;
    letter-spacing: 0.1em;
    width: 90%;
    bottom: 40px;
  }

  .filters {
    gap: 5px;
    padding: 0 10px;
  }

  .filt-btn {
    font-size: 6px;
    padding: 4px 8px;
  }

  .sc-paper {
    transform: none;
  }

  .sc-top {
    height: 200px;
  }

  .sc-body {
    padding: 16px 20px 20px;
  }

  .sc-title {
    font-size: 22px;
  }

  .sc-desc {
    font-size: 13px;
  }

  .showcase-inner {
    width: 100%;
    max-height: 95vh;
  }

  .showcase-backdrop {
    padding: 12px;
    align-items: flex-end;
  }

  .haiku-fragment {
    bottom: 28px;
  }
}
  .sc-close:hover { opacity: 0.6; }
  @keyframes hankoStamp {
    from { opacity: 0; transform: scale(1.4) rotate(-8deg); }
    to { opacity: 1; transform: scale(1) rotate(0deg); }
  }
</style>
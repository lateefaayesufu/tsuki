<script>
  import { fade } from 'svelte/transition';

  const skills = [
    { name: 'SvelteKit',       kanji: '組', weight: 'heavy',  haiku: 'Components breathe\nreactive stores pulse like blood—\nthe framework is me',         x: 28,  y: 62 },
    { name: 'React',           kanji: '応', weight: 'heavy',  haiku: 'State flows like water\nvirtual trees root and bloom—\nrender, re-render',            x: 45,  y: 58 },
    { name: 'CSS / Animation', kanji: '動', weight: 'heavy',  haiku: 'Pixels obey will\ntransition, transform, dissolve—\nmotion is the soul',             x: 62,  y: 63 },
    { name: 'GSAP',            kanji: '流', weight: 'medium', haiku: 'Timeline unspools silk\neach tween a brushstroke in time—\nsmooth beyond nature',      x: 18,  y: 44 },
    { name: 'Canvas API',      kanji: '描', weight: 'medium', haiku: 'Blank context awaits\n2d dreams drawn by hand—\nthe screen is paper',                 x: 35,  y: 40 },
    { name: 'TypeScript',      kanji: '型', weight: 'medium', haiku: 'Types guard the kingdom\ncompiler whispers warnings—\nerrors die at dawn',            x: 54,  y: 42 },
    { name: 'Node.js',         kanji: '根', weight: 'medium', haiku: 'Server breathes async\nevents loop like falling leaves—\nnon-blocking silence',        x: 72,  y: 45 },
    { name: 'Three.js',        kanji: '深', weight: 'medium', haiku: 'Third dimension calls\nmesh and light in WebGL—\nthe void has texture',               x: 83,  y: 38 },
    { name: 'D3.js',           kanji: '数', weight: 'light',  haiku: 'Data finds its shape\nscales and axes tell the truth—\nnumbers become art',           x: 10,  y: 26 },
    { name: 'Figma',           kanji: '形', weight: 'light',  haiku: 'Frames hold the vision\nbefore a single line runs—\ndesign is the code',              x: 25,  y: 22 },
    { name: 'Supabase',        kanji: '蔵', weight: 'light',  haiku: 'Rows sleep in postgres\nrealtime wakes them gently—\nopen source, open heart',         x: 42,  y: 18 },
    { name: 'Vite',            kanji: '速', weight: 'light',  haiku: 'Hot module reloads\nbuild time measured in heartbeats—\nfast as intention',            x: 60,  y: 20 },
    { name: 'Git',             kanji: '歴', weight: 'light',  haiku: 'Commits are memory\nbranch and merge like river forks—\nhistory forgives',            x: 76,  y: 24 },
    { name: 'Tone.js',         kanji: '音', weight: 'light',  haiku: 'Oscillators hum\nweb audio breathes and sings—\ncode that makes sound',              x: 89,  y: 19 },
  ];

  const swayDur       = [3.8,4.5,3.2,5.1,4.0,3.6,4.8,3.3,5.4,4.1,3.7,4.9,3.5,5.2];
  const swayDelay     = [0.0,0.6,1.2,0.3,0.9,1.5,0.4,1.1,0.7,0.2,1.3,0.8,0.5,1.0];
  const bobDur        = [6.0,7.2,5.5,8.1,6.8,7.5,5.9,8.4,6.3,7.0,5.7,8.0,6.5,7.8];
  const bobDelay      = [0.0,1.0,2.0,0.5,1.5,2.5,0.8,1.8,0.3,1.3,2.3,0.6,1.6,2.6];
  const finaleX       = [-12,8,-5,14,-9,6,-16,11,-3,18,-7,4,-14,9];
  const finaleStagger = [0,0.18,0.34,0.09,0.25,0.42,0.05,0.31,0.47,0.15,0.38,0.22,0.53,0.12];
  const sizes         = { heavy: 66, medium: 50, light: 36 };

  let openScroll      = null;
  let released        = new Set();
  let instructionSeen = false;
  let finale          = false;
  let canvasEls       = {};

  function toggleScroll(i) {
    instructionSeen = true;
    if (released.has(i)) return;
    openScroll = openScroll === i ? null : i;
  }

  function release(i) {
    if (released.has(i)) return;
    spawnEmbers(i);
    released = new Set([...released, i]);
    openScroll = null;
    if (released.size === skills.length) {
      setTimeout(() => { finale = true; }, 300);
    }
  }

  function spawnEmbers(i) {
    const canvas = canvasEls[i];
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 120; canvas.height = 120;
    const particles = Array.from({ length: 28 }, () => ({
      x: 60, y: 60,
      vx: (Math.random() - 0.5) * 5,
      vy: -(Math.random() * 4 + 1.5),
      life: 1,
      decay: Math.random() * 0.025 + 0.018,
      r: Math.random() * 3 + 1,
    }));
    function draw() {
      ctx.clearRect(0, 0, 120, 120);
      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        ctx.globalAlpha = p.life * 0.85;
        ctx.fillStyle = `hsl(${30 + Math.random() * 20}, 90%, ${55 + p.life * 20}%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= p.decay;
      }
      if (alive) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, 120, 120);
    }
    draw();
  }

 
  $: allReleased = skills.every((_, i) => released.has(i));
  $: remaining   = skills.filter((_, i) => !released.has(i)).length;
  $: openSkill   = openScroll !== null ? skills[openScroll] : null;
</script>



<div class="room-yakimono">

  <div class="sky" aria-hidden="true">
    {#each Array(80) as _, i}
      <div class="star" style="
        left:{(i*41+i*i*7)%100}%;
        top:{(i*29+i*11)%88}%;
        width:{i%4===0?2:1}px; height:{i%4===0?2:1}px;
        opacity:{0.08+(i%6)*0.07};
        animation-delay:{(i*0.27)%5}s;
        animation-duration:{2+(i%3)*1.2}s
      "></div>
    {/each}
    <div class="moon" class:moon-bright={finale}></div>
  </div>

  <div class="wind-layer" aria-hidden="true"></div>

  <header class="page-header">
    <h2 class="page-title">焼き物</h2>
    <p class="page-sub">Yakimono · Skills & Weapons of Craft</p>
  </header>

  {#if !instructionSeen}
    <div class="instruction pulse" transition:fade={{ duration: 400 }}>
      <span class="inst-jp">探す</span>
      <span class="inst-divider">·</span>
      <span class="inst-text">Click a lantern to reveal its scroll · Release into the night</span>
    </div>
  {:else if allReleased}
    <div class="instruction done" transition:fade={{ duration: 600 }}>
      <span class="inst-jp">すべて</span>
      <span class="inst-divider">·</span>
      <span class="inst-text">All skills set free into the night</span>
    </div>
  {:else}
    <div class="instruction seen" transition:fade={{ duration: 300 }}>
      <span class="inst-text">{remaining} lantern{remaining !== 1 ? 's' : ''} remaining</span>
    </div>
  {/if}

  <div class="lantern-field">
    {#each skills as s, i}
      {@const sz = sizes[s.weight]}
      {@const isOpen = openScroll === i}
      {@const isReleased = released.has(i)}

      <div class="lantern-anchor" style="left:{s.x}%; bottom:{s.y}%;">

        <canvas class="ember-canvas" bind:this={canvasEls[i]}
          style="width:120px;height:120px;"></canvas>

        {#if isReleased}
          <div
            class="lantern-mover"
            style="
              animation:
                sway {swayDur[i]}s {swayDelay[i]}s ease-in-out infinite alternate,
                bob  {bobDur[i]}s  {bobDelay[i]}s ease-in-out infinite alternate
                {finale ? `, finaleRise 3.5s ${finaleStagger[i]}s cubic-bezier(0.25,0.46,0.45,0.94) forwards` : ''};
              --fdx: {finaleX[i]}px;
            "
          >
            <div class="string ghost-string" style="height:{sz*0.35}px;"></div>
            <div class="lantern lantern-ghost" style="width:{sz}px;height:{sz*1.4}px;">
              <svg class="lantern-svg" viewBox="0 0 60 84" style="width:{sz}px;height:{sz*1.4}px;">
                <rect x="20" y="5"  width="20" height="8"  rx="3" fill="rgba(201,168,76,0.18)"/>
                <ellipse cx="30" cy="13" rx="13" ry="3.5"         fill="rgba(201,168,76,0.12)"/>
                <path d="M10 20 Q8 48 10 68 L50 68 Q52 48 50 20 Z"
                  fill="rgba(16,10,4,0.55)" stroke="rgba(201,168,76,0.18)" stroke-width="1.4"/>
                <path d="M10 30 Q30 26 50 30" fill="none" stroke="rgba(201,168,76,0.07)" stroke-width="0.8"/>
                <path d="M9  44 Q30 40 51 44" fill="none" stroke="rgba(201,168,76,0.07)" stroke-width="0.8"/>
                <path d="M10 58 Q30 54 50 58" fill="none" stroke="rgba(201,168,76,0.07)" stroke-width="0.8"/>
                <text x="30" y="51" text-anchor="middle" font-family="serif"
                  font-size="{sz > 50 ? 20 : 16}" fill="rgba(201,168,76,0.22)">{s.kanji}</text>
                <ellipse cx="30" cy="67" rx="13" ry="3.5"         fill="rgba(201,168,76,0.1)"/>
                <rect x="20" y="67" width="20" height="7"  rx="3" fill="rgba(201,168,76,0.15)"/>
                {#each Array(6) as _, fi}
                  <line x1={13+fi*7} y1="74" x2={12+fi*7+(fi%2)*2} y2={80+(fi%3)*3}
                    stroke="rgba(201,168,76,0.12)" stroke-width="0.9"/>
                {/each}
              </svg>
            </div>
          </div>

        {:else}
          <div class="lantern-mover" style="
            animation:
              sway {swayDur[i]}s {swayDelay[i]}s ease-in-out infinite alternate,
              bob  {bobDur[i]}s  {bobDelay[i]}s ease-in-out infinite alternate;
          ">
            <div class="string" style="height:{sz*0.35}px;"></div>

            <button
              class="lantern"
              class:is-open={isOpen}
              style="width:{sz}px;height:{sz*1.4}px;"
              on:click|stopPropagation={() => toggleScroll(i)}
              aria-label="{s.name} — click to reveal"
              aria-expanded={isOpen}
            >
              <div class="glow-aura" class:on={isOpen}></div>
              <svg class="lantern-svg" viewBox="0 0 60 84">
                <rect x="20" y="5"  width="20" height="8"  rx="3" fill="rgba(201,168,76,0.72)"/>
                <ellipse cx="30" cy="13" rx="13" ry="3.5"         fill="rgba(201,168,76,0.45)"/>
                <path d="M10 20 Q8 48 10 68 L50 68 Q52 48 50 20 Z"
                  fill="rgba(16,10,4,0.9)" stroke="rgba(201,168,76,0.6)" stroke-width="1.4"/>
                <path d="M10 30 Q30 26 50 30" fill="none" stroke="rgba(201,168,76,0.2)"  stroke-width="0.8"/>
                <path d="M9  44 Q30 40 51 44" fill="none" stroke="rgba(201,168,76,0.2)"  stroke-width="0.8"/>
                <path d="M10 58 Q30 54 50 58" fill="none" stroke="rgba(201,168,76,0.2)"  stroke-width="0.8"/>
                <ellipse cx="30" cy="44" rx="14" ry="19" fill="rgba(200,110,20,0.13)"/>
                <ellipse cx="30" cy="44" rx="7"  ry="10" fill="rgba(220,150,40,0.10)"/>
                <text x="30" y="51" text-anchor="middle" font-family="serif"
                  font-size="{sz > 50 ? 20 : 16}" fill="rgba(201,168,76,0.93)">{s.kanji}</text>
                <ellipse cx="30" cy="67" rx="13" ry="3.5"         fill="rgba(201,168,76,0.38)"/>
                <rect x="20" y="67" width="20" height="7"  rx="3" fill="rgba(201,168,76,0.65)"/>
                {#each Array(6) as _, fi}
                  <line x1={13+fi*7} y1="74" x2={12+fi*7+(fi%2)*2} y2={80+(fi%3)*3}
                    stroke="rgba(201,168,76,0.45)" stroke-width="0.9"/>
                {/each}
              </svg>
            </button>

          </div>
        {/if}

      </div>
    {/each}
  </div>

  <!-- ── FLOATING PANEL ── -->
  {#if openSkill}
    <div
      class="float-panel"
      transition:fade={{ duration: 200 }}
      role="dialog"
      aria-modal="true"
      aria-label="{openSkill.name} skill panel"
    >
      <button class="panel-close" on:click|stopPropagation={() => openScroll = null} aria-label="Close">✕</button>
      <span class="panel-kanji">{openSkill.kanji}</span>
      <div class="panel-rule"></div>
      <span class="panel-name">{openSkill.name}</span>
      <span class="panel-weight">{openSkill.weight}</span>
      <div class="panel-rule thin"></div>
      <span class="panel-haiku">{openSkill.haiku}</span>
      <button
        class="panel-release"
        on:click|stopPropagation={() => release(openScroll)}
        aria-label="Release {openSkill.name} into the night"
      >↑ release</button>
    </div>
  {/if}

</div>

<style>
  .room-yakimono {
    width: 100%; height: 100%;
    position: relative; overflow: hidden;
    display: flex; flex-direction: column; align-items: center;
  }

  .sky {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse at 76% 8%,  rgba(40,18,80,0.38) 0%, transparent 55%),
      radial-gradient(ellipse at 14% 92%, rgba(10,28,16,0.22) 0%, transparent 45%);
  }
  .star {
    position: absolute; background: rgba(230,220,200,0.9);
    border-radius: 50%; animation: twinkle linear infinite alternate;
  }
  @keyframes twinkle {
    from { opacity: inherit; transform: scale(1); }
    to   { opacity: 0.04;   transform: scale(0.4); }
  }
  .moon {
    position: absolute; top: 5%; right: 6%;
    width: 50px; height: 50px; border-radius: 50%;
    background: radial-gradient(circle at 36% 36%, #f8f0d8, #c8a84b 50%, transparent 100%);
    opacity: 0.22; box-shadow: 0 0 24px 6px rgba(201,168,76,0.06);
    transition: opacity 1.8s ease, box-shadow 1.8s ease;
  }
  .moon.moon-bright {
    opacity: 0.75;
    box-shadow: 0 0 48px 18px rgba(201,168,76,0.22), 0 0 90px 40px rgba(201,168,76,0.08);
  }
  .wind-layer {
    position: absolute; inset: 0; pointer-events: none;
    background: repeating-linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.012) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: wind 14s linear infinite;
  }
  @keyframes wind {
    from { background-position: 200% 0; }
    to   { background-position: -200% 0; }
  }

  .page-header {
    position: relative; z-index: 10;
    text-align: center; padding-top: 42px; pointer-events: none;
  }
  .page-title {
    font-family: var(--font-serif);
    font-size: clamp(30px, 4vw, 46px);
    color: rgba(201,168,76,0.82); letter-spacing: 0.18em;
  }
  .page-sub {
    font-family: var(--font-mono); font-size: 9px;
    letter-spacing: 0.35em; color: rgba(201,168,76,0.3);
    text-transform: uppercase; margin-top: 6px;
  }

  .instruction {
    position: relative; z-index: 20; margin-top: 16px;
    display: flex; align-items: center; gap: 9px;
    background: rgba(8,11,22,0.72);
    border: 1px solid rgba(201,168,76,0.18);
    border-radius: 99px; padding: 7px 20px;
    backdrop-filter: blur(8px);
    transition: border-color 0.4s, box-shadow 0.4s;
  }
  .instruction.pulse { animation: pillPulse 2.8s ease-in-out infinite alternate; }
  .instruction.done  { border-color: rgba(201,168,76,0.5); }
  .instruction.seen  { opacity: 0.55; }
  @keyframes pillPulse {
    from { box-shadow: none;                             border-color: rgba(201,168,76,0.15); }
    to   { box-shadow: 0 0 16px rgba(201,168,76,0.14);  border-color: rgba(201,168,76,0.4);  }
  }
  .inst-jp      { font-family: var(--font-serif); font-size: 13px; color: rgba(201,168,76,0.9); letter-spacing: 0.1em; }
  .inst-divider { color: rgba(201,168,76,0.3); font-size: 10px; }
  .inst-text    { font-family: var(--font-mono); font-size: 8.5px; color: rgba(230,220,195,0.52); letter-spacing: 0.16em; }

  .lantern-field { position: absolute; inset: 0; pointer-events: none; }
  .lantern-anchor {
    position: absolute; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center;
    pointer-events: none;
  }
  .ember-canvas {
    position: absolute; bottom: 0; left: 50%;
    transform: translateX(-50%); pointer-events: none; z-index: 30;
  }
  .lantern-mover {
    display: flex; flex-direction: column; align-items: center;
    transform-origin: top center; position: relative;
  }
  @keyframes sway {
    from { transform: rotate(-3.5deg); }
    to   { transform: rotate( 3.5deg); }
  }
  @keyframes bob {
    from { transform: translateY(0); }
    to   { transform: translateY(-12px); }
  }
  @keyframes finaleRise {
    0%   { transform: translateY(0)      translateX(0)                    scale(1);    opacity: 0.32; }
    15%  { opacity: 0.65; }
    60%  { transform: translateY(-55vh)  translateX(var(--fdx))           scale(0.72); opacity: 0.5;  }
    100% { transform: translateY(-105vh) translateX(calc(var(--fdx)*1.6)) scale(0.25); opacity: 0;    }
  }

  .string {
    width: 1px;
    background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.45));
  }
  .ghost-string { opacity: 0.08 !important; }

  .lantern {
    position: relative; background: none; border: none;
    cursor: pointer; padding: 0; pointer-events: all;
    transition: transform 0.25s;
  }
  .lantern:hover   { transform: scale(1.08); }
  .lantern.is-open { transform: scale(1.05); }
  .lantern-ghost   { cursor: default; pointer-events: none; opacity: 0.38; }

  .lantern-svg {
    width: 100%; height: 100%;
    filter: drop-shadow(0 0 5px rgba(201,120,30,0.28));
    transition: filter 0.3s;
  }
  .lantern:hover .lantern-svg,
  .lantern.is-open .lantern-svg {
    filter:
      drop-shadow(0 0 18px rgba(201,140,30,0.7))
      drop-shadow(0 0 40px rgba(201,100,20,0.35));
  }
  .glow-aura {
    position: absolute; inset: -35%; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,130,30,0.2) 0%, transparent 70%);
    opacity: 0; pointer-events: none; transition: opacity 0.4s;
  }
  .glow-aura.on { opacity: 1; }

  /* ── FLOATING PANEL ── */
  .float-panel {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 200;
    width: 400px;
    background: rgba(9, 12, 20, 0.97);
    border: 1px solid rgba(201,168,76,0.14);
    padding: 40px 24px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    pointer-events: all;
    animation: panelIn 0.28s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes panelIn {
    from { opacity: 0; transform: translate(-50%, calc(-50% + 8px)); }
    to   { opacity: 1; transform: translate(-50%, -50%); }
  }

  .panel-close {
    position: absolute; top: 10px; right: 14px;
    background: none; border: none; cursor: pointer;
    font-family: var(--font-mono); font-size: 9px;
    color: rgba(201,168,76,0.28); letter-spacing: 0.1em;
    transition: color 0.2s;
  }
  .panel-close:hover { color: rgba(201,168,76,0.7); }

  .panel-kanji {
    font-family: var(--font-serif);
    font-size: 64px; line-height: 1;
    color: rgba(201,168,76,0.92);
    text-shadow:
      0 0 18px rgba(201,140,30,0.55),
      0 0 40px rgba(201,100,20,0.25);
  }
  .panel-rule {
    width: 50%; height: 1px;
    background: rgba(201,168,76,0.14);
    margin: 2px 0;
  }
  .panel-rule.thin { background: rgba(201,168,76,0.07); }

  .panel-name {
    font-family: var(--font-serif);
    font-size: 13px; color: rgba(230,220,195,0.78);
    letter-spacing: 0.08em; text-align: center;
  }
  .panel-weight {
    font-family: var(--font-mono);
    font-size: 7px; letter-spacing: 0.32em; text-transform: uppercase;
    color: rgba(201,168,76,0.28);
    margin-top: -4px;
  }
  .panel-haiku {
    font-family: var(--font-mono);
    font-size: 8px; line-height: 2;
    color: rgba(230,220,195,0.36);
    letter-spacing: 0.04em; text-align: center;
    white-space: pre-line; margin-top: 4px;
  }
  .panel-release {
    margin-top: 10px;
    background: none;
    border: 1px solid rgba(201,168,76,0.22);
    padding: 5px 18px;
    font-family: var(--font-mono);
    font-size: 7.5px; letter-spacing: 0.22em; text-transform: uppercase;
    color: rgba(201,168,76,0.5); cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .panel-release:hover {
    border-color: rgba(201,168,76,0.6);
    color: rgba(201,168,76,0.9);
    background: rgba(201,168,76,0.05);
  }
</style>
<script>
  import { onMount, onDestroy } from 'svelte';
  import { haikuFound, markHaikuFound } from '$lib/stores/state.js';

  const TOTAL_SPREADS = 5;
  let currentSpread = 0;
  let isFlipping = false;
  let flipDir = 1; 
  let visitedSpreads = new Set([0]);
  let flowerVisible = false;

  let typedNotes = ['', '', '', '', ''];
  let noteTimers = [];

  const MARGIN_NOTES = [
    'writes CSS at 2am\nfor fun ✦',
    'once debugged 6hrs —\nmissing semicolon 💀',
    'thinks in components\neven in dreams',
    'the cat is named\nKumo ☁️',
    'more coming\nsoon.',
  ];

  const FUN_FACTS = [
    {  fact: 'Building orbital mechanics\nsimulators for fun' },
    { fact: 'Has watched Spirited Away\nmore than 20 times' },
    { fact: 'Cried while watching\nDeath Note'
 },
    { fact: 'Most productive\nbetween midnight and 3am' },
    { fact: 'Convinced the portfolio cat\nis watching you right now' },
  
  ];

  function typeNote(spreadIdx) {
    const note = MARGIN_NOTES[spreadIdx] ?? '';
    let i = 0;
    typedNotes[spreadIdx] = '';
    const timer = setInterval(() => {
      typedNotes[spreadIdx] += note[i] ?? '';
      typedNotes = [...typedNotes];
      i++;
      if (i >= note.length) clearInterval(timer);
    }, 38);
    noteTimers.push(timer);
  }

  function goToSpread(idx) {
    if (isFlipping || idx === currentSpread || idx < 0 || idx >= TOTAL_SPREADS) return;
    flipDir = idx > currentSpread ? 1 : -1;
    isFlipping = true;

    if (currentSpread === 1 && idx === 2) {
      setTimeout(() => { flowerVisible = true; }, 300);
      setTimeout(() => { flowerVisible = false; }, 2800);
    }

    setTimeout(() => {
      currentSpread = idx;
      visitedSpreads = new Set([...visitedSpreads, idx]);
      isFlipping = false;
      typeNote(idx);
    }, 520);
  }

  function next() { goToSpread(currentSpread + 1); }
  function prev() { goToSpread(currentSpread - 1); }

  function onKey(e) {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  }

  $: isCoverFace = currentSpread === 0;
  $: isBackCover = currentSpread === TOTAL_SPREADS - 1;
  $: isInnerSpread = !isCoverFace && !isBackCover;

  onMount(() => {
    window.addEventListener('keydown', onKey);
    typeNote(0);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', onKey);
    noteTimers.forEach(clearInterval);
  });
</script>

{#if flowerVisible}
  <div class="fallen-flower" aria-hidden="true">
    <svg width="48" height="60" viewBox="0 0 48 60" fill="none">
      <path d="M24,58 Q22,40 24,20" stroke="#6b8c3a" stroke-width="1.2" stroke-linecap="round" fill="none"/>
      {#each Array(5) as _, i}
        <ellipse
          cx={24 + Math.cos((i/5)*Math.PI*2)*10}
          cy={20 + Math.sin((i/5)*Math.PI*2)*10}
          rx="7" ry="4"
          fill="rgba(220,160,180,0.75)"
          stroke="rgba(180,100,130,0.4)"
          stroke-width="0.5"
          transform="rotate({(i/5)*360} {24 + Math.cos((i/5)*Math.PI*2)*10} {20 + Math.sin((i/5)*Math.PI*2)*10})"
        />
      {/each}
      <circle cx="24" cy="20" r="4" fill="rgba(240,200,80,0.8)" stroke="rgba(200,150,40,0.4)" stroke-width="0.5"/>
      <path d="M24,42 Q16,36 18,30 Q22,38 24,42Z" fill="#6b8c3a" opacity="0.7"/>
    </svg>
  </div>
{/if}

<div class="room-zensai">
  <div class="book-glow" aria-hidden="true"></div>

  <div class="book-scene">
    <div
      class="book-wrap"
      class:flipping={isFlipping}
      class:flip-forward={flipDir===1}
      class:flip-backward={flipDir===-1}
      class:is-cover={isCoverFace}
      class:is-backcover={isBackCover}
    >
      <div
        class="book-spine"
        class:spine-left={isCoverFace}
        class:spine-right={isBackCover}
        aria-hidden="true"
      >
        <span class="spine-title">月夜物語</span>
        <span class="spine-author">Lee Yousuf</span>
        <div class="spine-groove"></div>
        <div class="spine-groove"></div>
        <div class="spine-groove"></div>
      </div>

      {#if isInnerSpread}
        <div class="page-stack page-stack-right" aria-hidden="true"></div>
        <div class="page-stack page-stack-left"  aria-hidden="true"></div>
      {/if}

      {#if currentSpread === 0}
        <div class="spread spread-cover" role="region" aria-label="Book cover">
          <div class="cover-cloth">
            <div class="cloth-texture" aria-hidden="true"></div>
            <div class="cover-border" aria-hidden="true">
              <svg width="100%" height="100%" viewBox="0 0 340 480" fill="none" preserveAspectRatio="none">
                <rect x="8"  y="8"  width="324" height="464" stroke="#c9a060" stroke-width="1.2" opacity="0.6"/>
                <rect x="16" y="16" width="308" height="448" stroke="#c9a060" stroke-width="0.6" opacity="0.35"/>
                {#each [[16,16],[324,16],[16,464],[324,464]] as [cx,cy]}
                  <circle cx={cx} cy={cy} r="5" fill="none" stroke="#c9a060" stroke-width="0.8" opacity="0.6"/>
                  <circle cx={cx} cy={cy} r="2" fill="#c9a060" opacity="0.4"/>
                {/each}
                <polygon points="170,22 176,32 170,38 164,32" fill="none" stroke="#c9a060" stroke-width="0.8" opacity="0.5"/>
              </svg>
            </div>

            <div class="cover-content">
              <div class="cover-jp" aria-label="Tsukiyo Monogatari">月夜物語</div>
              <div class="cover-divider" aria-hidden="true">
                <svg width="120" height="12" viewBox="0 0 120 12" fill="none">
                  <line x1="0" y1="6" x2="48" y2="6" stroke="#c9a060" stroke-width="0.8" opacity="0.5"/>
                  <polygon points="60,2 66,6 60,10 54,6" fill="#c9a060" opacity="0.6"/>
                  <line x1="72" y1="6" x2="120" y2="6" stroke="#c9a060" stroke-width="0.8" opacity="0.5"/>
                </svg>
              </div>
              <div class="cover-subtitle">A Moonlit Night's Tale</div>
              <div class="cover-author">Lee Yousuf</div>
              <div class="cover-moon" aria-hidden="true">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="30" fill="rgba(201,160,96,0.08)" stroke="#c9a060" stroke-width="0.8" opacity="0.5"/>
                  <circle cx="40" cy="40" r="20" fill="rgba(201,160,96,0.12)" stroke="#c9a060" stroke-width="0.5" opacity="0.4"/>
                  <text x="40" y="48" text-anchor="middle" font-family="Noto Serif JP,serif" font-size="22" fill="rgba(201,160,96,0.5)">月</text>
                </svg>
              </div>
              <button class="cover-open-btn" on:click={next} aria-label="Open book">Open ›</button>
            </div>
            {#if visitedSpreads.has(1)}
              <div class="dog-ear dog-ear-br" aria-hidden="true"></div>
            {/if}
          </div>
        </div>
      {:else if currentSpread === 1}
        <div class="spread spread-two" role="region" aria-label="About Lee Yousuf">
          <div class="page page-left">
            <div class="page-number" aria-hidden="true">1</div>
            <div class="chapter-header">
              <span class="chapter-num" aria-hidden="true">壱</span>
              <h2 class="chapter-title">Who is Lee?</h2>
              <div class="chapter-rule" aria-hidden="true"></div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">
           <div class="ink-portrait" aria-label="Portrait of Lee Yousuf" role="img">
  <img src="/pic.jpg" alt="Lee Yousuf" style="width:100%; height:100%; object-fit:cover; border-radius:2px; filter: sepia(0.2) contrast(1.05);" />
</div>
</div>
            <div class="page-caption">Portrait · Ink on paper · 2025</div>
            <button
              class="haiku-fragment"
              class:found={$haikuFound[1]}
              on:click={() => markHaikuFound(1)}
              aria-label="Discover hidden text"
            >a door found ajar</button>
            <div class="margin-note margin-note-left" aria-hidden="true">{typedNotes[1]}</div>
          </div>
          <div class="page page-right">
            <div class="page-number" aria-hidden="true">2</div>
            <blockquote class="big-pull-quote">
              "The browser is my canvas.<br/>
              Engineering is my<br/>
              <em>language.</em>"
            </blockquote>
            <div class="body-text">
              <p>Lee Yousuf arrived at Stanford to study Electrical Engineering and Aerospace — systems that govern satellites, circuits that think.</p>
              <p>Where classmates wrote problem sets, Lee built interfaces that solved them visually.</p>
    
              <p>She is currently at Stanford, simultaneously debugging orbital mechanics and making sure the hover states are perfect.</p>
            </div>
            <div class="info-stamp">
              <div class="stamp-row"><span class="stamp-key">Currently</span><span class="stamp-val">Stanford University</span></div>
              <div class="stamp-row"><span class="stamp-key">Major</span><span class="stamp-val">EE + Aerospace</span></div>
   
              <div class="stamp-row"><span class="stamp-key">Status</span><span class="stamp-val" style="color:var(--vermillion)">Open to work ✦</span></div>
            </div>
            {#if visitedSpreads.has(2)}
              <div class="dog-ear dog-ear-br" aria-hidden="true"></div>
            {/if}
          </div>
        </div>
      {:else if currentSpread === 2}
        <div class="spread spread-two" role="region" aria-label="Fun facts and timeline">
        <div class="page page-left">
  <div class="page-number" aria-hidden="true">3</div>
  <div class="chapter-header">
    <span class="chapter-num" aria-hidden="true">弐</span>
    <h2 class="chapter-title">Fun Facts</h2>
    <div class="chapter-rule" aria-hidden="true"></div>
  </div>
            <div class="fun-facts-grid">
              {#each FUN_FACTS as ff, i}
              <div class="fun-fact-card" style="animation-delay:{i*0.1}s">
  <span class="ff-text">{ff.fact}</span>
</div>
              {/each}
            </div>
            <div class="pressed-flower-shadow" aria-hidden="true">
              <svg width="60" height="70" viewBox="0 0 60 70" fill="none" opacity="0.18">
                <path d="M30,68 Q28,50 30,28" stroke="#6b8c3a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                {#each Array(5) as _, i}
                  <ellipse cx={30+Math.cos((i/5)*Math.PI*2)*12} cy={28+Math.sin((i/5)*Math.PI*2)*12} rx="9" ry="4"
                    fill="rgba(180,100,130,0.6)"
                    transform="rotate({(i/5)*360} {30+Math.cos((i/5)*Math.PI*2)*12} {28+Math.sin((i/5)*Math.PI*2)*12})"/>
                {/each}
                <circle cx="30" cy="28" r="5" fill="rgba(220,180,60,0.7)"/>
              </svg>
              <div class="flower-caption">A flower found between these pages</div>
            </div>
            <div class="margin-note margin-note-left" aria-hidden="true">{typedNotes[2]}</div>
          </div>
          <div class="page page-right">
            <div class="page-number" aria-hidden="true">4</div>
            <div class="chapter-header">
              <span class="chapter-num" aria-hidden="true">三</span>
              <h2 class="chapter-title">Timeline</h2>
              <div class="chapter-rule" aria-hidden="true"></div>
            </div>
            <div class="timeline-path" role="list" aria-label="Career timeline">
              <svg class="path-svg" viewBox="0 0 260 320" fill="none" aria-hidden="true">
                <path d="M40,20 Q180,20 180,80 Q180,140 40,140 Q40,200 180,200 Q180,260 40,260 Q40,300 130,300"
                  stroke="rgba(28,20,16,0.15)" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/>
              </svg>
              <div class="tl-items">
                {#each [
               
                  {year:'2019', label:'First line of code', note:'it was an alert()'},
                  {year:'2021', label:'First project shipped', note:'it crashed on mobile'},
                  {year:'2025', label:'Stanford', note:'where engineering met art'},
                  {year:'2026', label:'Tsukiyo', note:'this very portfolio'},
                  {year:'2031', label:'Graduation', note:'what comes next?'},
                ] as item, i}
                  <div class="tl-item" style="animation-delay:{i*0.12}s" role="listitem">
                    <span class="tl-year">{item.year}</span>
                    <span class="tl-dot" aria-hidden="true">◆</span>
                    <div class="tl-content">
                      <span class="tl-label">{item.label}</span>
                      <span class="tl-note">{item.note}</span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
            {#if visitedSpreads.has(3)}
              <div class="dog-ear dog-ear-br" aria-hidden="true"></div>
            {/if}
          </div>
        </div>
      {:else if currentSpread === 3}
        <div class="spread spread-two" role="region" aria-label="Projects">
          <div class="page page-left">
            <div class="page-number" aria-hidden="true">5</div>
            <div class="chapter-header">
              <span class="chapter-num" aria-hidden="true">四</span>
              <h2 class="chapter-title">Selected Works</h2>
              <div class="chapter-rule" aria-hidden="true"></div>
            </div>
            {#each [
             {title:'EventSphere', tech:'React · MongoDB · PostgreSQL', desc:'Interactive event management with calendar views, RSVP flows, and real-time attendee presence.', tape:'top-left', rot:'-1.2deg', href:'https://eventspheres.vercel.app/', repo:'https://github.com/lateefaayesufu/EventSphere'},
{title:'Cloud 9 Travels', tech:'HTML · CSS · JavaScript', desc:'A travel website where every destination feels like a dream worth chasing.', tape:'top-right', rot:'0.8deg', href:'https://cloud9travels.netlify.app/', repo:'https://github.com/lateefaayesufu/Cloud-9'},
            ] as p, i}
              <a href={p.href} target="_blank" rel="noopener"
                class="clipping"
                style="transform:rotate({p.rot}); animation-delay:{i*0.15}s"
                aria-label="Project: {p.title}"
              >
                <div class="tape tape-{p.tape}" aria-hidden="true"></div>
                <div class="clipping-title">{p.title}</div>
                <div class="clipping-tech">{p.tech}</div>
                <div class="clipping-desc">{p.desc}</div>
                <div class="clipping-link">Visit →</div>
              </a>
            {/each}
            <div class="margin-note margin-note-left" aria-hidden="true">{typedNotes[3]}</div>
          </div>
          <div class="page page-right">
            <div class="page-number" aria-hidden="true">6</div>
           {#each [
 
{
  title: 'Nexus Dashboard',
  tech: 'Vue · ECharts · Tailwind',
  desc: 'A real-time data visualization platform with live WebGL charts, streaming pipelines, and a customizable widget system. Built for teams who need to see everything, instantly.',
  tape: 'top-right',
  rot: '-0.7deg',
  href: 'https://ccnexuswatch.vercel.app/',
  repo: 'https://github.com/lateefaayesufu/nexuswatch'
},
  {
    title: 'Whisperbox',
    tech: 'WebSockets · TypeScript · E2E Encryption',
    desc: 'A real-time encrypted messaging app. Messages vanish. Identities stay anonymous. Built for conversations never meant to be kept.',
    tape: 'top-right',
    rot: '0.8deg',
    href: 'https://ccwhisper.vercel.app/',
    repo: 'https://github.com/lateefaayesufu/whisper'
  },
  {
    title: 'Tsuki — Portfolio',
    tech: 'SvelteKit · Canvas · CSS physics',
    desc: 'This portfolio. A moonlit Japanese inn as a navigable web experience — no images, only SVG and Canvas.',
    tape: 'top-left',
    rot: '0.5deg',
    href: 'https://tsukiyo.vercel.app',
    repo: 'https://github.com/lateefaayesufu/tsuki',
    featured: true
  },
] as p, i}
              <a href={p.href} target="_blank" rel="noopener"
                class="clipping"
                class:featured={p.featured}
                style="transform:rotate({p.rot}); animation-delay:{i*0.15}s"
                aria-label="Project: {p.title}"
              >
                <div class="tape tape-{p.tape}" aria-hidden="true"></div>
                {#if p.featured}<div class="clipping-featured-badge">You are here ✦</div>{/if}
                <div class="clipping-title">{p.title}</div>
                <div class="clipping-tech">{p.tech}</div>
                <div class="clipping-desc">{p.desc}</div>
                <div class="clipping-link">{p.featured ? '← you\'re here' : 'Visit →'}</div>
              </a>
            {/each}
            {#if visitedSpreads.has(4)}
              <div class="dog-ear dog-ear-br" aria-hidden="true"></div>
            {/if}
          </div>
        </div>
      {:else if currentSpread === 4}
        <div class="spread spread-cover spread-backcover" role="region" aria-label="Back cover">
          <div class="cover-cloth cover-back">
            <div class="cloth-texture" aria-hidden="true"></div>
            <div class="cover-border" aria-hidden="true">
              <svg width="100%" height="100%" viewBox="0 0 340 480" fill="none" preserveAspectRatio="none">
                <rect x="8" y="8" width="324" height="464" stroke="#c9a060" stroke-width="1.2" opacity="0.6"/>
                <rect x="16" y="16" width="308" height="448" stroke="#c9a060" stroke-width="0.6" opacity="0.35"/>
              </svg>
            </div>
            <div class="backcover-content">
              <div class="skills-section">
                <div class="skills-header">Skills · 技術</div>
                <div class="skills-list">
                  {#each [
                    {name:'SvelteKit',  pct:95},
                    {name:'React',      pct:90},
                    {name:'TypeScript', pct:88},
                    {name:'CSS/SCSS',   pct:93},
                    {name:'Canvas API', pct:85},
                    {name:'Three.js',   pct:75},
                    {name:'Node.js',    pct:80},
                  ] as s}
                    <div class="skill-row" aria-label="{s.name} — {s.pct}%">
                      <span class="skill-name">{s.name}</span>
                      <div class="skill-bar-wrap" aria-hidden="true">
                        <div class="skill-bar-fill" style="width:{s.pct}%"></div>
                        {#each [25,50,75,100] as tick}
                          <div class="skill-tick" style="left:{tick}%"></div>
                        {/each}
                      </div>
                      <span class="skill-pct">{s.pct}</span>
                    </div>
                  {/each}
                </div>
              </div>
              
              <div class="secret-note" aria-hidden="true">
                <span class="secret-note-text">{typedNotes[4]}</span>
              </div>
              <div class="backcover-tagline">
                <p>"I build things that feel impossible."</p>
                <p class="backcover-sub">— Lee Yousuf · Stanford · 2025</p>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="book-nav" role="navigation" aria-label="Book page navigation">
      <button
        class="book-nav-btn"
        on:click={prev}
        disabled={currentSpread === 0 || isFlipping}
        aria-label="Previous page"
      >‹ Prev</button>

      <div class="book-dots" role="tablist" aria-label="Jump to page">
        {#each Array(TOTAL_SPREADS) as _, i}
          <button
            class="book-dot"
            class:active={currentSpread === i}
            class:visited={visitedSpreads.has(i)}
            on:click={() => goToSpread(i)}
            role="tab"
            aria-selected={currentSpread === i}
            aria-label="Page {i === 0 ? 'Cover' : i === TOTAL_SPREADS-1 ? 'Back cover' : i}"
          ></button>
        {/each}
      </div>

      <button
        class="book-nav-btn"
        on:click={next}
        disabled={currentSpread === TOTAL_SPREADS - 1 || isFlipping}
        aria-label="Next page"
      >Next ›</button>
    </div>

    <div class="spread-label" aria-live="polite">
      {#if currentSpread === 0}Cover
      {:else if currentSpread === TOTAL_SPREADS - 1}Back Cover
      {:else}Spread {currentSpread} of {TOTAL_SPREADS - 2}
      {/if}
    </div>
  </div>
</div>

<style>
  .room-zensai {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    overflow: hidden;
    position: relative;
   
    cursor: default;
  }

  .book-glow {
    position: absolute;
    width: 700px; height: 400px;
    background: radial-gradient(ellipse, rgba(220,190,140,0.12) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    animation: breathe 6s ease-in-out infinite;
  }

  .book-scene {
    display: flex; flex-direction: column;
    align-items: center; gap: 20px;
    width: 100%; height: 100%;
    justify-content: center;
  }

  .book-wrap {
    position: relative;
  
  width: min(960px, 96vw);  
  height: min(620px, 82vh);  
    display: flex;
    transform-style: preserve-3d;
    perspective: 1800px;
    filter: drop-shadow(0 20px 60px rgba(0,0,0,0.55)) drop-shadow(0 4px 12px rgba(0,0,0,0.4));
    transition: filter 0.4s;
  }

  .book-wrap.is-cover {
    transform: perspective(1800px) rotateY(4deg);
    filter: drop-shadow(-8px 20px 60px rgba(0,0,0,0.65)) drop-shadow(0 4px 12px rgba(0,0,0,0.4));
  }
  .book-wrap.is-backcover {
    transform: perspective(1800px) rotateY(-4deg);
    filter: drop-shadow(8px 20px 60px rgba(0,0,0,0.65)) drop-shadow(0 4px 12px rgba(0,0,0,0.4));
  }

  .book-wrap.flipping.flip-forward  { animation: flipForward  0.52s cubic-bezier(0.4,0,0.2,1); }
  .book-wrap.flipping.flip-backward { animation: flipBackward 0.52s cubic-bezier(0.4,0,0.2,1); }

  @keyframes flipForward {
    0%   { transform: perspective(1800px) rotateY(0deg); }
    40%  { transform: perspective(1800px) rotateY(-8deg) translateZ(8px); }
    100% { transform: perspective(1800px) rotateY(0deg); }
  }
  @keyframes flipBackward {
    0%   { transform: perspective(1800px) rotateY(0deg); }
    40%  { transform: perspective(1800px) rotateY(8deg) translateZ(8px); }
    100% { transform: perspective(1800px) rotateY(0deg); }
  }

  .page-stack {
    position: absolute;
    top: 2px; bottom: 2px;
    width: 6px;
    background: repeating-linear-gradient(
      to bottom,
      var(--paper, #f0e8d0) 0px, var(--paper, #f0e8d0) 2px,
      var(--paper2, #e8dfc4) 2px, var(--paper2, #e8dfc4) 4px
    );
    z-index: 0;
  }
  .page-stack-right { right: -5px; border-radius: 0 2px 2px 0; }
  .page-stack-left  { left:  -5px; border-radius: 2px 0 0 2px; }

  .book-spine {
    position: absolute; top: 0; bottom: 0; width: 18px;
    background: linear-gradient(to right, #2a1e10, #3d2e1a, #2a1e10);
    z-index: 30; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 8px;
    box-shadow: -2px 0 8px rgba(0,0,0,0.4), 2px 0 8px rgba(0,0,0,0.4);
    left: 50%; transform: translateX(-50%);
  }
  .book-spine.spine-left { left: 0; transform: none; border-radius: 2px 0 0 2px; box-shadow: -1px 0 4px rgba(0,0,0,0.5), 3px 0 10px rgba(0,0,0,0.35); }
  .book-spine.spine-right { left: auto; right: 0; transform: none; border-radius: 0 2px 2px 0; box-shadow: 1px 0 4px rgba(0,0,0,0.5), -3px 0 10px rgba(0,0,0,0.35); }

  .spine-title { writing-mode: vertical-rl; font-family: var(--font-serif); font-size: 9px; color: rgba(201,160,96,0.6); letter-spacing: 0.2em; }
  .spine-author { writing-mode: vertical-rl; font-family: var(--font-mono); font-size: 7px; color: rgba(201,160,96,0.35); letter-spacing: 0.15em; }
  .spine-groove { width: 10px; height: 1px; background: rgba(201,160,96,0.2); border-radius: 1px; }

  .spread { position: absolute; inset: 0; display: flex; animation: pageReveal 0.4s ease; }
  @keyframes pageReveal { from{opacity:0;transform:scale(0.99)} to{opacity:1;transform:scale(1)} }

  .spread-cover { justify-content: center; }
  .cover-cloth { position: absolute; top: 0; bottom: 0; left: 18px; right: 0; background: linear-gradient(135deg, #2a1e10 0%, #3d2e1a 40%, #2a1e10 100%); border-radius: 0 6px 6px 0; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .cover-back  { left: 0; right: 18px; background: linear-gradient(135deg, #1e1408 0%, #2e2010 100%); border-radius: 6px 0 0 6px; }
  .cloth-texture { position: absolute; inset: 0; background-image: repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px), repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px); pointer-events: none; }
  .cover-border { position: absolute; inset: 12px; pointer-events: none; }
  .cover-content { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 15px; z-index: 2; width: 80%; }
  .cover-jp { font-family: var(--font-serif); font-size: 3.2rem; color: #c9a060; letter-spacing: 0.1em; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4)); }
  .cover-divider { height: 12px; }
  .cover-subtitle { font-family: var(--font-mono); font-size: 0.75rem; color: rgba(201,160,96,0.7); text-transform: uppercase; letter-spacing: 0.25em; }
  .cover-author { font-family: var(--font-serif); font-size: 0.95rem; color: #c9a060; margin-top: 5px; }
  .cover-moon { margin-top: 10px; }
  .cover-open-btn { background: none; border: 1px solid rgba(201,160,96,0.4); color: #c9a060; font-family: var(--font-mono); font-size: 0.65rem; padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: 0.2s; margin-top: 15px; text-transform: uppercase; letter-spacing: 0.1em; }
  .cover-open-btn:hover { background: rgba(201,160,96,0.12); border-color: #c9a060; transform: translateY(-2px); }

.page { 
  flex: 1; 
  background-color: var(--paper, #f0e8d0); 
  position: relative; 
  padding: 40px 40px 60px;  
  overflow: hidden; 
  box-shadow: inset 0 0 40px rgba(0,0,0,0.05); 
  display: flex; 
  flex-direction: column;
  justify-content: flex-start;  
}
  .page-left { border-radius: 4px 0 0 4px; border-right: 1px solid rgba(0,0,0,0.05); }
  .page-right { border-radius: 0 4px 4px 0; border-left: 1px solid rgba(0,0,0,0.05); }
  .page-number { position: absolute; bottom: 20px; font-family: var(--font-mono); font-size: 0.65rem; color: rgba(0,0,0,0.3); width: 100%; text-align: center; left: 0; }
  .chapter-header { margin-bottom: 25px; }
  .chapter-num { font-family: var(--font-serif); font-size: 1rem; color: var(--vermillion, #c0392b); display: block; margin-bottom: 2px; }
  .chapter-title { font-family: var(--font-serif); font-size: 1.6rem; color: #2a1e10; margin: 0; }
  .chapter-rule { width: 40px; height: 2px; background: #2a1e10; margin-top: 8px; opacity: 0.8; }

  .ink-portrait { 
  width: 140px; 
  height: 180px; 
  margin: 20px auto 15px; 
}
  .page-caption { font-family: var(--font-mono); font-size: 0.55rem; color: rgba(0,0,0,0.4); text-align: center; font-style: italic; }
  .big-pull-quote { font-family: var(--font-serif); font-size: 1.45rem; line-height: 1.3; color: #1c1410; margin: 0 0 25px 0; border-left: 3px solid var(--vermillion); padding-left: 20px; font-style: italic; }
  .big-pull-quote em { color: var(--vermillion); font-style: normal; font-weight: bold; }
  .body-text p { font-family: var(--font-serif); font-size: 0.82rem; line-height: 1.6; color: #3d2e1a; margin-bottom: 12px; }

 .info-stamp { 
  margin-top: 20px;  
  border: 1px dashed rgba(28,20,16,0.2); 
  padding: 12px; 
  border-radius: 4px; 
  background: rgba(255,255,255,0.3); 
  animation: stampIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
}
  .stamp-row { display: flex; justify-content: space-between; font-size: 0.65rem; margin-bottom: 4px; }
  .stamp-key { font-family: var(--font-mono); color: rgba(0,0,0,0.4); text-transform: uppercase; }
  .stamp-val { font-family: var(--font-serif); color: #1c1410; font-weight: 600; }

  .dog-ear { position: absolute; width: 0; height: 0; border-style: solid; opacity: 0.7; }
  .dog-ear-br { bottom: 0; right: 0; border-width: 0 0 25px 25px; border-color: transparent transparent var(--paper2, #e8dfc4) transparent; filter: drop-shadow(-2px -2px 2px rgba(0,0,0,0.05)); }

  .fun-facts-grid { display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 10px; }
  .fun-fact-card { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: rgba(255,255,255,0.4); border-radius: 4px; border-left: 2px solid #c9a060; animation: slideUp 0.5s ease both; }
  .ff-icon { font-size: 1rem; }
  .ff-text { font-family: var(--font-mono); font-size: 0.6rem; line-height: 1.4; color: #3d2e1a; }
  .pressed-flower-shadow { margin-top: auto; display: flex; flex-direction: column; align-items: center; gap: 5px; padding-bottom: 15px; }
  .flower-caption { font-family: var(--font-mono); font-size: 0.5rem; color: rgba(0,0,0,0.3); text-transform: uppercase; letter-spacing: 0.1em; }

  .timeline-path { position: relative; height: 300px; }
  .path-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .tl-items { position: relative; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 10px 0; }
  .tl-item { display: flex; align-items: flex-start; gap: 12px; animation: fadeIn 0.8s ease both; }
  .tl-year { font-family: var(--font-mono); font-size: 0.6rem; color: var(--vermillion); font-weight: bold; width: 30px; margin-top: 2px; }
  .tl-dot { font-size: 0.5rem; color: #2a1e10; margin-top: 4px; }
  .tl-label { font-family: var(--font-serif); font-size: 0.75rem; font-weight: bold; color: #1c1410; display: block; }
  .tl-note { font-family: var(--font-mono); font-size: 0.55rem; color: rgba(0,0,0,0.5); display: block; margin-top: 1px; }

  .clipping { display: block; background: #faf8f0; padding: 15px; margin-bottom: 18px; box-shadow: 2px 5px 15px rgba(0,0,0,0.08); position: relative; transition: 0.3s; text-decoration: none; border: 1px solid rgba(0,0,0,0.03); animation: slideUp 0.6s ease both; }
  .clipping:hover { transform: scale(1.02) rotate(0deg) !important; box-shadow: 5px 12px 25px rgba(0,0,0,0.12); z-index: 10; }
  .clipping.featured { border: 1px solid var(--vermillion); }
  .clipping-featured-badge { position: absolute; top: -8px; right: 10px; background: var(--vermillion); color: white; font-family: var(--font-mono); font-size: 0.45rem; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
  .tape { position: absolute; width: 40px; height: 14px; background: rgba(220,190,140,0.25); backdrop-filter: blur(1px); z-index: 2; }
  .tape-top-left { top: -6px; left: -10px; transform: rotate(-35deg); }
  .tape-top-right { top: -6px; right: -10px; transform: rotate(35deg); }
  .clipping-title { font-family: var(--font-serif); font-size: 0.95rem; font-weight: bold; color: #1c1410; margin-bottom: 2px; }
  .clipping-tech { font-family: var(--font-mono); font-size: 0.5rem; color: var(--vermillion); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
  .clipping-desc { font-family: var(--font-serif); font-size: 0.68rem; line-height: 1.4; color: #3d2e1a; margin-bottom: 8px; }
  .clipping-link { font-family: var(--font-mono); font-size: 0.55rem; color: rgba(0,0,0,0.4); text-align: right; text-transform: uppercase; font-weight: bold; }

  .backcover-content { position: relative; z-index: 2; width: 85%; height: 85%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; }
  .skills-section { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(201,160,96,0.15); padding: 20px; border-radius: 4px; }
  .skills-header { font-family: var(--font-serif); font-size: 1rem; color: #c9a060; margin-bottom: 15px; text-align: center; letter-spacing: 0.1em; }
  .skills-list { display: flex; flex-direction: column; gap: 10px; }
  .skill-row { display: flex; align-items: center; gap: 12px; }
 .skill-name { 
  font-family: var(--font-mono); 
  font-size: 0.6rem; 
  color: rgba(201,160,96,0.8); 
  width: 75px; 
  white-space: nowrap;   /* ADD THIS */
  text-transform: uppercase; 
}
  .skill-bar-wrap { flex: 1; height: 4px; background: rgba(201,160,96,0.1); border-radius: 2px; position: relative; }
.skill-bar-fill { 
  height: 100%; 
  background: linear-gradient(to right, #8b2020, #c9a060); 
  border-radius: 2px;
  position: relative;
  overflow: hidden;
  animation: barGrow 1s ease both;
}

.skill-bar-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
  animation: shimmer 2.5s ease-in-out infinite;
  animation-delay: 1s;
}
  .skill-tick { position: absolute; top: 0; width: 1px; height: 100%; background: rgba(201,160,96,0.2); }
  .skill-pct { font-family: var(--font-mono); font-size: 0.55rem; color: rgba(201,160,96,0.5); width: 20px; text-align: right; }

  .wax-seal { filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)); transition: 0.3s; cursor: help; }
  .wax-seal:hover { transform: scale(1.05) rotate(5deg); }
  .secret-note { position: absolute; bottom: 80px; width: 100%; text-align: center; }
  .secret-note-text { font-family: var(--font-mono); font-size: 0.5rem; color: rgba(201,160,96,0.2); letter-spacing: 0.1em; white-space: pre-wrap; }
  .backcover-tagline { text-align: center; }
  .backcover-tagline p { font-family: var(--font-serif); font-size: 0.85rem; color: #c9a060; font-style: italic; margin: 0; }
  .backcover-sub { font-family: var(--font-mono); font-size: 0.55rem; opacity: 0.5; margin-top: 5px !important; letter-spacing: 0.1em; }

  .book-nav { display: flex; align-items: center; gap: 25px; margin-top: 10px; z-index: 10; }
  .book-nav-btn { background: none; border: 1px solid rgba(240,232,208,0.1); color: rgba(240,232,208,0.5); font-family: var(--font-mono); font-size: 0.65rem; padding: 6px 14px; border-radius: 4px; cursor: pointer; transition: 0.2s; text-transform: uppercase; letter-spacing: 0.1em; }
  .book-nav-btn:hover:not(:disabled) { background: rgba(240,232,208,0.05); color: #f0e8d0; border-color: rgba(240,232,208,0.3); }
  .book-nav-btn:disabled { opacity: 0.2; cursor: default; }

  .book-dots { display: flex; gap: 10px; }
  .book-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(240,232,208,0.15); border: none; cursor: pointer; padding: 0; transition: 0.3s; }
  .book-dot.active { background: var(--vermillion); transform: scale(1.4); box-shadow: 0 0 10px rgba(192,57,43,0.5); }
  .book-dot.visited:not(.active) { background: rgba(240,232,208,0.4); }

  .haiku-fragment { display: inline-block; background: none; border: none; border-bottom: 1px dashed rgba(28,20,16,0.2); font-family: var(--font-serif); font-size: 0.75rem; color: rgba(28,20,16,0.4); padding: 0 2px; cursor: pointer; margin: 20px auto 0; transition: 0.4s; }
  .haiku-fragment.found { color: var(--vermillion); border-bottom: 1px solid var(--vermillion); background: rgba(192,57,43,0.05); padding: 2px 8px; border-radius: 2px; }

  .margin-note { 
    position: absolute; 
    top: 120px; 
    width: 80px; 
    font-family: var(--font-mono); 
    font-size: 0.48rem; 
    line-height: 1.4; 
    color: rgba(28,20,16,0.25); 
    white-space: pre-wrap; 
    pointer-events: auto; 
    transition: all 0.3s ease;
    cursor: help;
  }
  .margin-note-left { 
    left: -90px; 
    text-align: right; 
    border-right: 1px solid rgba(28,20,16,0.1); 
    padding-right: 10px; 
  }
  .margin-note:hover {
    color: var(--vermillion);
    opacity: 1 !important;
    transform: scale(1.05);
    text-shadow: 0 0 8px rgba(192,57,43,0.2);
  }

  .spread-label { font-family: var(--font-mono); font-size: 0.58rem; color: rgba(240,232,208,0.2); letter-spacing: 0.14em; text-transform: uppercase; }

  .fallen-flower { position: fixed; z-index: 1000; animation: flowerFall 2.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards; pointer-events: none; top: 20%; left: 50%; }
  @keyframes flowerFall {
    0%   { transform: translateX(-50%) translateY(-20px) rotate(0deg); opacity: 0; }
    15%  { opacity: 1; }
    100% { transform: translateX(calc(-50% + 80px)) translateY(300px) rotate(180deg); opacity: 0; }
  }

  @media (max-width: 600px) {
  .page { padding: 20px; }
  .big-pull-quote { font-size: 1rem; }
  .chapter-title { font-size: 1.2rem; }
  .body-text p { font-size: 0.72rem; }
  .clipping { padding: 10px; margin-bottom: 12px; }
  .book-nav-btn { padding: 4px 10px; font-size: 0.55rem; }
}

  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }
  @keyframes stampIn { 0%{transform:scale(2);opacity:0} 60%{transform:scale(1);opacity:1} }
  @keyframes barGrow {
  from { width: 0 !important; opacity: 0; }
  to   { opacity: 1; }
}

@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
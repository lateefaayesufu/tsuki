<script>
  import { onMount } from 'svelte';
  import { haikuFound, markHaikuFound } from '$lib/stores/state.js';

  let nameEl;
  let revealed = false;

  onMount(() => {
    setTimeout(() => { revealed = true; }, 200);
  });

  function clickFragment() {
    markHaikuFound(0);
  }
</script>

<div class="room-jo">
  <!-- Large background kanji -->
  <div class="bg-kanji" aria-hidden="true">月夜</div>

  <div class="content" class:revealed>
    <!-- Portrait placeholder-->
    <div class="portrait" aria-label="Ink-wash portrait">
    <img src="/pic.jpg" alt="Lee Yousuf" style="width:100%; height:100%; object-fit:cover;"/>
    </div>

    <h1 class="name">Lee Yousuf</h1>

    <p class="belief " style="max-width: 340px;">
      I build things that feel impossible.<br/>
      Every pixel is a decision. Every interaction, a breath.
    </p>

    <div class="links">
      <a href="https://github.com/leeyousuf" target="_blank" rel="noopener">github</a>
      <span class="sep">·</span>
      <a href="https://linkedin.com/in/lateefaayesufu" target="_blank" rel="noopener">linkedin</a>
      <span class="sep">·</span>
      <a href="/resume.html" target="_blank" rel="noopener">resume</a>
    </div>

    <!-- Hidden haiku fragment-->
    <button
      class="haiku-fragment"
      class:found={$haikuFound[0]}
      on:click={clickFragment}
      aria-label="Discover hidden text"
    >
      ink on still water
    </button>
  </div>


  <div class="particles" aria-hidden="true">
    {#each Array(18) as _, i}
      <div
        class="particle"
        style="
          left: {8 + i * 5.2}%;
          animation-duration: {6 + (i % 5) * 2.4}s;
          animation-delay: {-(i * 1.1)}s;
          opacity: {0.15 + (i % 3) * 0.1};
          width: {2 + (i % 3)}px;
          height: {2 + (i % 3)}px;
        "
      ></div>
    {/each}
  </div>
</div>

<style>
  .room-jo {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  /* BG KANJI */
  .bg-kanji {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-family: var(--font-serif);
    font-size: clamp(120px, 20vw, 220px);
    color: rgba(240,232,208,0.028);
    pointer-events: none;
    user-select: none;
    white-space: nowrap;
    letter-spacing: 0.05em;
  }

  /* CONTENT */
  .content {
    text-align: center;
    position: relative;
    z-index: 2;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 1.4s ease, transform 1.4s ease;
  }
  .content.revealed {
    opacity: 1;
    transform: translateY(0);
  }

  /* PORTRAIT */
  .portrait {
    width: 100px;
    height: 114px;
  
  border: 6px solid var(--paper);
  box-shadow: 4px 4px 20px rgba(0,0,0,0.6);
  transform: rotate(-2deg);
  padding: 6px 6px 28px;  /* polaroid bottom gap */
}
  
  .portrait svg { width: 100%; height: 100%; }

  /* NAME */
  .name {
    font-family: var(--font-display);
    font-size: clamp(40px, 6vw, 80px);
    color: var(--paper);
    letter-spacing: -0.025em;
    line-height: 1;
    margin-bottom: 20px;
    font-weight: 700;
  }

  /* BELIEF */
  .belief {
    font-family: var(--font-mono);
    font-size: clamp(10px, 1.2vw, 13px);
    color: rgba(240,232,208,0.38);
    letter-spacing: 0.14em;
    line-height: 2;
    max-width: 380px;
    margin: 0 auto 36px;
  }

  /* LINKS */
  .links {
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;
    margin-bottom: 48px;
  }
  .links a {
    font-family: var(--font-mono);
    font-size: 9px;
    color: rgba(240,232,208,0.35);
    letter-spacing: 0.22em;
    text-decoration: none;
    text-transform: none;
    border-bottom: 1px solid rgba(240,232,208,0.12);
    padding-bottom: 2px;
    transition: color 0.3s, border-color 0.3s;
  }
  .links a:hover {
    color: var(--amber);
    border-color: var(--amber);
  }
  .sep {
    color: rgba(240,232,208,0.12);
    font-family: var(--font-mono);
    font-size: 9px;
  }

  /* HAIKU FRAGMENT */
  .haiku-fragment {
    display: block;
    background: none;
    border: none;
    font-family: var(--font-mono);
    font-size: 8px;
    color: rgba(240,232,208,0.06);
    letter-spacing: 0.18em;
    cursor: default;
    transition: color 0.6s;
    margin: 0 auto;
    padding: 0;
    text-transform: lowercase;
  }
  .haiku-fragment.found {
    color: rgba(245,200,66,0.45);
    cursor: default;
  }
  .haiku-fragment:hover:not(.found) {
    color: rgba(240,232,208,0.14);
    cursor: pointer;
  }

  /* PARTICLES */
  .particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .particle {
    position: absolute;
    top: -6px;
    border-radius: 50%;
    background: rgba(240,232,208,0.5);
    animation: fall linear infinite;
  }

  @keyframes fall {
    0%   { transform: translateY(-10px) rotate(0deg);   }
    100% { transform: translateY(110vh) rotate(360deg); }
  }
</style>
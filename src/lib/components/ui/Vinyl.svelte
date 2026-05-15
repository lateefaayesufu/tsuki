<script>
  import { musicPlaying, room } from '$lib/stores/state.js';

  const labels = { 0:'新月', 1:'前菜', 2:'造り', 3:'焼き', 4:'満月' };
  $: labelText = labels[$room] || '月夜';

  function toggle() { musicPlaying.update(p => !p); }
</script>

<div class="vinyl" title="Click to toggle music" on:click={toggle} role="button" tabindex="0"
  on:keydown={e => e.key === 'Enter' && toggle()} aria-label="Toggle music">

  <div class="disc" class:playing={$musicPlaying}>
    <div class="groove g1"></div>
    <div class="groove g2"></div>
    <div class="groove g3"></div>
    <div class="label">
      <span class="label-text">{labelText}</span>
    </div>
    <div class="center-hole"></div>
  </div>

  <div class="arm" class:playing={$musicPlaying}></div>

  <div class="track-info">
   love — wave to earth
  </div>
</div>

<style>
  .vinyl {
    position: fixed;
    bottom: 22px; right: 22px;
    width: 84px; height: 84px;
    cursor: pointer;
    z-index: 50;
  }

  .disc {
    width: 84px; height: 84px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      #141414 0deg, #282828 20deg,
      #141414 40deg, #282828 60deg,
      #141414 80deg, #282828 100deg,
      #141414 120deg, #282828 140deg,
      #141414 160deg, #282828 180deg,
      #141414 200deg, #282828 220deg,
      #141414 240deg, #282828 260deg,
      #141414 280deg, #282828 300deg,
      #141414 320deg, #282828 340deg,
      #141414 360deg
    );
    box-shadow: 0 4px 20px rgba(0,0,0,0.6);
    position: relative;
    animation: spin 3.2s linear infinite;
    animation-play-state: paused;
    transition: box-shadow 0.4s;
  }
  .disc.playing {
    animation-play-state: running;
    box-shadow: 0 4px 24px rgba(0,0,0,0.7), 0 0 12px rgba(245,200,66,0.1);
  }

  .groove {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.03);
  }
  .g1 { inset: 8px; }
  .g2 { inset: 18px; }
  .g3 { inset: 28px; }

  .label {
    position: absolute; inset: 28px;
    border-radius: 50%;
    background: radial-gradient(circle, #a82020, var(--vermillion));
    display: flex; align-items: center; justify-content: center;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
  }
  .label-text {
    font-family: var(--font-mono);
    font-size: 5px;
    color: rgba(255,255,255,0.8);
    letter-spacing: 0.08em;
    text-align: center;
    line-height: 1.3;
  }

  .center-hole {
    position: absolute; inset: 40px;
    border-radius: 50%;
    background: #0a0a0a;
  }

  /* TONEARM */
  .arm {
    position: absolute;
    top: 4px; right: 4px;
    width: 32px; height: 4px;
    background: linear-gradient(to left, #999, #777);
    border-radius: 2px;
    transform-origin: right center;
    transform: rotate(-22deg);
    transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 0 1px 4px rgba(0,0,0,0.4);
  }
  .arm::after {
    content: '';
    position: absolute;
    left: 0; top: -2px;
    width: 6px; height: 8px;
    background: #888;
    border-radius: 0 0 3px 3px;
    transform: rotate(5deg);
  }
  .arm.playing { transform: rotate(-38deg); }

  /* TRACK NAME */
  .track-info {
    position: absolute;
    right: calc(100% + 10px);
    bottom: 6px;
    font-family: var(--font-mono);
    font-size: 8px;
    color: rgba(240,232,208,0.28);
    white-space: nowrap;
    text-align: right;
    letter-spacing: 0.08em;
    pointer-events: none;
  }
</style>

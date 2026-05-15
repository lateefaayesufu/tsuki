<script>
  import { crescentPhase } from '$lib/stores/state.js';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';

  const size   = tweened(38, { duration: 2000, easing: cubicInOut });
  const glow   = tweened(0.3, { duration: 2000, easing: cubicInOut });
  const warmth = tweened(0,   { duration: 2000, easing: cubicInOut });

  $: {
    size.set(38 + $crescentPhase * 22);
    glow.set(0.3 + $crescentPhase * 0.7);
    warmth.set($crescentPhase);
  }

  $: r = $size;
  $: innerR = r * 0.78;
  $: offsetX = r * 0.28;
  $: moonColor = lerpColor('#e8e0c8', '#e8c96a', $warmth);

  function lerpColor(a, b, t) {
    const ah = a.replace('#',''), bh = b.replace('#','');
    const ar = parseInt(ah.slice(0,2),16), ag = parseInt(ah.slice(2,4),16), ab = parseInt(ah.slice(4,6),16);
    const br = parseInt(bh.slice(0,2),16), bg = parseInt(bh.slice(2,4),16), bb = parseInt(bh.slice(4,6),16);
    const rr = Math.round(ar + (br-ar)*t);
    const rg = Math.round(ag + (bg-ag)*t);
    const rb = Math.round(ab + (bb-ab)*t);
    return `rgb(${rr},${rg},${rb})`;
  }
</script>

<div class="moon-wrap" style="--glow:{$glow}; --warmth:{$warmth};">
  <svg
    class="moon"
    width={r * 2 + 40}
    height={r * 2 + 40}
    viewBox="0 0 {r*2+40} {r*2+40}"
    aria-label="Crescent moon"
    role="img"
  >
    <defs>
      <mask id="crescent-mask">
        <rect width="100%" height="100%" fill="white"/>
        <circle cx={r + 20 + offsetX} cy={r + 20} r={innerR} fill="black"/>
      </mask>
      <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="{moonColor}" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="{moonColor}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <!-- Glow halo -->
    <circle cx={r+20} cy={r+20} r={r+18} fill="url(#moon-glow)"/>
    <!-- Crescent body -->
    <circle
      cx={r+20} cy={r+20} r={r}
      fill={moonColor}
      mask="url(#crescent-mask)"
      opacity={0.88 + $warmth * 0.12}
    />
  </svg>
</div>

<style>
  .moon-wrap {
    position: absolute;
    top: 48px;
    right: 120px;
    animation: moonDrift 80s linear infinite;
    pointer-events: none;
    filter:
      drop-shadow(0 0 calc(var(--glow) * 28px) rgba(201,168,76,calc(var(--warmth) * 0.55)))
      drop-shadow(0 0 calc(var(--glow) * 8px)  rgba(232,200,110,0.25));
    transition: filter 2s ease;
    z-index: 3;
  }
  .moon { display: block; overflow: visible; }
</style>
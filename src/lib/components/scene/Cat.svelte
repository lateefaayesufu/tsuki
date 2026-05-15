<script>
  import { onMount } from 'svelte';
  import { mx, my, idleSeconds, phase } from '$lib/stores/state.js';

  let catEl;
  let px = 0, py = 0;
  let catBehavior = 'watching';
  let yawning = false;
  let yawnTimeout;
  let visible = true;

  $: visible = $phase !== 'secret';

  let lastMx = 0, lastMy = 0, speed = 0;
  function updateSpeed() {
    speed = Math.sqrt(($mx - lastMx) ** 2 + ($my - lastMy) ** 2);
    lastMx = $mx; lastMy = $my;
  }

  $: { updateSpeed(); if (speed > 30) catBehavior = 'alert'; else if (speed > 5) catBehavior = 'watching'; }
  $: { if ($idleSeconds > 20) catBehavior = 'lying'; else if ($idleSeconds > 10) catBehavior = 'idle'; }

  $: if (catEl) {
    const r = catEl.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const angle = Math.atan2($my - cy, $mx - cx);
    const maxOff = catBehavior === 'lying' ? 0.5 : catBehavior === 'idle' ? 1 : 2;
    px = Math.cos(angle) * maxOff;
    py = Math.sin(angle) * maxOff;
  }

  onMount(() => {
    function scheduleYawn() {
      yawnTimeout = setTimeout(() => {
        if (catBehavior === 'idle' || catBehavior === 'lying') {
          yawning = true;
          setTimeout(() => { yawning = false; scheduleYawn(); }, 1800);
        } else { scheduleYawn(); }
      }, 12000 + Math.random() * 20000);
    }
    scheduleYawn();
    return () => clearTimeout(yawnTimeout);
  });
</script>

{#if visible}
<div
  class="cat"
  class:alert={catBehavior === 'alert'}
  class:idle={catBehavior === 'idle'}
  class:lying={catBehavior === 'lying'}
  class:yawning
  bind:this={catEl}
>
  <!-- upright sitting cat-->
  <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">

    <!-- TAIL-->
    <path d="M38,62 Q58,58 56,72 Q54,80 46,78"
      stroke="#1a1208" stroke-width="4.5" fill="none" stroke-linecap="round" class="tail"/>

    <!-- BODY-->
    <ellipse cx="28" cy="56" rx="16" ry="20" fill="#1a1208"/>

    <!-- FRONT PAWS -->
    <ellipse cx="20" cy="74" rx="6" ry="4" fill="#1a1208"/>
    <ellipse cx="34" cy="74" rx="6" ry="4" fill="#1a1208"/>
    <!-- paw toe lines -->
    <line x1="17" y1="76" x2="17" y2="78" stroke="#2a1e0a" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="20" y1="77" x2="20" y2="79" stroke="#2a1e0a" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="23" y1="76" x2="23" y2="78" stroke="#2a1e0a" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="31" y1="76" x2="31" y2="78" stroke="#2a1e0a" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="34" y1="77" x2="34" y2="79" stroke="#2a1e0a" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="37" y1="76" x2="37" y2="78" stroke="#2a1e0a" stroke-width="0.8" stroke-linecap="round"/>

    <!-- NECK -->
    <rect x="22" y="34" width="12" height="8" rx="4" fill="#1a1208"/>

    <!-- HEAD -->
    <ellipse cx="28" cy="26" rx="14" ry="13" fill="#1a1208"/>

    <!-- EARS — upright triangles -->
    <polygon points="16,18 12,4 22,14" fill="#1a1208"/>
    <polygon points="40,18 48,4 38,14" fill="#1a1208"/>
    <!-- inner ear -->
    <polygon points="17,16 14,7 22,13" fill="#3a2018" opacity="0.55"/>
    <polygon points="39,16 46,7 38,13" fill="#3a2018" opacity="0.55"/>

    <!-- EYES — amber irises -->
    <ellipse cx="22" cy="25" rx="4" ry="{yawning ? 1 : catBehavior === 'lying' ? 1.5 : 3.5}" fill="#f5c842"/>
    <ellipse cx="34" cy="25" rx="4" ry="{yawning ? 1 : catBehavior === 'lying' ? 1.5 : 3.5}" fill="#f5c842"/>
    <!-- pupils — track cursor -->
    <ellipse cx="{22 + px}" cy="{25 + py}" rx="{catBehavior === 'alert' ? 1 : 1.8}" ry="{yawning ? 0.5 : catBehavior === 'lying' ? 1.2 : 3.2}" fill="#1a1208"/>
    <ellipse cx="{34 + px}" cy="{25 + py}" rx="{catBehavior === 'alert' ? 1 : 1.8}" ry="{yawning ? 0.5 : catBehavior === 'lying' ? 1.2 : 3.2}" fill="#1a1208"/>
    <!-- eye shine -->
    <circle cx="{21 + px}" cy="{23 + py}" r="0.9" fill="white" opacity="0.75"/>
    <circle cx="{33 + px}" cy="{23 + py}" r="0.9" fill="white" opacity="0.75"/>

    <!-- NOSE -->
    <polygon points="28,30 26,32.5 30,32.5" fill="#c0392b" opacity="0.85"/>

    <!-- MOUTH -->
    {#if yawning}
      <ellipse cx="28" cy="36" rx="5" ry="3.5" fill="#2a0a0a" opacity="0.85"/>
      <rect x="25" y="37" width="6" height="1" rx="0.5" fill="white" opacity="0.4"/>
    {:else}
      <path d="M26,33.5 Q28,35.5 30,33.5" stroke="rgba(240,232,208,0.3)" stroke-width="0.8" fill="none"/>
    {/if}

    <!-- WHISKERS -->
    <line x1="4"  y1="28" x2="18" y2="29" stroke="rgba(240,232,208,0.38)" stroke-width="0.7"/>
    <line x1="4"  y1="31" x2="18" y2="30" stroke="rgba(240,232,208,0.25)" stroke-width="0.7"/>
    <line x1="5"  y1="26" x2="18" y2="28" stroke="rgba(240,232,208,0.18)" stroke-width="0.6"/>
    <line x1="38" y1="29" x2="54" y2="28" stroke="rgba(240,232,208,0.38)" stroke-width="0.7"/>
    <line x1="38" y1="30" x2="54" y2="31" stroke="rgba(240,232,208,0.25)" stroke-width="0.7"/>
    <line x1="38" y1="28" x2="53" y2="26" stroke="rgba(240,232,208,0.18)" stroke-width="0.6"/>
  </svg>
</div>
{/if}

<style>
  .cat {
    position: absolute;
    top: 16%;
    left: calc(50% + 40px);
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    cursor: pointer;
    filter: drop-shadow(0 4px 16px rgba(0,0,0,0.6));
    z-index: 12;
  }
  .cat.alert   { transform: scale(1.08) translateY(-4px); }
  .cat.idle    { transform: scale(0.97) translateY(2px); }
  .cat.lying   { transform: scale(0.9) translateY(6px) scaleY(0.75); }
  .cat.yawning { transform: scale(1.03) translateY(-2px); }
  .tail { animation: tailWag 4s ease-in-out infinite; transform-origin: 38px 62px; }
  @keyframes tailWag { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(14deg); } }
  .cat.alert .tail { animation-duration: 1.4s; }
  .cat.lying .tail { animation: tailWag 8s ease-in-out infinite; }
</style>
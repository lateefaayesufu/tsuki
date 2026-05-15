<script>
  import { onMount } from 'svelte';
  import { hasOtherVisitor, otherVisitors } from '$lib/stores/presence.js';
  import { fade } from 'svelte/transition';

  
  const footprintPairs = [
    { left: '47.5%', bottom: '9%',  rot: '-8deg'  },
    { left: '48.5%', bottom: '11%', rot: '5deg'   },
    { left: '47%',   bottom: '13%', rot: '-4deg'  },
    { left: '48%',   bottom: '15%', rot: '8deg'   },
    { left: '47.5%', bottom: '17%', rot: '-6deg'  },
  ];

  let visible = false;
  let showDelay;


  $: if ($hasOtherVisitor && !visible) {
    showDelay = setTimeout(() => { visible = true; }, 1200);
  } else if (!$hasOtherVisitor) {
    clearTimeout(showDelay);
    visible = false;
  }
</script>

{#if visible}
  <div class="footprints-wrap" transition:fade={{ duration: 2000 }} aria-hidden="true">
    {#each footprintPairs as fp, i}
      <div
        class="footprint"
        style="
          left: {fp.left};
          bottom: {fp.bottom};
          transform: rotate({fp.rot});
          animation-delay: {i * 0.4}s;
        "
      >
        <!-- Left foot -->
        <svg class="foot left" viewBox="0 0 14 22" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="7" cy="14" rx="5" ry="7" fill="currentColor" opacity="0.7"/>
          <ellipse cx="4"  cy="7"  rx="2.2" ry="2.8" fill="currentColor" opacity="0.6"/>
          <ellipse cx="7"  cy="5"  rx="2"   ry="2.5" fill="currentColor" opacity="0.5"/>
          <ellipse cx="10" cy="6"  rx="2"   ry="2.5" fill="currentColor" opacity="0.5"/>
          <ellipse cx="12" cy="8"  rx="1.8" ry="2.2" fill="currentColor" opacity="0.45"/>
        </svg>
        <!-- Right foot (mirrored) -->
        <svg class="foot right" viewBox="0 0 14 22" xmlns="http://www.w3.org/2000/svg" style="transform:scaleX(-1) translateX(-2px)">
          <ellipse cx="7" cy="14" rx="5" ry="7" fill="currentColor" opacity="0.7"/>
          <ellipse cx="4"  cy="7"  rx="2.2" ry="2.8" fill="currentColor" opacity="0.6"/>
          <ellipse cx="7"  cy="5"  rx="2"   ry="2.5" fill="currentColor" opacity="0.5"/>
          <ellipse cx="10" cy="6"  rx="2"   ry="2.5" fill="currentColor" opacity="0.5"/>
          <ellipse cx="12" cy="8"  rx="1.8" ry="2.2" fill="currentColor" opacity="0.45"/>
        </svg>
      </div>
    {/each}

    <!-- Subtle tooltip — only on hover, very quiet -->
    <div class="presence-hint">
      someone else is here
    </div>
  </div>
{/if}

<style>
  .footprints-wrap {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 6;
  }

  .footprint {
    position: absolute;
    display: flex;
    gap: 3px;
    color: rgba(240, 232, 208, 0.12);
    animation: fadeStep 0.8s ease both;
  }

  .foot {
    width: 10px;
    height: 16px;
    display: block;
  }

  .foot.right {
    margin-top: 10px; 
  }

  .presence-hint {
    position: fixed;
    bottom: 56px;
    left: 22px;
    font-family: var(--font-mono);
    font-size: 7px;
    color: rgba(240, 232, 208, 0.12);
    letter-spacing: 0.22em;
    animation: hintPulse 4s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes fadeStep {
    from { opacity: 0; transform: translateY(4px) rotate(var(--rot, 0deg)); }
    to   { opacity: 1; transform: translateY(0)   rotate(var(--rot, 0deg)); }
  }

  @keyframes hintPulse {
    0%, 100% { opacity: 0; }
    40%, 60%  { opacity: 1; }
  }
</style>

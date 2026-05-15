<script>
  import { onMount } from 'svelte';
  import { windStrength, isInside, room, weather, reducedMotion } from '$lib/stores/state.js';

  let drops = [];
  let raf;
  let canvas, ctx;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const DROP_COUNT = isMobile ? 80 : 220;

  class Drop {
    constructor() { this.reset(); }
    reset() {
      this.x   = Math.random() * window.innerWidth;
      this.y   = Math.random() * -window.innerHeight;
      this.len = Math.random() * 18 + 8;
      this.spd = Math.random() * 4 + 3;
      this.op  = Math.random() * 0.28 + 0.08;
    }
    update(wind) {
      this.y += this.spd;
      this.x += wind * 0.4;
      if (this.y > window.innerHeight || this.x > window.innerWidth + 20) this.reset();
    }
    draw(ctx, wind) {
      ctx.strokeStyle = `rgba(200,220,255,${this.op})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + wind * 0.5, this.y + this.len);
      ctx.stroke();
    }
  }

  function resize() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    resize();
    for (let i = 0; i < DROP_COUNT; i++) drops.push(new Drop());
    window.addEventListener('resize', resize);

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!$reducedMotion) {
        const wind = $windStrength;
        const shouldDraw = $weather === 'rain' && $isInside && $room < 4;
        if (shouldDraw) drops.forEach(d => { d.update(wind); d.draw(ctx, wind); });
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  });

  $: rainActive = $weather === 'rain' && $isInside && $room < 4;
  $: opacity = rainActive ? (0.45 + $windStrength * 0.04) : 0;
  $: ambientOpacity = $weather === 'rain' && $isInside ? 0.12 : 0;
</script>

<canvas
  bind:this={canvas}
  style="position:fixed;inset:0;pointer-events:none;z-index:5;opacity:{opacity};transition:opacity 1.2s;"
></canvas>

<div
  style="position:fixed;inset:0;pointer-events:none;z-index:4;background:rgba(60,90,160,{ambientOpacity});transition:background 2s ease;"
  aria-hidden="true"
></div>

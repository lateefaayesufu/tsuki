<script>
  import { onMount } from 'svelte';

  let canvas, ctx;

  function resize() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  });

  export function sweep(callback) {
    if (!ctx) return callback?.();
    const w = canvas.width, h = canvas.height;
    const duration = 320;
    const start = performance.now();

    function drawStroke(progress) {
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#1c1410';
      ctx.lineWidth   = h * Math.min(progress * 1.8, 1.4);
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
     
      ctx.beginPath();
      ctx.moveTo(0, h * 0.5);
      ctx.bezierCurveTo(
        w * 0.25, h * (0.5 - progress * 0.06),
        w * 0.75, h * (0.5 + progress * 0.04),
        w * progress, h * 0.5
      );
      ctx.stroke();
    }

    function fadeOut() {
      const fadeStart = performance.now();
      function tick(now) {
        const p = Math.min((now - fadeStart) / 280, 1);
        ctx.clearRect(0, 0, w, h);
        if (p < 1) {
          ctx.globalAlpha = 1 - p;
          drawStroke(1);
          requestAnimationFrame(tick);
        } else {
          ctx.globalAlpha = 1;
          ctx.clearRect(0, 0, w, h);
        }
      }
      requestAnimationFrame(tick);
    }

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      drawStroke(p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        callback?.();
        setTimeout(fadeOut, 40);
      }
    }
    requestAnimationFrame(tick);
  }
</script>

<canvas
  bind:this={canvas}
  style="position:fixed;inset:0;z-index:150;pointer-events:none;"
></canvas>

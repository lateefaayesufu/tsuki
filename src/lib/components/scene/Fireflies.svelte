<script>
  import { onMount } from 'svelte';
  import { mx, my, idleSeconds, room, isInside, weather } from '$lib/stores/state.js';

  let canvas, ctx;
  let flies = [];
  let raf;

  class Fly {
    constructor() {
      this.x   = Math.random() * window.innerWidth;
      this.y   = 100 + Math.random() * (window.innerHeight - 200);
      this.vx  = (Math.random() - 0.5) * 0.7;
      this.vy  = (Math.random() - 0.5) * 0.7;
      this.life= 0;
      this.max = 250 + Math.random() * 350;
      this.sz  = Math.random() * 2.2 + 0.8;
      this.phase = Math.random() * Math.PI * 2;
    }
    update(curX, curY) {
      const dx = curX - this.x, dy = curY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 130) { this.vx -= (dx / dist) * 0.025; this.vy -= (dy / dist) * 0.025; }
      this.vx += (Math.random() - 0.5) * 0.12;
      this.vy += (Math.random() - 0.5) * 0.12;
      this.vx *= 0.97; this.vy *= 0.97;
      this.x += this.vx; this.y += this.vy;
      this.life++;
      if (this.x < 0 || this.x > window.innerWidth)  this.vx *= -1;
      if (this.y < 0 || this.y > window.innerHeight)  this.vy *= -1;
      return this.life < this.max;
    }
    draw(ctx, t) {
      const prog  = this.life / this.max;
      const fade  = prog < 0.12 ? prog / 0.12 : prog > 0.88 ? 1 - (prog - 0.88) / 0.12 : 1;
      const pulse = 0.55 + 0.45 * Math.sin(t * 3 + this.phase);
      const alpha = fade * pulse;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.sz, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,225,90,${alpha * 0.85})`;
      ctx.fill();
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.sz * 4);
      grd.addColorStop(0, `rgba(245,220,80,${alpha * 0.12})`);
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.sz * 4, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.016;

    
      const activeRoom = $isInside && ($room === 0 || $weather === 'still');
      if (activeRoom) {
        flies = flies.filter(f => f.update($mx, $my));
        flies.forEach(f => f.draw(ctx, t));
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  });


  $: if ($isInside && $room === 0) {
    const idle = $idleSeconds;
    if (idle === 8  && flies.length < 2)  flies.push(new Fly());
    if (idle === 13 && flies.length < 4)  flies.push(new Fly());
    if (idle === 18 && flies.length < 8)  { flies.push(new Fly()); flies.push(new Fly()); }
  }


  $: if ($weather === 'still' && $isInside && flies.length < 6) {
    for (let i = flies.length; i < 8; i++) setTimeout(() => flies.push(new Fly()), i * 200);
  }

  export function spawnFireflies(n = 3) {
    for (let i = 0; i < n; i++) setTimeout(() => flies.push(new Fly()), i * 300);
  }
</script>

<canvas bind:this={canvas} style="position:fixed;inset:0;pointer-events:none;z-index:8;"></canvas>

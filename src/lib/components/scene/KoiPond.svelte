<script>
  import { onMount } from 'svelte';
  import { mx, my } from '$lib/stores/state.js';

  let canvas, ctx;

  let ripples = [];
  let pads = [];
  let caustics = [];
  let raf;
  let t = 0;


  const PATTERNS = [
    { body: '#e8c090', p1: '#c0392b', p2: '#901a10' },
    { body: '#f0e8c8', p1: '#1a1a1a', p2: '#c0392b' },
    { body: '#ead4a0', p1: '#d4782a', p2: '#c8601a' },
    { body: '#f0ddc0', p1: '#c0392b', p2: '#700808' },
    { body: '#e8e8e0', p1: '#8b6020', p2: '#c0a040' },
  ];

  class Koi {
    constructor(opts = {}) {
      const pat       = PATTERNS[opts.pi ?? Math.floor(Math.random() * PATTERNS.length)];
      this.pat        = pat;
      this.x          = opts.x ?? (1100 + (Math.random() - 0.5) * 100);
      this.y          = opts.y ?? (138  + (Math.random() - 0.5) * 44);
      this.vx         = (Math.random() - 0.5) * 0.6;
      this.vy         = (Math.random() - 0.5) * 0.3;
      this.len        = 18 + Math.random() * 12;
      this.phase      = Math.random() * Math.PI * 2;
      this.speed      = 0.45 + Math.random() * 0.45;
      this.angle      = Math.atan2(this.vy, this.vx);
      this.cx = 1100; this.cy = 138;
      this.rx = 68;   this.ry = 30;
      this.depth      = 0.3 + Math.random() * 0.6;
      this.depthPhase = Math.random() * Math.PI * 2;
      this.pox        = (Math.random() - 0.5) * 0.36;
      this.poy        = (Math.random() - 0.5) * 0.24;
      this.psc        = 0.28 + Math.random() * 0.2;
    }

    update(curX, curY, dt) {
      const dx = curX - this.x, dy = curY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 90 && dist > 0) {
        this.vx -= (dx / dist) * 0.07;
        this.vy -= (dy / dist) * 0.045;
      }
      this.vx += (Math.random() - 0.5) * 0.04;
      this.vy += (Math.random() - 0.5) * 0.025;
      const spd = Math.hypot(this.vx, this.vy);
      if (spd > this.speed) { this.vx = (this.vx/spd)*this.speed; this.vy = (this.vy/spd)*this.speed; }
      this.x += this.vx;
      this.y += this.vy;
      const nx = (this.x - this.cx) / this.rx;
      const ny = (this.y - this.cy) / this.ry;
      if (nx*nx + ny*ny > 0.82) {
        this.vx -= nx * 0.09; this.vy -= ny * 0.07;
        this.x = this.cx + nx * 0.82 * this.rx;
        this.y = this.cy + ny * 0.82 * this.ry;
      }
      this.angle = Math.atan2(this.vy, this.vx) * 0.15 + this.angle * 0.85;
      this.phase      += dt * (3.2 + this.speed);
      this.depthPhase += dt * 0.38;
      this.depth = 0.25 + 0.4 * (0.5 + 0.5 * Math.sin(this.depthPhase));
    }

    draw(ctx, t) {
      const L   = this.len;
      const W   = L * 0.34;
      const wag = Math.sin(this.phase) * (4 + this.speed * 2.5);
      const da  = 0.52 + (1 - this.depth) * 0.48;
      const blr = this.depth * 0.9;

      ctx.save();
      ctx.globalAlpha = da;
      if (blr > 0.35) ctx.filter = `blur(${blr.toFixed(1)}px)`;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      // tail fan
      ctx.beginPath();
      ctx.moveTo(-L*0.38, 0);
      ctx.quadraticCurveTo(-L*0.78, wag*1.4, -L*0.96, wag*0.85);
      ctx.quadraticCurveTo(-L*0.78, -wag*0.45, -L*0.38, 0);
      ctx.fillStyle = this.pat.body + '77'; ctx.fill();

      // tail join
      ctx.beginPath();
      ctx.moveTo(-L*0.38, 0);
      ctx.quadraticCurveTo(-L*0.66, wag, -L*0.86, wag*0.55);
      ctx.quadraticCurveTo(-L*0.66, 0, -L*0.38, 0);
      ctx.fillStyle = this.pat.body + 'aa'; ctx.fill();

      // body
      ctx.beginPath();
      ctx.ellipse(L*0.06, 0, L*0.5, W*0.5, 0, 0, Math.PI*2);
      ctx.fillStyle = this.pat.body + 'ee'; ctx.fill();

      // main patch
      ctx.beginPath();
      ctx.ellipse(L*this.pox, L*this.poy*0.4, L*this.psc, W*this.psc*0.68, 0.3, 0, Math.PI*2);
      ctx.fillStyle = this.pat.p1 + 'cc'; ctx.fill();

      // second patch
      ctx.beginPath();
      ctx.ellipse(L*(this.pox-0.18), L*this.poy*0.22, L*this.psc*0.55, W*this.psc*0.5, -0.2, 0, Math.PI*2);
      ctx.fillStyle = this.pat.p2 + '88'; ctx.fill();

      // shimmer
      const sh = (1 - this.depth)*0.18 + 0.05 + Math.sin(t*2.4 + this.phase)*0.03;
      ctx.beginPath();
      ctx.ellipse(L*0.1, -W*0.12, L*0.2, W*0.11, -0.3, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${sh})`; ctx.fill();

      // dorsal fin
      ctx.beginPath();
      ctx.moveTo(L*0.18, -W*0.46);
      ctx.quadraticCurveTo(0, -W*0.75, -L*0.15, -W*0.44);
      ctx.lineTo(-L*0.15, -W*0.40);
      ctx.quadraticCurveTo(0, -W*0.53, L*0.18, -W*0.42);
      ctx.closePath();
      ctx.fillStyle = this.pat.body + '88'; ctx.fill();

      // pectoral fins
      [-1,1].forEach(s => {
        ctx.beginPath();
        ctx.moveTo(L*0.08, s*W*0.42);
        ctx.quadraticCurveTo(L*0.20, s*W*0.65, L*0.30, s*W*0.43);
        ctx.quadraticCurveTo(L*0.18, s*W*0.35, L*0.08, s*W*0.42);
        ctx.fillStyle = this.pat.body + '77'; ctx.fill();
      });

      // eye
      ctx.beginPath();
      ctx.arc(L*0.36, -W*0.11, W*0.09, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(16,6,2,0.9)'; ctx.fill();
      ctx.beginPath();
      ctx.arc(L*0.372, -W*0.13, W*0.038, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();

      ctx.filter = 'none';
      ctx.restore();
    }
  }

  // ── RIPPLE ───────────────────────────────────────────────────
  class Ripple {
    constructor(x, y, str = 1) {
      this.x = x; this.y = y; this.str = str;
      this.rings = [
        { r: 2,   life: 0, delay: 0  },
        { r: 1.2, life: 0, delay: 8  },
        { r: 0.6, life: 0, delay: 16 },
      ];
      this.max = 70; this.frame = 0;
    }
    update() {
      this.frame++;
      this.rings.forEach(rg => {
        if (this.frame >= rg.delay) { rg.r += 0.9 * this.str; rg.life++; }
      });
      return this.frame < this.max + 16;
    }
    draw(ctx) {
      this.rings.forEach(rg => {
        if (this.frame < rg.delay) return;
        const p = rg.life / this.max;
        const a = Math.max(0, (1 - p) * 0.28 * this.str);
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, rg.r, rg.r * 0.46, 0, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(155,200,230,${a})`;
        ctx.lineWidth = 0.75 * (1 - p*0.5);
        ctx.stroke();
      });
    }
  }

  // ── LILY PAD ─────────────────────────────────────────────────
  class LilyPad {
    constructor(x, y, r, angle) {
      this.x = x; this.y = y; this.r = r; this.angle = angle;
      this.wobble = Math.random() * Math.PI * 2;
      this.ws     = 0.28 + Math.random() * 0.22;
    }
    draw(ctx, t) {
      ctx.save();
      ctx.translate(this.x, this.y + Math.sin(t*this.ws + this.wobble)*0.5);
      ctx.rotate(this.angle);
      ctx.beginPath();
      ctx.arc(0, 0, this.r, 0.22, Math.PI*2 - 0.22);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(35,72,28,0.78)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(25,52,20,0.5)';
      ctx.lineWidth = 0.4;
      ctx.stroke();
      for (let i = 0; i < 7; i++) {
        const a = (i/7)*Math.PI*1.82 + 0.22;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a)*this.r*0.88, Math.sin(a)*this.r*0.88);
        ctx.strokeStyle = 'rgba(55,100,40,0.2)';
        ctx.lineWidth = 0.35;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.ellipse(this.r*0.14, -this.r*0.18, this.r*0.26, this.r*0.13, -0.4, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(130,195,85,0.12)';
      ctx.fill();
      ctx.restore();
    }
  }

  // ── CAUSTIC ──────────────────────────────────────────────────
  class Caustic {
    constructor() { this.reset(); }
    reset() {
      this.x = 1100 + (Math.random()-0.5)*110;
      this.y = 138  + (Math.random()-0.5)*46;
      this.r = 3 + Math.random()*9;
      this.life = 0;
      this.max  = 65 + Math.random()*105;
      this.ph   = Math.random()*Math.PI*2;
    }
    update() { this.life++; if (this.life > this.max) this.reset(); }
    draw(ctx) {
      const p = this.life / this.max;
      const a = Math.sin(p * Math.PI) * 0.055;
      const s = 0.75 + Math.sin(this.ph + this.life*0.045)*0.28;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.r*s, this.r*s*0.46, 0, 0, Math.PI*2);
      ctx.fillStyle = `rgba(195,228,255,${a})`;
      ctx.fill();
    }
  }

  let prevMx = 0, prevMy = 0, rippleTimer = 0;

  onMount(() => {
    ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);



    pads = [
      new LilyPad(1042, 132,  8.5, 0.42),
      new LilyPad(1152, 146,  7.0, -0.28),
      new LilyPad(1112, 118,  6.0,  1.1),
    ];

    caustics = Array.from({ length: 18 }, () => {
      const c = new Caustic();
      c.life = Math.floor(Math.random() * c.max);
      return c;
    });

    let last = performance.now();

    function loop(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now; t += dt;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── SAME transform as original ──
      const scaleX = canvas.width  / 1440;
      const scaleY = canvas.height * 0.35 / 200;
      const offY   = canvas.height * 0.65;

      const curX = $mx / scaleX;
      const curY = ($my - offY) / scaleY;

      // ripple spawning
      rippleTimer -= dt;
      const distToPond = Math.hypot(curX - 1100, (curY - 138) * 2);
      if (distToPond < 80 && rippleTimer <= 0) {
        const spd = Math.hypot($mx - prevMx, $my - prevMy);
        if (spd > 3) {
          ripples.push(new Ripple(
            Math.max(1040, Math.min(1160, curX)),
            Math.max(110,  Math.min(166,  curY)),
            0.9
          ));
          rippleTimer = 0.35;
        }
      }
      prevMx = $mx; prevMy = $my;

      if (Math.random() < 0.007) {
        ripples.push(new Ripple(
          1080 + Math.random()*40,
          128  + Math.random()*18,
          0.45
        ));
      }

      ctx.save();
      ctx.scale(scaleX, scaleY);
      ctx.translate(0, offY / scaleY);

      // ── POND BASE (replaces original flat shimmer) ──
      const grad = ctx.createRadialGradient(1085, 132, 0, 1100, 138, 78);
      grad.addColorStop(0,   'rgba(16,48,82,0.84)');
      grad.addColorStop(0.6, 'rgba(10,28,55,0.90)');
      grad.addColorStop(1,   'rgba(5,15,35,0.94)');
      ctx.beginPath();
      ctx.ellipse(1100, 138, 74, 36, 0, 0, Math.PI*2);
      ctx.fillStyle = grad; ctx.fill();

      // rim
      ctx.beginPath();
      ctx.ellipse(1100, 138, 74, 36, 0, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(70,50,30,0.5)';
      ctx.lineWidth = 1.5; ctx.stroke();

      // inner rim highlight
      ctx.beginPath();
      ctx.ellipse(1098, 137, 71, 34, 0, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(120,95,55,0.14)';
      ctx.lineWidth = 0.8; ctx.stroke();

      // animated sheen
      const sheen = 0.04 + Math.sin(t*1.3)*0.012 + Math.sin(t*2.7)*0.006;
      ctx.beginPath();
      ctx.ellipse(1100, 138, 74, 36, 0, 0, Math.PI*2);
      ctx.fillStyle = `rgba(130,175,218,${sheen})`; ctx.fill();

      // ── CLIP interior ──
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(1100, 138, 72, 34, 0, 0, Math.PI*2);
      ctx.clip();

      // caustics
      caustics.forEach(c => { c.update(); c.draw(ctx); });

      // moon reflection
      const refY   = 125;
      const wobble = Math.sin(t*0.75)*1.0 + Math.sin(t*1.9)*0.4;
      const rDist  = Math.min(ripples.length*0.6, 3);
      const rg2 = ctx.createRadialGradient(1100, refY, 0, 1100, refY, 12+rDist);
      rg2.addColorStop(0,   `rgba(245,215,130,${0.22 - rDist*0.028})`);
      rg2.addColorStop(0.5, 'rgba(245,200,80,0.06)');
      rg2.addColorStop(1,   'rgba(245,200,80,0)');
      ctx.beginPath();
      ctx.ellipse(1100, refY, 12+rDist, (12+rDist)*0.46, 0, 0, Math.PI*2);
      ctx.fillStyle = rg2; ctx.fill();
      for (let i = 0; i < 5; i++) {
        const sx = 1100 + (wobble + rDist*0.4)*(i%2?1:-1)*0.25;
        const sy = refY + i*3.8;
        const a  = Math.max(0, (0.10 - i*0.018)*(1 - rDist*0.08));
        ctx.beginPath();
        ctx.ellipse(sx, sy, 2.0 - i*0.25, 0.85, 0, 0, Math.PI*2);
        ctx.fillStyle = `rgba(245,215,130,${a})`; ctx.fill();
      }

      // ripples
      ripples = ripples.filter(r => r.update());
      ripples.forEach(r => r.draw(ctx));

    

      ctx.restore(); 

      // lily pads 
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(1100, 138, 76, 38, 0, 0, Math.PI*2);
      ctx.clip();
      pads.forEach(p => p.draw(ctx, t));
      ctx.restore();

      ctx.restore();

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  });
</script>

<canvas
  bind:this={canvas}
  style="position:fixed;inset:0;pointer-events:none;z-index:6;"
  aria-hidden="true"
></canvas>
<script>
  export let duration = '3.2s';
  export let delay    = '0s';
  export let lit      = true;
  export let size     = 1;
  export let windFactor = 0;
  export let morseActive = false;

  
  const MORSE = [
    // L: ·−··
    {on:200},{off:200},{on:600},{off:200},{on:200},{off:200},{on:200},
    {off:600},
    // Y: −·−−
    {on:600},{off:200},{on:200},{off:200},{on:600},{off:200},{on:600},
    {off:2000}, 
  ];

  let morseLit = true;
  let morseTimeout;

  function runMorse() {
    let i = 0;
    function step() {
      if (i >= MORSE.length) { i = 0; }
      const { on, off } = MORSE[i];
      if (on !== undefined)  { morseLit = true;  morseTimeout = setTimeout(() => { morseLit = false; i++; step(); }, on); }
      if (off !== undefined) { morseLit = false; morseTimeout = setTimeout(() => { i++; step(); }, off); }
    }
    step();
  }

  $: if (morseActive) { runMorse(); } else { clearTimeout(morseTimeout); morseLit = true; }

  $: displayLit = lit && (morseActive ? morseLit : true);
</script>

<div class="lantern" style="--sway:{duration}; --delay:{delay}; --wind:{windFactor * 12}deg; --size:{size}">
  <div class="string"></div>
  <div class="cap"></div>
  <div class="body" class:unlit={!displayLit}>
    <div class="inner-glow"></div>
    <div class="stripes"></div>
    {#if displayLit}
      <div class="flame"></div>
    {/if}
  </div>
  <div class="tassel"></div>
</div>

<style>
  .lantern {
    display: flex; flex-direction: column; align-items: center;
    animation: lanternSway var(--sway) ease-in-out infinite;
    animation-delay: var(--delay);
    transform-origin: top center;
    filter: drop-shadow(0 0 8px rgba(245,200,66,0.3));
  }
  .string { width:1px; height:36px; background:rgba(139,105,20,0.5); }
  .cap { width:calc(26px * var(--size)); height:calc(7px * var(--size)); background:linear-gradient(to bottom,#5a3a10,#8b6914); border-radius:3px 3px 0 0; }
  .body {
    width:calc(22px * var(--size)); height:calc(38px * var(--size));
    border-radius:50% 50% 45% 45%;
    background:radial-gradient(ellipse at 38% 38%, rgba(255,230,120,0.92), rgba(230,150,25,0.85));
    box-shadow:0 0 18px rgba(245,200,66,0.7),0 0 36px rgba(245,200,66,0.3),inset 0 0 10px rgba(255,200,50,0.4);
    position:relative; overflow:hidden;
    transition:opacity 0.15s, box-shadow 0.15s, background 0.15s;
  }
  .body.unlit { background:radial-gradient(ellipse at 38% 38%,rgba(60,40,20,0.8),rgba(30,20,10,0.9)); box-shadow:none; }
  .inner-glow { position:absolute; inset:20% 25%; border-radius:50%; background:rgba(255,255,200,0.3); animation:glow 2s ease-in-out infinite; }
  .stripes { position:absolute; inset:0; background:repeating-linear-gradient(to right,transparent 0px,transparent 5px,rgba(0,0,0,0.08) 5px,rgba(0,0,0,0.08) 6px); }
  .flame { position:absolute; bottom:30%; left:50%; transform:translateX(-50%); width:6px; height:10px; background:radial-gradient(ellipse,#fff5aa,#ffaa00); border-radius:50% 50% 30% 30%; animation:flicker 0.15s ease-in-out infinite alternate; }
  .tassel { width:calc(5px * var(--size)); height:calc(14px * var(--size)); background:linear-gradient(to bottom,#8b6914,transparent); border-radius:0 0 2px 2px; }

  @keyframes glow { 0%,100%{opacity:0.8;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
  @keyframes flicker { from{transform:translateX(-50%) scaleY(1) skewX(-2deg);opacity:0.9} to{transform:translateX(-50%) scaleY(1.1) skewX(2deg);opacity:1} }
  @keyframes lanternSway { 0%,100%{transform:rotate(calc(var(--wind) - 3deg))} 50%{transform:rotate(calc(var(--wind) + 3deg))} }
</style>

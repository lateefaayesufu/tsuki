<script>
  import { onDestroy } from 'svelte';
  import { musicPlaying, room } from '$lib/stores/state.js';

  let ctx, masterGain, reverbNode, delayNode;
  let started = false;
  let chordTimer, melodyTimer, padTimer;
  let chordIndex = 0;
  let currentRoom = 0;

  const ROOTS = [
    [174.61, 196.00, 220.00, 246.94],
    [196.00, 220.00, 246.94, 261.63],
    [220.00, 246.94, 261.63, 293.66],
    [246.94, 261.63, 293.66, 329.63],
    [261.63, 293.66, 329.63, 349.23],
  ];

  const MAJ9   = [1, 1.2599, 1.4983, 1.7818, 2.2449];
  const MIN9   = [1, 1.1892, 1.4983, 1.6818, 2.2449];
  const ADD9   = [1, 1.2599, 1.4983, 2.2449];
  const SUS2   = [1, 1.1225, 1.4983, 2.0];
  const CHORDS = [MAJ9, SUS2, MIN9, ADD9, SUS2, MAJ9];

  function createReverb() {
    const len     = ctx.sampleRate * 4.2;
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = impulse.getChannelData(c);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.6);
      }
    }
    reverbNode = ctx.createConvolver();
    reverbNode.buffer = impulse;
    const rg = ctx.createGain();
    rg.gain.setValueAtTime(0.38, ctx.currentTime);
    reverbNode.connect(rg);
    rg.connect(masterGain);
  }

  function createDelay() {
    delayNode = ctx.createDelay(2.0);
    delayNode.delayTime.setValueAtTime(0.36, ctx.currentTime);
    const df = ctx.createGain();
    df.gain.setValueAtTime(0.22, ctx.currentTime);
    delayNode.connect(df);
    df.connect(delayNode);
    df.connect(masterGain);
  }

  function sine(freq, start, dur, amp, attack = 0.08) {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(amp, start + attack);
    gain.gain.exponentialRampToValueAtTime(amp * 0.4, start + dur * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(masterGain);
    if (reverbNode) gain.connect(reverbNode);
    osc.start(start);
    osc.stop(start + dur + 0.15);
  }

  function triangle(freq, start, dur, amp) {
    const osc  = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type  = 'triangle';
    osc2.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    osc2.frequency.setValueAtTime(freq * 1.003, start);
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(3200, start);
    filt.Q.setValueAtTime(0.7, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(amp, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(amp * 0.3, start + dur * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(filt);
    osc2.connect(filt);
    filt.connect(gain);
    gain.connect(masterGain);
    if (reverbNode) gain.connect(reverbNode);
    if (delayNode)  gain.connect(delayNode);
    osc.start(start);
    osc2.start(start);
    osc.stop(start + dur + 0.2);
    osc2.stop(start + dur + 0.2);
  }

  function bell(freq, start, dur, amp) {
    const osc  = ctx.createOscillator();
    const mod  = ctx.createOscillator();
    const modG = ctx.createGain();
    const gain = ctx.createGain();
    osc.type = 'sine';
    mod.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    mod.frequency.setValueAtTime(freq * 3.5, start);
    modG.gain.setValueAtTime(freq * 0.8, start);
    modG.gain.exponentialRampToValueAtTime(0.01, start + dur * 0.4);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(amp, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(amp * 0.18, start + dur * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    mod.connect(modG);
    modG.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(masterGain);
    if (reverbNode) gain.connect(reverbNode);
    mod.start(start);
    osc.start(start);
    mod.stop(start + dur);
    osc.stop(start + dur + 0.1);
  }

  function bass(freq, start, dur) {
    const osc  = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.25, start);
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(280, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.14, start + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.06, start + dur * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.85);
    osc.connect(filt);
    filt.connect(gain);
    gain.connect(masterGain);
    osc.start(start);
    osc.stop(start + dur);
  }

  function playChord() {
    if (!ctx || !started) return;
    const roots  = ROOTS[currentRoom] ?? ROOTS[0];
    const root   = roots[chordIndex % roots.length];
    const ratios = CHORDS[chordIndex % CHORDS.length];
    const now    = ctx.currentTime;
    const dur    = 5.5 + Math.random() * 2.5;

    ratios.forEach((r, i) => {
      const oct = i === 0 ? 0.5 : i >= 3 ? 2 : 1;
      sine(root * r * oct, now + i * 0.06, dur, 0.055 - i * 0.006);
    });

    bass(root, now, dur * 0.7);

    chordIndex++;
    chordTimer = setTimeout(playChord, (dur + 0.2 + Math.random() * 0.8) * 1000);
  }

  function playPad() {
    if (!ctx || !started) return;
    const roots = ROOTS[currentRoom] ?? ROOTS[0];
    const root  = roots[chordIndex % roots.length];
    const dur   = 7.0 + Math.random() * 4.0;
    const now   = ctx.currentTime;

    [1, 1.4983, 1.8877].forEach((r, i) => {
      sine(root * r * 0.5, now + i * 0.12, dur, 0.032, 0.4);
    });

    padTimer = setTimeout(playPad, (dur * 0.6 + Math.random() * 2) * 1000);
  }

  function playMelody() {
    if (!ctx || !started) return;
    const roots = ROOTS[currentRoom] ?? ROOTS[0];
    const root  = roots[chordIndex % roots.length];
    const penta = [1, 1.1225, 1.2599, 1.4983, 1.6818, 2.0, 2.2449];
    const now   = ctx.currentTime;

    const r1  = penta[Math.floor(Math.random() * penta.length)];
    const oct = Math.random() < 0.25 ? 4 : Math.random() < 0.5 ? 2 : 3;
    const dur = 1.8 + Math.random() * 3.5;

    if (Math.random() < 0.55) {
      triangle(root * r1 * oct, now, dur, 0.038);
    } else {
      bell(root * r1 * oct, now, dur * 0.7, 0.05);
    }

    if (Math.random() < 0.25) {
      const r2 = penta[Math.floor(Math.random() * penta.length)];
      setTimeout(() => {
        if (ctx && started) bell(root * r2 * oct, ctx.currentTime, dur * 0.5, 0.028);
      }, 280 + Math.random() * 400);
    }

    melodyTimer = setTimeout(playMelody, (2.8 + Math.random() * 4.5) * 1000);
  }

  function start() {
    if (started) return;
    started = true;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);
    if (ctx.state === 'suspended') ctx.resume();
    createReverb();
    createDelay();
    masterGain.gain.linearRampToValueAtTime(0.78, ctx.currentTime + 4.5);
    chordTimer  = setTimeout(playChord,  800);
    padTimer    = setTimeout(playPad,    1200);
    melodyTimer = setTimeout(playMelody, 5000 + Math.random() * 3000);
  }

  function stop() {
    if (!started) return;
    started = false;
    clearTimeout(chordTimer);
    clearTimeout(melodyTimer);
    clearTimeout(padTimer);
    if (!ctx) return;
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.5);
    setTimeout(() => { try { ctx.close(); ctx = null; masterGain = null; } catch(e){} }, 4000);
  }

  $: if ($musicPlaying) start(); else stop();
  $: { currentRoom = $room; }

  onDestroy(() => {
    clearTimeout(chordTimer);
    clearTimeout(melodyTimer);
    clearTimeout(padTimer);
    stop();
  });
</script>
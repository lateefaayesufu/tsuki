<script>
  import { onDestroy } from 'svelte';
  import { musicPlaying, room } from '$lib/stores/state.js';

  let ctx, masterGain;
  let started = false;
  let chordTimer, melodyTimer;

 

  const PROGRESSIONS = [
    [261.63, 220.00, 174.61, 196.00], 
    [196.00, 164.81, 261.63, 293.66],
    [293.66, 246.94, 196.00, 220.00], 
    [220.00, 185.00, 174.61, 164.81], 
    [164.81, 138.59, 220.00, 246.94], 
  ];

  
  const CHORD_TYPES = [
    [1, 1.2599, 1.4983, 1.8877], 
    [1, 1.1892, 1.4983, 1.7818], 
    [1, 1.2599, 1.4983, 1.8877],
    [1, 1.2599, 1.4983, 1.8877], 
  ];

  let chordIndex = 0;
  let currentRoom = 0;

  // REVERB 
  let reverbNode;
  function createReverb() {
    const length  = ctx.sampleRate * 2.8;
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = impulse.getChannelData(c);
      for (let i = 0; i < length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.0);
      }
    }
    reverbNode = ctx.createConvolver();
    reverbNode.buffer = impulse;

    const reverbGain = ctx.createGain();
    reverbGain.gain.setValueAtTime(0.28, ctx.currentTime);
    reverbNode.connect(reverbGain);
    reverbGain.connect(masterGain);
  }

  function playNote(freq, startTime, duration, amp = 0.07, wet = false) {
    if (!ctx) return;

    const osc1   = ctx.createOscillator();
    const osc2   = ctx.createOscillator();
    const gain   = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 1.004, startTime); 

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, startTime);
    filter.Q.setValueAtTime(0.5, startTime);

 
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(amp, startTime + 0.035);
    gain.gain.exponentialRampToValueAtTime(amp * 0.25, startTime + duration * 0.45);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    if (wet && reverbNode) gain.connect(reverbNode);

    osc1.start(startTime); osc2.start(startTime);
    osc1.stop(startTime + duration + 0.1);
    osc2.stop(startTime + duration + 0.1);
  }

  //BASS
  function playBass(freq, startTime, duration) {
    if (!ctx) return;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.5, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.8);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  //CHORD 
  function playChord() {
    if (!ctx || !started) return;

    const roots   = PROGRESSIONS[currentRoom] ?? PROGRESSIONS[0];
    const root    = roots[chordIndex % roots.length];
    const ratios  = CHORD_TYPES[chordIndex % CHORD_TYPES.length];
    const now     = ctx.currentTime;
    const dur     = 3.0 + Math.random() * 1.8;

    
    ratios.forEach((ratio, i) => {
      const octave = i === 0 ? 0.5 : i === 3 ? 2 : 1;
      playNote(root * ratio * octave, now + i * 0.04, dur, 0.065 - i * 0.008, true);
    });

    playBass(root, now, dur * 0.65);

    chordIndex++;
    chordTimer = setTimeout(playChord, (dur + 0.15 + Math.random() * 0.5) * 1000);
  }

  //MELODY 
 
  function playMelody() {
    if (!ctx || !started) return;

    const roots = PROGRESSIONS[currentRoom] ?? PROGRESSIONS[0];
    const root  = roots[chordIndex % roots.length];

   
    const penta  = [1, 1.1225, 1.2599, 1.4983, 1.6818];
    const ratio  = penta[Math.floor(Math.random() * penta.length)];
    const octave = Math.random() < 0.3 ? 4 : 2;
    const freq   = root * ratio * octave;
    const dur    = 1.0 + Math.random() * 2.2;
    const now    = ctx.currentTime;

    playNote(freq, now, dur, 0.048, true);

    
    if (Math.random() < 0.3) {
      const h = penta[Math.floor(Math.random() * penta.length)];
      playNote(root * h * octave, now + 0.05, dur * 0.8, 0.03, true);
    }

   
    melodyTimer = setTimeout(playMelody, (2.0 + Math.random() * 3.5) * 1000);
  }

  //START / STOP
  function start() {
    if (started) return;
    started = true;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);

    if (ctx.state === 'suspended') ctx.resume();

    createReverb();

  
    masterGain.gain.linearRampToValueAtTime(0.82, ctx.currentTime + 3);

    
    chordTimer  = setTimeout(playChord,  600);
    melodyTimer = setTimeout(playMelody, 3000 + Math.random() * 2000);
  }

  function stop() {
    if (!started) return;
    started = false;
    clearTimeout(chordTimer);
    clearTimeout(melodyTimer);
    if (!ctx) return;
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
    setTimeout(() => { try { ctx.close(); ctx = null; masterGain = null; } catch(e){} }, 3000);
  }

  //REACTIVITY 
  $: if ($musicPlaying) start(); else stop();

  $: {
    currentRoom = $room;
    
  }

  onDestroy(() => {
    clearTimeout(chordTimer);
    clearTimeout(melodyTimer);
    stop();
  });
</script>
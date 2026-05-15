

<script>
  import { supabase }         from '$lib/supabase.js';
  import { onMount }          from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { cubicOut, elasticOut } from 'svelte/easing';

  let screen = 1; 


  let name    = '';
  let email   = '';
  let kind    = ''; 
  let message = '';
  let errors  = {};
  let sending = false;
  let sent    = false;

 
  let currentFold = 0;
  let folds       = [false, false, false, false];
  let craneFold   = 0; 

  const FOLD_LABELS = [
    { jp: '種', en: 'the nature of your message' },
    { jp: '名', en: 'your name'                  },
    { jp: '返', en: 'your email'                  },
    { jp: '文', en: 'your words'                  },
  ];

  const KINDS = [
    { value: 'collaboration', jp: '共作', en: 'Collaboration'  },
    { value: 'question',      jp: '問い', en: 'Question'        },
    { value: 'hello',         jp: '挨拶', en: 'Just saying hi'  },
  ];

  function advanceFold() {
   
    errors = {};
    if (currentFold === 0 && !kind)          { errors.kind    = 'choose one'; return; }
    if (currentFold === 1 && !name.trim())   { errors.name    = 'required';   return; }
    if (currentFold === 2 && email.trim() && !email.includes('@')) {
      errors.email = 'check email'; return;
    }
    if (currentFold === 3 && !message.trim()) { errors.message = 'required'; return; }

    folds[currentFold] = true;
    folds = [...folds];
    craneFold = Math.min(craneFold + 1, 4);

    if (currentFold < 3) {
      currentFold++;
    }
  }

  function goBack(i) {
    if (i < currentFold) {
      currentFold = i;
      folds = folds.map((f, fi) => fi < i ? f : false);
      craneFold = i;
    }
  }

 
  $: allFolded = folds.every(Boolean);

  async function sendCrane() {
    if (sending || sent) return;
    sending = true;

    try {
      await supabase.from('contact_messages').insert({
        sender_name:  name.trim()    || null,
        sender_email: email.trim()   || null,
        message_kind: kind           || null,
        message:      message.trim(),
      });
    } catch(e) { console.warn('[Orizuru] send error:', e?.message); }

    sending = false;
    sent    = true;

   
    setTimeout(() => { screen = 2; }, 800);
  }

  const STAMPS = [
    { kanji: '良', label: 'good',        color: '#c0392b' },
    { kanji: '美', label: 'beautiful',   color: '#2980b9' },
    { kanji: '面白', label: 'interesting', color: '#c07820' },
    { kanji: '好', label: 'favourite',   color: '#8e44ad' },
    { kanji: '素', label: 'wonderful',   color: '#d4a820' },
  ];
  let stampCounts = {};
  let myStamp     = null;
  let stampLoaded = false;
  let stampsVisible = false;

  onMount(async () => {
    await loadStamps();
    myStamp = sessionStorage.getItem('tsukiyo_stamp') || null;

    const ch = supabase
      .channel('visitor_stamps_orizuru')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitor_stamps' }, loadStamps)
      .subscribe();

    return () => { if (ch) supabase.removeChannel(ch); };
  });

  async function loadStamps() {
    try {
      const { data } = await supabase.from('visitor_stamps').select('stamp');
      if (data) {
        const c = {};
        STAMPS.forEach(s => { c[s.kanji] = 0; });
        data.forEach(r => { if (c[r.stamp] !== undefined) c[r.stamp]++; });
        stampCounts = c;
      }
    } catch(e) { console.warn('[Stamps] error:', e?.message); }
    stampLoaded = true;
  }

  async function giveStamp(kanji) {
    if (myStamp) return;
    myStamp = kanji;
    sessionStorage.setItem('tsukiyo_stamp', kanji);
    stampCounts = { ...stampCounts, [kanji]: (stampCounts[kanji] || 0) + 1 };
    try { await supabase.from('visitor_stamps').insert({ stamp: kanji }); }
    catch(e) { console.warn('[Stamps] insert error:', e?.message); }
  }

  $: if (screen === 2) setTimeout(() => { stampsVisible = true; }, 2200);
</script>


{#if screen === 1}
<div class="room-orizuru screen-1" transition:fade={{ duration: 400 }}>

  <header class="fold-header">
    <h2 class="fold-title">折鶴</h2>
    <p class="fold-sub">Orizuru · Fold a crane · Send your wish</p>
  </header>

  <div class="fold-stage">

   
    <div class="crane-wrap" aria-hidden="true">
      <svg class="crane-svg" viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg">
        <!-- Paper base / flat sheet (fold 0) -->
        <g class="fold-layer f0" class:visible={craneFold >= 0}>
          <polygon points="120,20 220,130 120,240 20,130"
            fill="rgba(240,232,208,0.07)" stroke="rgba(240,232,208,0.18)" stroke-width="1"/>
          <line x1="120" y1="20" x2="120" y2="240" stroke="rgba(240,232,208,0.06)" stroke-width="0.8" stroke-dasharray="4 4"/>
          <line x1="20"  y1="130" x2="220" y2="130" stroke="rgba(240,232,208,0.06)" stroke-width="0.8" stroke-dasharray="4 4"/>
        </g>

       
        <g class="fold-layer f1" class:visible={craneFold >= 1}>
          <polygon points="120,20 220,130 120,175 20,130"
            fill="rgba(240,232,208,0.10)" stroke="rgba(201,168,76,0.35)" stroke-width="1.2"/>
          <polygon points="120,175 220,130 120,240 20,130"
            fill="rgba(240,232,208,0.05)" stroke="rgba(201,168,76,0.15)" stroke-width="0.8"/>
        </g>

    
        <g class="fold-layer f2" class:visible={craneFold >= 2}>
          <polygon points="120,20 170,100 120,175 70,100"
            fill="rgba(240,232,208,0.13)" stroke="rgba(201,168,76,0.5)" stroke-width="1.3"/>
          <line x1="120" y1="20" x2="120" y2="175" stroke="rgba(201,168,76,0.2)" stroke-width="0.8"/>
        </g>

        <g class="fold-layer f3" class:visible={craneFold >= 3}>
    
          <polygon points="120,60 165,115 120,160 75,115"
            fill="rgba(240,232,208,0.16)" stroke="rgba(201,168,76,0.65)" stroke-width="1.5"/>
       
          <polygon points="75,115 20,130 70,145"
            fill="rgba(240,232,208,0.09)" stroke="rgba(201,168,76,0.35)" stroke-width="1"/>
        
          <polygon points="165,115 220,130 170,145"
            fill="rgba(240,232,208,0.09)" stroke="rgba(201,168,76,0.35)" stroke-width="1"/>
        </g>

    
        <g class="fold-layer f4" class:visible={craneFold >= 4}>
        
          <polygon points="120,55 168,118 120,165 72,118"
            fill="rgba(240,232,208,0.22)" stroke="rgba(201,168,76,0.85)" stroke-width="1.6"/>
         
          <polygon points="72,118 14,108 65,148"
            fill="rgba(240,232,208,0.14)" stroke="rgba(201,168,76,0.55)" stroke-width="1.2"
            style="transform-origin:72px 118px; animation: wingL 3s ease-in-out infinite alternate"/>
         
          <polygon points="168,118 226,108 175,148"
            fill="rgba(240,232,208,0.14)" stroke="rgba(201,168,76,0.55)" stroke-width="1.2"
            style="transform-origin:168px 118px; animation: wingR 3s ease-in-out infinite alternate"/>
        
          <polygon points="120,55 130,36 120,48 110,36"
            fill="rgba(240,232,208,0.18)" stroke="rgba(201,168,76,0.7)" stroke-width="1.2"/>
        
          <polygon points="120,165 128,190 120,178 112,190"
            fill="rgba(240,232,208,0.14)" stroke="rgba(201,168,76,0.5)" stroke-width="1"/>
       
          <line x1="120" y1="55" x2="120" y2="165"
            stroke="rgba(201,168,76,0.2)" stroke-width="0.8" stroke-dasharray="3 3"/>
         
          <ellipse cx="120" cy="118" rx="42" ry="48"
            fill="none" stroke="rgba(201,168,76,0.08)" stroke-width="12"/>
        </g>

        {#each [0,1,2,3] as fi}
          <circle
            cx={60 + fi * 40} cy="250" r="3"
            fill={craneFold > fi ? 'rgba(201,168,76,0.8)' : 'rgba(201,168,76,0.15)'}
            style="transition: fill 0.4s"
          />
        {/each}
      </svg>
    </div>

    <div class="fields-wrap">

      {#each FOLD_LABELS as fl, fi}
        {#if fi <= currentFold}
          <div
            class="field-block"
            class:active={fi === currentFold}
            class:done={folds[fi]}
            transition:fly={{ y: 14, duration: 320, easing: cubicOut }}
          >
            <button
              class="field-label-row"
              on:click={() => goBack(fi)}
              disabled={fi === currentFold}
              aria-label="Go back to {fl.en}"
            >
              <span class="field-jp">{fl.jp}</span>
              <span class="field-sep">·</span>
              <span class="field-en">{fl.en}</span>
              {#if folds[fi]}<span class="field-done-mark">✓</span>{/if}
            </button>

            {#if fi === currentFold || !folds[fi]}

              {#if fi === 0}
                <div class="kind-row">
                  {#each KINDS as k}
                    <button
                      class="kind-btn"
                      class:selected={kind === k.value}
                      on:click={() => { kind = k.value; errors.kind = null; }}
                      aria-pressed={kind === k.value}
                    >
                      <span class="kind-jp">{k.jp}</span>
                      <span class="kind-en">{k.en}</span>
                    </button>
                  {/each}
                </div>
                {#if errors.kind}<span class="field-error" transition:fade>{errors.kind}</span>{/if}

           
              {:else if fi === 1}
                <input
                  class="field-input"
                  class:err={errors.name}
                  bind:value={name}
                  placeholder="your name"
                  maxlength="80"
                  aria-label="Your name"
                  aria-invalid={!!errors.name}
                />
                {#if errors.name}<span class="field-error" transition:fade>{errors.name}</span>{/if}

       
              {:else if fi === 2}
                <input
                  class="field-input"
                  class:err={errors.email}
                  bind:value={email}
                  placeholder="email for reply (optional)"
                  type="email"
                  maxlength="120"
                  aria-label="Your email"
                  aria-invalid={!!errors.email}
                />
                {#if errors.email}<span class="field-error" transition:fade>{errors.email}</span>{/if}

              {:else if fi === 3}
                <textarea
                  class="field-textarea"
                  class:err={errors.message}
                  bind:value={message}
                  placeholder="your message..."
                  rows="3"
                  maxlength="2000"
                  aria-label="Your message"
                  aria-invalid={!!errors.message}
                ></textarea>
                {#if errors.message}<span class="field-error" transition:fade>{errors.message}</span>{/if}
              {/if}

            {:else}
             
              <div class="field-summary">
                {#if fi === 0}{KINDS.find(k=>k.value===kind)?.en ?? kind}
                {:else if fi === 1}{name}
                {:else if fi === 2}{email || '—'}
                {:else if fi === 3}{message.slice(0,60)}{message.length > 60 ? '…' : ''}
                {/if}
              </div>
            {/if}

         
            {#if fi === currentFold}
              <button
                class="fold-btn"
                on:click={advanceFold}
                aria-label={fi < 3 ? 'Next fold' : 'Complete crane'}
              >
                {fi < 3 ? '折る · fold' : '完成 · complete'}
              </button>
            {/if}

          </div>
        {/if}
      {/each}

    
      {#if allFolded}
        <div class="send-wrap" transition:fly={{ y: 16, duration: 400, easing: elasticOut }}>
          <button
            class="send-btn"
            class:sending
            class:sent
            on:click={sendCrane}
            disabled={sending || sent}
            aria-label="Release your crane"
          >
            {#if sent}
              <span>鶴が飛んでいく · carried away</span>
            {:else if sending}
              <span>送信中 · sending<span class="send-dots"><span>·</span><span>·</span><span>·</span></span></span>
            {:else}
              <span>↑ 放つ · release the crane</span>
            {/if}
          </button>
        </div>
      {/if}

    </div>
  </div>

</div>


{:else}
<div class="room-orizuru screen-2" transition:fade={{ duration: 600 }}>


  <div class="flight-stage" aria-hidden="true">
    <svg class="flying-crane" viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg">
      <g style="transform-origin:120px 118px">
        <polygon points="120,55 168,118 120,165 72,118"
          fill="rgba(240,232,208,0.28)" stroke="rgba(201,168,76,0.9)" stroke-width="1.6"/>
        <polygon class="wing-l" points="72,118 14,108 65,148"
          fill="rgba(240,232,208,0.18)" stroke="rgba(201,168,76,0.6)" stroke-width="1.2"/>
        <polygon class="wing-r" points="168,118 226,108 175,148"
          fill="rgba(240,232,208,0.18)" stroke="rgba(201,168,76,0.6)" stroke-width="1.2"/>
        <polygon points="120,55 130,36 120,48 110,36"
          fill="rgba(240,232,208,0.22)" stroke="rgba(201,168,76,0.75)" stroke-width="1.2"/>
        <polygon points="120,165 128,190 120,178 112,190"
          fill="rgba(240,232,208,0.18)" stroke="rgba(201,168,76,0.55)" stroke-width="1"/>
      </g>
    </svg>

  
    <div class="crane-trail"></div>
  </div>


  <div class="flight-message" transition:fade={{ duration: 800, delay: 400 }}>
    <div class="flight-jp">届きます</div>
    <div class="flight-en">your crane is on its way · I'll write back soon</div>
  </div>


  {#if stampsVisible}
    <div class="stamps-wrap" transition:fly={{ y: 20, duration: 500, easing: cubicOut }}>
      <span class="stamps-label">来訪者の印 · Visitor stamps</span>
      <div class="stamps-row" role="group" aria-label="Leave a visitor stamp">
        {#each STAMPS as s}
          <button
            class="stamp-btn"
            class:mine={myStamp === s.kanji}
            on:click={() => giveStamp(s.kanji)}
            style="--col:{s.color}"
            disabled={!!myStamp && myStamp !== s.kanji}
            aria-label="{s.label} stamp"
            title="{s.kanji} · {s.label}"
          >
            <span class="stamp-kanji">{s.kanji}</span>
            {#if stampLoaded}
              <span class="stamp-count">{stampCounts[s.kanji] ?? 0}</span>
            {/if}
          </button>
        {/each}
      </div>
      {#if myStamp}
        <span class="stamp-thanks" transition:fade>your stamp is left · thank you for visiting</span>
      {:else}
        <span class="stamp-invite">one stamp per visit</span>
      {/if}
    </div>
  {/if}

</div>
{/if}

<style>
 
  .room-orizuru {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    position: relative; overflow: hidden;
    padding: 0 24px;
  }
  .screen-1 {
    justify-content: flex-start;
    overflow-y: auto;
    padding: 32px 24px 48px;
    scrollbar-width: none;
  }


  .fold-header {
    text-align: center; margin-bottom: 24px; pointer-events: none; flex-shrink: 0;
  }
  .fold-title {
    font-family: var(--font-serif);
    font-size: clamp(28px, 3.5vw, 42px);
    color: rgba(201,168,76,0.82); letter-spacing: 0.2em;
  }
  .fold-sub {
    font-family: var(--font-mono); font-size: 8.5px;
    letter-spacing: 0.3em; color: rgba(201,168,76,0.3);
    text-transform: uppercase; margin-top: 6px;
  }

  .fold-stage {
    display: flex; gap: 52px; align-items: flex-start;
    width: min(820px, 94vw);
    flex: 1;
  }


  .crane-wrap {
    flex-shrink: 0; width: 220px;
    position: sticky; top: 0;
  }
  .crane-svg { width: 100%; height: auto; }

  .fold-layer { opacity: 0; transition: opacity 0.6s ease; }
  .fold-layer.visible { opacity: 1; }

  @keyframes wingL {
    from { transform: rotate(-6deg); }
    to   { transform: rotate(6deg);  }
  }
  @keyframes wingR {
    from { transform: rotate(6deg);  }
    to   { transform: rotate(-6deg); }
  }


  .fields-wrap {
    flex: 1; display: flex; flex-direction: column; gap: 14px;
    padding-right: 4px; padding-bottom: 8px;
  }

  .field-block {
    display: flex; flex-direction: column; gap: 6px;
    padding: 10px 16px;
    border: 1px solid rgba(201,168,76,0.08);
    border-radius: 2px;
    background: rgba(8,11,22,0.5);
    transition: border-color 0.3s, background 0.3s;
  }
  .field-block.active {
    border-color: rgba(201,168,76,0.22);
    background: rgba(8,11,22,0.7);
  }
  .field-block.done {
    border-color: rgba(201,168,76,0.08);
    background: rgba(8,11,22,0.3);
  }

  .field-label-row {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none; cursor: default;
    padding: 0; text-align: left;
  }
  .field-block.done .field-label-row { cursor: pointer; }
  .field-jp  { font-family: var(--font-serif); font-size: 15px; color: rgba(201,168,76,0.75); }
  .field-sep { color: rgba(201,168,76,0.2); font-family: var(--font-mono); font-size: 9px; }
  .field-en  { font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.22em; color: rgba(230,220,195,0.3); text-transform: uppercase; }
  .field-done-mark { margin-left: auto; font-family: var(--font-mono); font-size: 9px; color: rgba(201,168,76,0.5); }

  .field-input, .field-textarea {
    background: transparent; border: none;
    border-bottom: 1px solid rgba(201,168,76,0.18);
    padding: 6px 0; outline: none;
    font-family: var(--font-hand); font-size: 17px;
    color: rgba(240,232,208,0.85); width: 100%;
    transition: border-color 0.2s;
  }
  .field-input::placeholder, .field-textarea::placeholder {
    color: rgba(240,232,208,0.18); font-style: italic;
  }
  .field-input:focus, .field-textarea:focus {
    border-bottom-color: rgba(201,168,76,0.5);
  }
  .field-input.err, .field-textarea.err { border-bottom-color: rgba(192,57,43,0.6); }
  .field-textarea { resize: none; line-height: 1.7; }

  .field-error {
    font-family: var(--font-mono); font-size: 7.5px;
    letter-spacing: 0.16em; color: rgba(192,57,43,0.7);
    text-transform: uppercase;
  }

  .field-summary {
    font-family: var(--font-mono); font-size: 9px;
    color: rgba(230,220,195,0.3); letter-spacing: 0.06em;
    padding: 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

 
  .kind-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .kind-btn {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    background: rgba(201,168,76,0.04);
    border: 1px solid rgba(201,168,76,0.14);
    border-radius: 2px; padding: 8px 14px;
    cursor: pointer; transition: border-color 0.2s, background 0.2s;
  }
  .kind-btn:hover { border-color: rgba(201,168,76,0.35); background: rgba(201,168,76,0.08); }
  .kind-btn.selected {
    border-color: rgba(201,168,76,0.65);
    background: rgba(201,168,76,0.1);
  }
  .kind-jp { font-family: var(--font-serif); font-size: 16px; color: rgba(201,168,76,0.8); }
  .kind-en { font-family: var(--font-mono); font-size: 7px; letter-spacing: 0.18em; color: rgba(230,220,195,0.3); text-transform: uppercase; }


  .fold-btn {
    align-self: flex-end;
    background: none;
    border: 1px solid rgba(201,168,76,0.22);
    border-radius: 1px; padding: 5px 16px;
    font-family: var(--font-mono); font-size: 8px;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: rgba(201,168,76,0.55); cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .fold-btn:hover {
    border-color: rgba(201,168,76,0.6);
    color: rgba(201,168,76,0.9);
    background: rgba(201,168,76,0.05);
  }


  .send-wrap { display: flex; justify-content: center; padding-top: 4px; }
  .send-btn {
    background: rgba(201,168,76,0.07);
    border: 1px solid rgba(201,168,76,0.35);
    border-radius: 1px; padding: 10px 28px;
    font-family: var(--font-mono); font-size: 9px;
    letter-spacing: 0.26em; text-transform: uppercase;
    color: rgba(201,168,76,0.75); cursor: pointer;
    transition: all 0.25s;
  }
  .send-btn:hover:not(:disabled) {
    background: rgba(201,168,76,0.13);
    border-color: rgba(201,168,76,0.7);
    color: rgba(201,168,76,1);
    box-shadow: 0 0 20px rgba(201,168,76,0.12);
  }
  .send-btn:disabled { opacity: 0.5; cursor: default; }
  .send-btn.sent { border-color: rgba(201,168,76,0.25); color: rgba(201,168,76,0.4); }

  .send-dots { display: inline-flex; gap: 2px; margin-left: 4px; }
  .send-dots span { animation: dotPulse 1s ease-in-out infinite; }
  .send-dots span:nth-child(2) { animation-delay: 0.2s; }
  .send-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotPulse { 0%,100%{opacity:0.2} 50%{opacity:1} }


  .screen-2 { gap: 32px; }

  .flight-stage {
    position: relative; width: 200px; height: 200px;
  }
  .flying-crane {
    width: 100%; height: 100%;
    animation: craneFly 4s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
    filter: drop-shadow(0 0 18px rgba(201,168,76,0.3));
  }
  @keyframes craneFly {
    0%   { transform: translateY(0)    translateX(0)   scale(1)    rotate(0deg);   opacity: 1; }
    30%  { transform: translateY(-20px) translateX(30px) scale(1.08) rotate(8deg);  opacity: 1; }
    70%  { transform: translateY(-80px) translateX(90px) scale(0.7)  rotate(18deg); opacity: 0.7; }
    100% { transform: translateY(-160px) translateX(180px) scale(0.2) rotate(30deg); opacity: 0; }
  }

  .wing-l { animation: wingL2 0.6s ease-in-out infinite alternate; transform-origin: 72px 118px; }
  .wing-r { animation: wingR2 0.6s ease-in-out infinite alternate; transform-origin: 168px 118px; }
  @keyframes wingL2 { from { transform: rotate(-12deg); } to { transform: rotate(12deg); } }
  @keyframes wingR2 { from { transform: rotate(12deg);  } to { transform: rotate(-12deg); } }

  .crane-trail {
    position: absolute; top: 50%; left: 50%;
    width: 2px; height: 0;
    background: linear-gradient(to bottom, rgba(201,168,76,0.3), transparent);
    animation: trailGrow 4s ease-out forwards;
    transform-origin: top center;
  }
  @keyframes trailGrow {
    0%   { height: 0; opacity: 0.6; }
    60%  { height: 120px; opacity: 0.3; }
    100% { height: 160px; opacity: 0; }
  }

  .flight-message {
    text-align: center; display: flex; flex-direction: column; gap: 10px;
  }
  .flight-jp {
    font-family: var(--font-serif); font-size: 38px;
    color: rgba(201,168,76,0.75); letter-spacing: 0.2em;
    text-shadow: 0 0 30px rgba(201,168,76,0.2);
  }
  .flight-en {
    font-family: var(--font-mono); font-size: 8.5px;
    letter-spacing: 0.3em; color: rgba(230,220,195,0.3);
    text-transform: uppercase;
  }


  .stamps-wrap {
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    justify-content: center;
    padding: 16px 24px;
    border-top: 1px solid rgba(201,168,76,0.08);
    width: min(640px, 92vw);
  }
  .stamps-label {
    font-family: var(--font-mono); font-size: 8px;
    letter-spacing: 0.2em; color: rgba(230,220,195,0.2);
    flex-shrink: 0;
  }
  .stamps-row { display: flex; gap: 10px; flex-wrap: wrap; }

  .stamp-btn {
    display: flex; align-items: center; gap: 6px;
    background: rgba(240,232,208,0.04);
    border: 1.5px solid var(--col);
    border-radius: 2px; padding: 6px 10px;
    cursor: pointer;
    transition: transform 0.15s, background 0.2s, box-shadow 0.2s;
    box-shadow: 1px 2px 5px rgba(0,0,0,0.3);
  }
  .stamp-btn:hover:not(:disabled):not(.mine) {
    transform: scale(1.08) rotate(-1deg);
    background: rgba(240,232,208,0.1);
  }
  .stamp-btn:disabled { cursor: default; opacity: 0.35; }
  .stamp-btn.mine {
    box-shadow: 0 0 12px var(--col), 1px 2px 5px rgba(0,0,0,0.3);
    cursor: default;
  }
  .stamp-kanji { font-family: var(--font-serif); font-size: 18px; color: var(--col); line-height: 1; }
  .stamp-count { font-family: var(--font-mono); font-size: 8px; color: rgba(240,232,208,0.35); }

  .stamp-thanks { font-family: var(--font-mono); font-size: 8px; color: rgba(230,220,195,0.4); letter-spacing: 0.16em; }
  .stamp-invite { font-family: var(--font-mono); font-size: 8px; color: rgba(230,220,195,0.15); letter-spacing: 0.14em; }

  @media (max-width: 600px) {
    .fold-stage { flex-direction: column; align-items: center; gap: 28px; }
    .crane-wrap { width: 160px; }
  }
</style>
<script>
  import { onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import { guestBookOpen } from '$lib/stores/state.js';
  import {
    guestWords, guestLoaded, guestError,
    initGuestBook, submitWord, destroyGuestBook
  } from '$lib/stores/guestBook.js';

  let input = '';
  let submitting = false;
  let submitError = '';
  let submitSuccess = false;

  onMount(() => initGuestBook());
  onDestroy(() => destroyGuestBook());

  async function submit() {
    const w = input.trim();
    if (!w || submitting) return;
    if (w.includes(' ')) { submitError = 'One word only'; return; }
    submitting = true;
    submitError = '';
    const { ok, error } = await submitWord(w);
    submitting = false;
    if (ok) {
      input = '';
      submitSuccess = true;
      setTimeout(() => { submitSuccess = false; }, 2500);
    } else {
      submitError = 'Could not send — try again';
    }
  }

  function closeOnBg(e) {
    if (e.target === e.currentTarget) guestBookOpen.set(false);
  }
</script>

<button class="trigger" on:click={() => guestBookOpen.set(true)} aria-label="Open guest book" title="Guest Book">
  <div class="box"><span>帳</span></div>
</button>

{#if $guestBookOpen}
<div
  class="overlay"
  on:click={closeOnBg}
  on:keydown={e => e.key === 'Escape' && guestBookOpen.set(false)}
  role="dialog" aria-modal="true" aria-label="Guest book" tabindex="-1"
  transition:fly={{ y: 20, duration: 300 }}
>
  <div class="book">
    <div class="grain"></div>
    <div class="bind"></div>

    <h3>宿帳</h3>
    <p class="sub">
      Guest Book · Leave one word. What did you feel here?
      {#if $guestLoaded}<span class="live-dot" title="Live"></span>{/if}
    </p>

    <div class="words" aria-live="polite">
      {#if !$guestLoaded && !$guestError}
        <span class="loading">opening the book...</span>
      {:else}
        {#each $guestWords.slice(-24) as word, i}
          <span class="word" style="--r:{(i % 7) * 2.4 - 4}deg; --op:{0.45 + (i / Math.max($guestWords.length,1)) * 0.5}">{word}</span>
        {/each}
      {/if}
    </div>

    {#if submitSuccess}
      <p class="success">left in the book ✓</p>
    {:else}
      <div class="input-row">
        <input bind:value={input} placeholder="one word..." maxlength="18" disabled={submitting}
          on:keydown={e => e.key === 'Enter' && submit()} aria-label="Enter one word"/>
        <button class="submit-btn" on:click={submit} disabled={submitting || !input.trim()}>
          {submitting ? '…' : '→'}
        </button>
      </div>
      {#if submitError}<p class="error">{submitError}</p>{/if}
    {/if}

    <p class="shared-note">
      {#if $guestLoaded}words from every visitor who passed through
      {:else if $guestError}(offline — showing remembered words){/if}
    </p>

    <button class="close" on:click={() => guestBookOpen.set(false)} aria-label="Close">✕</button>
  </div>
</div>
{/if}

<style>
  .trigger { position:fixed; bottom:22px; left:22px; z-index:50; background:none; border:none; cursor:pointer; padding:0; }
  .box { width:38px; height:30px; background:linear-gradient(135deg,#4a2e0e,#6a4020); border-radius:2px; border:1px solid rgba(139,90,43,0.45); box-shadow:2px 2px 10px rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; transition:transform 0.2s; }
  .box:hover { transform:translateY(-1px); }
  .box span { font-family:var(--font-serif); font-size:14px; color:rgba(240,232,208,0.4); }

  .overlay { position:fixed; inset:0; z-index:300; background:rgba(10,18,34,0.93); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); }

  .book { background:var(--paper); width:360px; padding:36px 36px 24px; border-radius:2px; box-shadow:14px 14px 60px rgba(0,0,0,0.65); position:relative; overflow:hidden; }
  .grain { position:absolute; inset:0; border-radius:2px; opacity:0.025; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E"); pointer-events:none; }
  .bind { position:absolute; top:0; left:0; bottom:0; width:10px; background:linear-gradient(to right,rgba(139,90,43,0.4),transparent); border-right:1px solid rgba(139,90,43,0.2); }

  h3 { font-family:var(--font-serif); font-size:20px; color:var(--ink); margin-bottom:4px; }
  .sub { font-family:var(--font-mono); font-size:8px; color:var(--ink); opacity:0.38; letter-spacing:0.1em; margin-bottom:18px; line-height:1.8; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }

  .live-dot { display:inline-block; width:5px; height:5px; border-radius:50%; background:#3a8a3a; animation:livePulse 2s ease-in-out infinite; flex-shrink:0; }
  @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.35} }

  .words { min-height:110px; border:1px solid rgba(28,20,16,0.1); padding:12px; margin-bottom:16px; display:flex; flex-wrap:wrap; gap:10px 14px; align-content:flex-start; background:rgba(28,20,16,0.02); border-radius:1px; }
  .word { font-family:var(--font-hand); font-size:17px; color:var(--ink); opacity:var(--op,0.6); transform:rotate(var(--r,0deg)); display:inline-block; animation:wordAppear 0.5s ease both; }
  @keyframes wordAppear { from{opacity:0;transform:rotate(var(--r,0deg)) translateY(4px)} to{opacity:var(--op,0.6);transform:rotate(var(--r,0deg)) translateY(0)} }
  .loading { font-family:var(--font-mono); font-size:8px; color:var(--ink); opacity:0.25; letter-spacing:0.15em; align-self:center; width:100%; text-align:center; }

  .input-row { display:flex; gap:8px; }
  input { flex:1; border:none; border-bottom:1px solid rgba(28,20,16,0.2); background:transparent; font-family:var(--font-hand); font-size:18px; color:var(--ink); padding:8px 0; outline:none; transition:border-color 0.2s; }
  input::placeholder { color:rgba(28,20,16,0.2); font-style:italic; }
  input:focus { border-color:rgba(28,20,16,0.4); }
  input:disabled { opacity:0.5; }

  .submit-btn { padding:8px 14px; background:var(--ink); color:var(--paper); border:none; font-family:var(--font-mono); font-size:14px; cursor:pointer; border-radius:1px; transition:opacity 0.2s; }
  .submit-btn:hover:not(:disabled) { opacity:0.75; }
  .submit-btn:disabled { opacity:0.3; cursor:default; }

  .success { font-family:var(--font-hand); font-size:16px; color:var(--ink); opacity:0.5; padding:12px 0; text-align:center; animation:fadeIn 0.4s ease; }
  .error { font-family:var(--font-mono); font-size:8px; color:var(--vermillion); opacity:0.7; letter-spacing:0.1em; margin-top:8px; }
  .shared-note { font-family:var(--font-mono); font-size:7px; color:var(--ink); opacity:0.2; letter-spacing:0.12em; margin-top:14px; text-align:center; }

  .close { position:absolute; top:12px; right:12px; background:none; border:none; font-family:var(--font-mono); font-size:11px; color:var(--ink); opacity:0.3; cursor:pointer; transition:opacity 0.2s; }
  .close:hover { opacity:0.65; }
</style>

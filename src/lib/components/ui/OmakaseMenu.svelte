<script>
  import { menuOpen, room, phase, goToRoom } from '$lib/stores/state.js';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  const courses = [
    { jp: '序',     en: 'Jo · Prelude',      sub: 'Who I Am',  num: '一', idx: 0 },
    { jp: '前菜',   en: 'Zensai · First',    sub: 'My Story',  num: '二', idx: 1 },
    { jp: '造り',   en: 'Tsukuri · Craft',   sub: 'Projects',  num: '三', idx: 2 },
    { jp: '焼き物', en: 'Yakimono · Fire',    sub: 'Skills',    num: '四', idx: 3 },
    { jp: '水菓子', en: 'Orizuru · Sweet',  sub: 'Contact',   num: '五', idx: 4 },
  ];

  function select(idx) {
    if ($phase === 'inside') goToRoom(idx, true);
    menuOpen.set(false);
  }

  function onKeydown(e) {
    if (e.key === 'Escape') menuOpen.set(false);
  }
</script>

<svelte:window on:keydown={onKeydown} />

<!-- Star toggle button -->
<button
  class="star-toggle"
  class:open={$menuOpen}
  on:click={() => menuOpen.update(v => !v)}
  aria-label={$menuOpen ? 'Close navigation' : 'Open navigation'}
  aria-expanded={$menuOpen}
>
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <polygon
      points="14,2 17,10 26,10 19,16 22,24 14,19 6,24 9,16 2,10 11,10"
      fill="none"
      stroke="rgba(201,168,76,0.75)"
      stroke-width="1.2"
      stroke-linejoin="round"
    />
    <circle cx="14" cy="14" r="3" fill="rgba(201,168,76,0.5)" />
  </svg>
</button>

{#if $menuOpen}
  <!-- Backdrop -->
  <div
    class="backdrop"
    transition:fade={{ duration: 260 }}
    on:click={() => menuOpen.set(false)}
    aria-hidden="true"
  ></div>

  <!-- Sidebar panel -->
  <nav
    class="sidebar"
    transition:fly={{ x: -20, duration: 420, easing: cubicOut }}
    aria-label="Course navigation"
  >
    <div class="panel-header">
      <div class="header-jp">月夜のおまかせ</div>
      <div class="header-en">tsukiyo · tonight's menu</div>
      <div class="panel-rule"></div>
    </div>

    <div class="courses-list">
      {#each courses as c}
        {@const active = $room === c.idx}
        <button
          class="course-btn"
          class:active
          on:click={() => select(c.idx)}
          aria-current={active ? 'page' : undefined}
        >
          <!-- Lantern arch icon -->
          <div class="course-lantern">
            <svg width="44" height="52" viewBox="0 0 44 52" fill="none" aria-hidden="true">
              <path
                d="M4 52 L4 22 Q4 4 22 4 Q40 4 40 22 L40 52"
                fill={active ? 'rgba(14,18,38,0.9)' : 'rgba(14,18,38,0.5)'}
                stroke={active ? 'rgba(201,168,76,0.7)' : 'rgba(201,168,76,0.2)'}
                stroke-width="1"
              />
              <path
                d="M10 52 L10 26 Q10 12 22 12 Q34 12 34 26 L34 52"
                fill="none"
                stroke={active ? 'rgba(201,168,76,0.35)' : 'rgba(201,168,76,0.1)'}
                stroke-width="0.7"
              />
              <path
                d="M16 52 L16 30 Q16 20 22 20 Q28 20 28 30 L28 52"
                fill="none"
                stroke={active ? 'rgba(201,168,76,0.18)' : 'rgba(201,168,76,0.06)'}
                stroke-width="0.5"
              />
              <text
                x="22" y="36"
                text-anchor="middle"
                font-family="var(--font-serif)"
                font-size="11"
                fill={active ? 'rgba(201,168,76,0.95)' : 'rgba(201,168,76,0.45)'}
              >{c.num}</text>
            </svg>
          </div>

          <div class="course-text">
            <span class="course-jp">{c.jp}</span>
            <span class="course-en">{c.en}</span>
            <span class="course-sub">{c.sub}</span>
          </div>

          {#if active}
            <div class="active-dot"></div>
          {/if}
        </button>
      {/each}
    </div>

    <div class="panel-footer">
      <div class="footer-rule"></div>
      <p class="footer-hint">← → to navigate · Esc to close</p>
    </div>

    <div class="watermark">夜</div>
  </nav>
{/if}

<style>
  /* ── Star toggle ── */
  .star-toggle {
    position: fixed;
    top: 22px; left: 22px;
    z-index: 500;
    background: rgba(10,13,26,0.75);
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: 50%;
    width: 52px; height: 52px;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(8px);
    transition: border-color 0.3s, transform 0.4s;
    cursor: pointer;
  }
  .star-toggle:hover {
    border-color: rgba(201,168,76,0.65);
    transform: rotate(18deg);
  }
  .star-toggle.open {
    border-color: rgba(201,168,76,0.65);
    transform: rotate(36deg);
  }

  /* ── Backdrop ── */
  .backdrop {
    position: fixed; inset: 0;
    background: rgba(6,8,16,0.55);
    backdrop-filter: blur(4px);
    z-index: 490;
  }

  /* ── Sidebar panel ── */
  .sidebar {
    position: fixed;
    top: 0; left: 0;
    width: 300px; height: 100vh;
    background: rgba(8,11,22,0.98);
    border-right: 1px solid rgba(201,168,76,0.12);
    z-index: 495;
    display: flex; flex-direction: column;
    padding: 24px 0 20px;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .sidebar::-webkit-scrollbar { display: none; }

  /* ── Header ── */
  .panel-header { padding: 48px 28px 0; }

  .header-jp {
    font-family: var(--font-serif);
    font-size: 22px;
    color: rgba(201,168,76,0.9);
    letter-spacing: 0.15em;
  }
  .header-en {
    font-family: var(--font-mono);
    font-size: 9px;
    color: rgba(201,168,76,0.4);
    letter-spacing: 0.35em;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .panel-rule {
    height: 1px;
    background: linear-gradient(to right, rgba(201,168,76,0.35), transparent);
    margin: 20px 0 10px;
  }

  /* ── Courses list ── */
  .courses-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 16px;
  }

  .course-btn {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 12px;
    background: none;
    border: 1px solid transparent;
    border-radius: 6px;
    text-align: left;
    position: relative;
    cursor: pointer;
    transition: background 0.25s, border-color 0.25s, padding-left 0.2s;
    width: 100%;
  }
  .course-btn:hover {
    background: rgba(201,168,76,0.06);
    border-color: rgba(201,168,76,0.15);
    padding-left: 18px;
  }
  .course-btn.active {
    background: rgba(201,168,76,0.09);
    border-color: rgba(201,168,76,0.28);
  }

  .course-lantern { flex-shrink: 0; }

  .course-text {
    display: flex; flex-direction: column; gap: 1px;
  }
  .course-jp {
    font-family: var(--font-serif);
    font-size: 17px;
    color: rgba(230,220,195,0.9);
    line-height: 1.2;
    transition: color 0.2s;
  }
  .course-btn:hover .course-jp,
  .course-btn.active .course-jp { color: rgba(201,168,76,1); }

  .course-en {
    font-family: var(--font-mono);
    font-size: 10px;
    color: rgba(201,168,76,0.75);
    letter-spacing: 0.1em;
  }
  .course-sub {
    font-family: var(--font-mono);
    font-size: 8px;
    color: rgba(230,220,195,0.3);
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .active-dot {
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    width: 5px; height: 5px;
    border-radius: 50%;
    background: rgba(201,168,76,0.8);
  }

  /* ── Footer ── */
  .panel-footer { padding: 0 28px; }
  .footer-rule {
    height: 1px;
    background: linear-gradient(to right, rgba(201,168,76,0.2), transparent);
    margin-bottom: 12px;
  }
  .footer-hint {
    font-family: var(--font-mono);
    font-size: 8px;
    color: rgba(201,168,76,0.25);
    letter-spacing: 0.18em;
  }

  /* ── Watermark ── */
  .watermark {
    position: absolute;
    bottom: 10px; right: 14px;
    font-family: var(--font-serif);
    font-size: 72px;
    color: rgba(201,168,76,0.04);
    line-height: 1;
    pointer-events: none;
    user-select: none;
  }
</style>
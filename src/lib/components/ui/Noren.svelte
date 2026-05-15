<script>
  export let open = false;
</script>

<div class="noren" class:open>
  <div class="panel left">
    <div class="fabric-texture"></div>
    <div class="char">月</div>
  </div>
  <div class="panel right">
    <div class="fabric-texture"></div>
    <div class="char">夜</div>
  </div>
</div>

<style>
  .noren {
    position: fixed;
    inset: 0;
    z-index: 140;
    display: flex;
    pointer-events: none;
  }

  .panel {
    flex: 1;
    background: linear-gradient(to bottom, #12060200, #1a0a04 8%, #2d1508 50%, #1a0a04 92%, #12060200);
    position: relative;
    overflow: hidden;
    transform-origin: top center;
    transition: transform 0.9s cubic-bezier(0.4, 0, 0.2, 1);
    perspective: 800px;
  }

  .fabric-texture {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to right,
      transparent 0px, transparent 16px,
      rgba(0,0,0,0.18) 16px, rgba(0,0,0,0.18) 18px
    );
  }

  .char {
    position: absolute;
    top: 38%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: var(--font-serif);
    font-size: 32px;
    color: rgba(240,232,208,0.5);
    writing-mode: vertical-rl;
    letter-spacing: 0.3em;
    user-select: none;
  }


  .noren.open .panel.left  { transform: rotateY(-86deg); }
  .noren.open .panel.right { transform: rotateY(86deg);  }

  
  .panel.left  { animation: sway1 4s ease-in-out infinite; }
  .panel.right { animation: sway2 4s ease-in-out infinite; }

  @keyframes sway1 {
    0%,100% { transform: rotateY(-0.5deg); }
    50%      { transform: rotateY(0.5deg); }
  }
  @keyframes sway2 {
    0%,100% { transform: rotateY(0.5deg); }
    50%      { transform: rotateY(-0.5deg); }
  }

  .noren.open .panel.left,
  .noren.open .panel.right {
    animation: none;
  }
</style>

(function(){
  const screen = document.getElementById('loading-screen');
  const fill = document.getElementById('loader-bar-fill');
  const status = document.getElementById('loader-status');
  const percentEl = document.getElementById('loader-percent');
  if(!screen) return;

  const steps = [
    'Booting Cymor OS…',
    'Mounting assets…',
    'Compiling styles…',
    'Waking up the bots…',
    'Syncing MongoDB Atlas…',
    'Rendering hub…',
    'Almost there…'
  ];

  let pct = 0;
  let stepIndex = 0;
  if(status) status.textContent = steps[0];

  function tick(){
    // organic, non-linear increment so it doesn't feel like a fake fixed timer
    const remaining = 100 - pct;
    const jump = Math.max(1, Math.round(remaining * (0.05 + Math.random() * 0.12)));
    pct = Math.min(100, pct + jump);

    if(fill) fill.style.width = pct + '%';
    if(percentEl) percentEl.textContent = pct;

    const nextStep = Math.floor((pct / 100) * (steps.length - 1));
    if(nextStep !== stepIndex && status){
      stepIndex = nextStep;
      status.textContent = steps[stepIndex];
    }

    if(pct < 100){
      setTimeout(tick, 90 + Math.random() * 120);
    }else{
      if(status) status.textContent = steps[steps.length - 1];
      setTimeout(finish, 260);
    }
  }

  function finish(){
    screen.classList.add('glitching');
    setTimeout(() => {
      screen.classList.add('hidden');
      document.body.classList.remove('lock-scroll');
      document.dispatchEvent(new CustomEvent('cymor:loaded'));
    }, 340);
  }

  document.body.classList.add('lock-scroll');
  // small initial delay so the boot sequence reads as intentional, not instant
  setTimeout(tick, 220);

  // Safety net: never let the loader trap a real visitor if something stalls
  setTimeout(() => {
    if(!screen.classList.contains('hidden')){
      pct = 100;
      finish();
    }
  }, 6000);
})();

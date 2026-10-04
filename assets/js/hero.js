/* Hero: interactive CYMOR CORE + rotating "I BUILD …" phrase. */
(function(){
  const canvas = document.getElementById('hero-core');
  const stage = document.getElementById('hero-stage');
  if(!canvas) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 767px)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const tip = document.getElementById('tech-tip');
  let core = null, visible = true;

  function webglFree(){ // canvas-2D only; guard for browsers lacking ResizeObserver
    return 'ResizeObserver' in window && !!canvas.getContext;
  }
  async function initCore(){
    if(!webglFree()){ stage.classList.add('no-core'); return; }
    const stack = await window.CYMOR_STACK_P;
    core = new CymorCore(canvas, {nodes: mobile ? 80 : 150, labels: stack, rings: !mobile, radius: .2, dprMax: mobile ? 1.5 : 2});
    core.onHover = (i, hit, sat) => {
      if(!hit){ tip.classList.remove('on'); return; }
      tip.innerHTML = `<b>${sat.name.toUpperCase()}</b><span>${sat.caption}</span>`;
      tip.style.left = (hit.x + hit.w / 2) + 'px'; tip.style.top = (hit.y - 10) + 'px';
      tip.classList.add('on');
    };
    const rel = e => { const r = canvas.getBoundingClientRect(); core.setPointer(e.clientX - r.left, e.clientY - r.top); };
    if(finePointer && !reduced){
      window.addEventListener('pointermove', e => {
        core.setParallax(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1); rel(e);
      }, {passive:true});
    }
    canvas.addEventListener('pointerdown', e => { rel(e); setTimeout(() => core.setPointer(-1e4, -1e4), 2500); });
    stage.addEventListener('pointerleave', () => core.setPointer(-1e4, -1e4));
    // only animate while on screen and tab visible
    const sync = () => reduced ? core.resize() : (visible && !document.hidden && !document.body.classList.contains('intro-active')) ? core.start() : core.stop();
    new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }).observe(stage);
    document.addEventListener('visibilitychange', sync);
    document.addEventListener('cymor:loaded', sync);
    sync();
    if(reduced) core.resize();
  }

  /* rotating phrase: type → hold → (backspace | fade) → next */
  function initPhrases(){
    const el = document.getElementById('rot'); if(!el) return;
    const phrases = ['AI SYSTEMS', 'WEB APPS', 'WHATSAPP BOTS', 'AUTOMATION', 'DIGITAL TOOLS', 'PWAs'];
    if(reduced){ el.textContent = 'AI SYSTEMS, WEB APPS & BOTS'; return; }
    const wait = ms => new Promise(r => setTimeout(r, ms));
    (async function loop(n){
      for(;;){
        const text = phrases[n % phrases.length];
        for(let i = 1; i <= text.length; i++){ el.textContent = text.slice(0, i); await wait(70 + Math.random() * 45); }
        await wait(1700);
        if(n % 2){ for(let i = text.length - 1; i >= 0; i--){ el.textContent = text.slice(0, i); await wait(32); } }
        else{ el.classList.add('fade'); await wait(380); el.textContent = ''; el.classList.remove('fade'); }
        await wait(220); n++;
      }
    })(0);
  }
  initCore(); initPhrases();
})();

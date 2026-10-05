/*
  Cinematic intro: black → point of light → world forms → technologies orbit →
  world moves aside → CYMORTECHSERVICES types → glitch → flash → homepage.
  Plays on every visit. Reduced motion: quick fade. Always skippable (button, Escape, or click).
*/
(function(){
  const intro = document.getElementById('intro');
  const body = document.body;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 767px)').matches;
  let done = false, skipped = false, core = null;

  function release(){
    body.classList.remove('lock-scroll', 'intro-active');
    document.dispatchEvent(new CustomEvent('cymor:loaded'));
  }
  async function finish(fast){
    if(done) return; done = true;
    if(!intro){ release(); return; }
    if(fast || reduced){
      intro.classList.add('fast-out'); await wait(260);
    }else{
      intro.classList.add('boom'); await wait(380);   // flash peak: swap in the homepage
    }
    release();
    await wait(fast || reduced ? 120 : 620);
    if(core) core.dispose();
    intro.remove();
  }
  function tween(obj, key, to, ms){
    return new Promise(res => {
      const from = obj[key], t0 = performance.now();
      (function step(now){
        if(skipped) return res();
        const p = Math.min(1, (now - t0) / ms), e = p < .5 ? 2*p*p : 1 - Math.pow(-2*p + 2, 2) / 2;
        obj[key] = from + (to - from) * e;
        p < 1 ? requestAnimationFrame(step) : res();
      })(t0);
    });
  }
  async function typeBrand(){
    const el = document.getElementById('intro-type'), word = 'CYMORTECHSERVICES';
    document.getElementById('intro-text').classList.add('on');
    for(let i = 1; i <= word.length; i++){
      if(skipped) return;
      el.textContent = word.slice(0, i); el.dataset.text = word.slice(0, i);
      await wait(70 + Math.random() * 60 + (i === 5 || i === 9 ? 240 : 0));
    }
  }
  async function glitch(){
    if(skipped) return;
    const t = document.getElementById('intro-text');
    t.classList.add('glitch'); intro.classList.add('scan');
    await wait(560);
    t.classList.remove('glitch'); intro.classList.remove('scan');
  }
  async function sequence(){
    const skip = document.getElementById('intro-skip');
    const quick = () => { skipped = true; finish(true); };
    skip.addEventListener('click', e => { e.stopPropagation(); quick(); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape' && !done) quick(); });
    if(reduced){ return finish(true); }

    const stack = await window.CYMOR_STACK_P;
    core = new CymorCore(document.getElementById('intro-canvas'), {
      nodes: mobile ? 80 : 140, labels: stack, rings: !mobile, radius: mobile ? .2 : .27, grow: 0, sat: 0, dprMax: mobile ? 1.5 : 2
    });
    core.start();

    setTimeout(() => { skip.classList.add('show'); }, 900);

    await wait(800);                            // Scene 1 — black, then a point of light
    await wait(700);
    await tween(core, 'grow', 1, 2200);         // Scene 2 — the world forms
    tween(core, 'sat', 1, 1500);                // Scene 3 — technologies orbit
    await wait(2400);
    core.beat = true;                           // the world keeps glowing
    if(mobile){ tween(core, 'oy', -.27, 1800); tween(core, 'scale', .62, 1800); } else { tween(core, 'ox', -.23, 1800); tween(core, 'scale', .9, 1800); }
    await wait(1500);      // Scene 4 — the world moves aside
    await typeBrand();                          // Scene 5 — type CYMORTECHSERVICES
    await wait(350);
    await glitch();                             // Scene 6 — glitch
    core.pulse = 1;
    await wait(120);
    finish(false);                              // Scene 7 — boom into the homepage
  }
  if(intro) sequence(); else release();
})();

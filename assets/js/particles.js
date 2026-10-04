/* Hero particle field: cursor-reactive, paused when off-screen or tab hidden. */
(function(){
  const canvas = document.getElementById('hero-particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 767px)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const COLORS = ['rgba(244,195,104,.55)', 'rgba(139,107,255,.55)', 'rgba(56,214,255,.45)', 'rgba(245,241,234,.3)'];
  let parts = [], w, h, mx = -1e4, my = -1e4, running = false, visible = true, raf = 0;

  function resize(){
    const r = canvas.parentElement.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
    w = r.width; h = r.height; canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(mobile ? 28 : 70, Math.round(w * h / (mobile ? 16000 : 14000)));
    parts = Array.from({length:n}, () => ({x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25,
      r:Math.random()*1.6 + .6, c:COLORS[Math.floor(Math.random()*COLORS.length)]}));
    if(!running) draw();
  }
  function draw(){
    ctx.clearRect(0, 0, w, h);
    for(const p of parts){
      const dx = p.x - mx, dy = p.y - my, d2 = dx*dx + dy*dy;
      if(d2 < 14400){ const d = Math.sqrt(d2) || 1, f = (120 - d) / 120 * .6; p.x += dx / d * f; p.y += dy / d * f; }
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1; if(p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fillStyle = p.c; ctx.fill();
    }
    const L = mobile ? 90 : 120;
    for(let i = 0; i < parts.length; i++) for(let j = i + 1; j < parts.length; j++){
      const a = parts[i], b = parts[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx*dx + dy*dy);
      if(d < L){ ctx.strokeStyle = `rgba(139,107,255,${.16 * (1 - d / L)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
  }
  function loop(){ if(!running) return; draw(); raf = requestAnimationFrame(loop); }
  function sync(){
    const want = visible && !document.hidden && !reduced;
    if(want && !running){ running = true; raf = requestAnimationFrame(loop); }
    else if(!want && running){ running = false; cancelAnimationFrame(raf); }
  }
  if(fine && !reduced){
    canvas.parentElement.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, {passive:true});
    canvas.parentElement.addEventListener('pointerleave', () => { mx = my = -1e4; });
  }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }).observe(canvas.parentElement);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', resize, {passive:true});
  resize(); sync();
})();

/* CYMOR NETWORK — projects as one ecosystem. Click / tap / Enter on a node opens its detail view. */
(function(){
  const cv = document.getElementById('net-canvas'), box = document.getElementById('network');
  const gridView = document.getElementById('grid-view');
  if(!cv) return;
  const ctx = cv.getContext('2d'), TAU = Math.PI * 2;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let nodes = [], w = 0, h = 0, t = 0, mx = -1e4, my = -1e4, hover = -1, running = false, visible = false, raf = 0, last = 0, picked = -1;

  function build(list){
    nodes = list.map((p, i) => ({p, a:i / list.length * TAU, rr:.62 + (i % 3) * .17, dir:i % 2 ? -1 : 1, ph:i * 1.7, ox:0, oy:0, x:0, y:0}));
    const ul = document.getElementById('net-list');           // keyboard / screen-reader access
    ul.innerHTML = list.map(p => `<li><button type="button" data-open="${esc(p.id)}">${esc(p.name)}</button></li>`).join('');
    resize(); sync();
  }
  function resize(){
    const dpr = Math.min(devicePixelRatio || 1, 2); w = cv.clientWidth; h = cv.clientHeight; if(!w) return;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if(!running) draw();
  }
  function layout(){
    const cx = w / 2, cy = h / 2, S = Math.min(w / 2, h / 2) * .88;
    for(const n of nodes){
      const a = n.a + (reduced ? 0 : t * .035 * n.dir), wob = reduced ? 0 : Math.sin(t * .7 + n.ph) * 4;
      let x = cx + Math.cos(a) * n.rr * S * (w > h ? 1.45 : 1) + wob, y = cy + Math.sin(a) * n.rr * S + wob;
      const dx = x - mx, dy = y - my, d = Math.sqrt(dx*dx + dy*dy);
      const push = d < 110 ? (110 - d) / 110 * 22 : 0;
      n.ox += ((d ? dx / d : 0) * push - n.ox) * .12; n.oy += ((d ? dy / d : 0) * push - n.oy) * .12;
      n.x = x + n.ox; n.y = y + n.oy;
    }
    return {cx, cy};
  }
  function draw(){
    if(!w) return;
    ctx.clearRect(0, 0, w, h);
    const {cx, cy} = layout(), act = picked >= 0 ? picked : hover;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120); g.addColorStop(0, 'rgba(139,107,255,.35)'); g.addColorStop(1, 'rgba(139,107,255,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - 130, cy - 130, 260, 260);
    // same-category links (the "ecosystem")
    ctx.lineWidth = 1;
    for(let i = 0; i < nodes.length; i++){
      const a = nodes[i], b = nodes.find((m, j) => j > i && m.p.category === a.p.category);
      if(b){ ctx.strokeStyle = 'rgba(56,214,255,.09)'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    nodes.forEach((n, i) => {
      const on = i === act;
      ctx.strokeStyle = on ? 'rgba(244,195,104,.9)' : 'rgba(139,107,255,.28)'; ctx.lineWidth = on ? 1.6 : 1;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(n.x, n.y); ctx.stroke();
    });
    // core
    ctx.beginPath(); ctx.arc(cx, cy, 17 + Math.sin(t * 2) * 1.2, 0, TAU);
    ctx.fillStyle = '#f4c368'; ctx.shadowColor = '#f4c368'; ctx.shadowBlur = 26; ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#05050b'; ctx.font = "700 10px 'Space Grotesk', sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CYMOR', cx, cy + 1);
    // nodes
    nodes.forEach((n, i) => {
      const on = i === act, r = on ? 21 : 16;
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, TAU);
      ctx.fillStyle = 'rgba(12,10,26,.92)'; ctx.strokeStyle = on ? '#f4c368' : 'rgba(120,190,255,.55)'; ctx.lineWidth = 1.2;
      ctx.shadowColor = on ? '#f4c368' : '#8b6bff'; ctx.shadowBlur = on ? 24 : 10; ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.font = `${on ? 17 : 14}px sans-serif`; ctx.fillStyle = '#fff'; ctx.fillText(n.p.icon || '•', n.x, n.y + 1);
      if(on || (w > 560 && fine)){
        ctx.font = `500 ${on ? 12 : 10}px 'IBM Plex Mono', monospace`;
        ctx.fillStyle = on ? '#fff3d6' : 'rgba(207,230,255,.6)'; ctx.fillText(n.p.name, n.x, n.y + r + 12);
      }
    });
  }
  function loop(now){
    if(!running) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    let hv = -1; nodes.forEach((n, i) => { const dx = n.x - mx, dy = n.y - my; if(dx*dx + dy*dy < 26 * 26) hv = i; });
    if(hv !== hover){ hover = hv; cv.style.cursor = hv >= 0 ? 'pointer' : 'default'; }
    draw(); raf = requestAnimationFrame(loop);
  }
  function sync(){
    const want = visible && !document.hidden && !reduced && nodes.length;
    if(want && !running){ running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
    else if(!want && running){ running = false; cancelAnimationFrame(raf); }
    if(!want) draw();
  }
  function rel(e){ const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }
  function hit(){ let k = -1; nodes.forEach((n, i) => { const dx = n.x - mx, dy = n.y - my; if(dx*dx + dy*dy < 28 * 28) k = i; }); return k; }
  cv.addEventListener('pointermove', rel, {passive:true});
  cv.addEventListener('pointerleave', () => { mx = my = -1e4; });
  cv.addEventListener('click', e => {
    rel(e); const k = hit(); if(k < 0) return;
    if(!fine && picked !== k){ picked = k; draw(); return; }      // touch: first tap labels, second opens
    picked = -1; window.openProjectModal(nodes[k].p.id);
  });
  new IntersectionObserver(es => { visible = es[0].isIntersecting && !box.hidden; sync(); }).observe(box);
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(resize).observe(cv);
  document.addEventListener('cymor:projects-ready', e => build(e.detail));
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
    const net = b.dataset.view === 'network';
    document.querySelectorAll('[data-view]').forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b); });
    gridView.hidden = net; box.hidden = !net; if(net){ resize(); visible = true; sync(); }
  }));
})();

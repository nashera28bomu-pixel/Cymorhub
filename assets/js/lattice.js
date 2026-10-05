/*
  Background: a diamond-cubic carbon lattice — every atom bonded to four neighbours in a tetrahedron.
  Slowly rotates, reacts to the pointer and to scrolling. Paused when the tab is hidden.
*/
(function(){
  const cv = document.getElementById('lattice'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 767px)').matches;
  const N = mobile ? 3 : 4;                       // unit cells per axis
  const atoms = [], bonds = [];
  const basis = [[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0],[.25,.25,.25],[.25,.75,.75],[.75,.25,.75],[.75,.75,.25]];
  for(let i = 0; i < N; i++) for(let j = 0; j < N; j++) for(let k = 0; k < N; k++)
    for(const b of basis) atoms.push([i + b[0] - N/2, j + b[1] - N/2, k + b[2] - N/2]);
  const BL = Math.sqrt(3) / 4;                    // diamond bond length in cell units
  for(let a = 0; a < atoms.length; a++) for(let b = a + 1; b < atoms.length; b++){
    const dx = atoms[a][0]-atoms[b][0], dy = atoms[a][1]-atoms[b][1], dz = atoms[a][2]-atoms[b][2];
    if(Math.abs(Math.sqrt(dx*dx + dy*dy + dz*dz) - BL) < .02) bonds.push([a, b]);
  }
  let w, h, dpr, S, t = 0, px = 0, py = 0, tx = 0, ty = 0, raf = 0, running = false, last = 0;
  const P = atoms.map(() => ({x:0, y:0, z:0}));
  function resize(){
    dpr = Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.75);
    w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr;
    cv.style.width = w + 'px'; cv.style.height = h + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = Math.max(w, h) * (mobile ? .3 : .24);
    if(!running) draw();
  }
  function draw(){
    ctx.clearRect(0, 0, w, h);
    const ry = t * .07 + scrollY * .0007 + px * .35, rx = .55 + py * .25 + scrollY * .00015;
    const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    const ox = w * (mobile ? .5 : .62), oy = h * .5;
    for(let i = 0; i < atoms.length; i++){
      const a = atoms[i], x1 = a[0]*cy + a[2]*sy, z1 = -a[0]*sy + a[2]*cy;
      const y2 = a[1]*cx - z1*sx, z2 = a[1]*sx + z1*cx, f = 9 / (9 + z2);
      const p = P[i]; p.x = ox + x1 * S * f; p.y = oy + y2 * S * f; p.z = z2; p.f = f;
    }
    // bonds in three depth bands (few state changes)
    const zr = N * .9;
    for(let band = 0; band < 3; band++){
      ctx.beginPath();
      for(const [a, b] of bonds){
        const z = (P[a].z + P[b].z) / 2, d = Math.min(2, Math.max(0, Math.floor((1 - z / zr) * 1.5)));
        if(d !== band) continue; ctx.moveTo(P[a].x, P[a].y); ctx.lineTo(P[b].x, P[b].y);
      }
      ctx.strokeStyle = `rgba(${band === 0 ? '150,215,255' : band === 1 ? '120,170,255' : '139,107,255'},${[.26, .15, .08][band]})`;
      ctx.lineWidth = [1.3, 1, .8][band]; ctx.stroke();
    }
    for(let band = 0; band < 2; band++){
      ctx.beginPath();
      for(const p of P){ const near = p.z < 0; if(near !== !!band) continue; const r = (near ? 2.6 : 1.7) * p.f; ctx.moveTo(p.x + r, p.y); ctx.arc(p.x, p.y, r, 0, 6.2832); }
      ctx.fillStyle = band ? 'rgba(215,235,255,.85)' : 'rgba(170,190,255,.45)'; ctx.fill();
    }
  }
  function loop(now){
    if(!running) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    px += (tx - px) * .04; py += (ty - py) * .04; draw(); raf = requestAnimationFrame(loop);
  }
  function sync(){
    const want = !document.hidden && !reduced && !document.body.classList.contains('intro-active');
    if(want && !running){ running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
    else if(!want && running){ running = false; cancelAnimationFrame(raf); }
    if(!want) draw();
  }
  if(matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced)
    addEventListener('pointermove', e => { tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; }, {passive:true});
  addEventListener('resize', resize, {passive:true});
  document.addEventListener('visibilitychange', sync); document.addEventListener('cymor:loaded', sync);
  resize(); sync();
})();

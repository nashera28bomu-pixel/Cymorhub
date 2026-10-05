/* Subtle custom cursor (desktop only). The native pointer stays visible; a ring follows it. */
(function(){
  if(!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ring = document.createElement('div'), dot = document.createElement('div');
  ring.className = 'cur-ring'; dot.className = 'cur-dot'; ring.innerHTML = '<span></span>';
  document.body.append(ring, dot);
  const label = ring.firstChild; let x = -100, y = -100, rx = x, ry = y, on = false;
  addEventListener('pointermove', e => {
    x = e.clientX; y = e.clientY; if(!on){ on = true; document.documentElement.classList.add('cur-on'); rx = x; ry = y; }
    const t = e.target.closest ? e.target.closest('.project-card, .fcard, a, button, input, [role="button"], .filter-chip') : null;
    const proj = t && t.closest('.project-card, .fcard') && !t.matches('a, button');
    document.documentElement.classList.toggle('cur-link', !!t && !proj);
    document.documentElement.classList.toggle('cur-project', !!proj);
    label.textContent = proj ? 'VIEW →' : '';
  }, {passive:true});
  addEventListener('pointerdown', () => document.documentElement.classList.add('cur-down'));
  addEventListener('pointerup', () => document.documentElement.classList.remove('cur-down'));
  document.addEventListener('mouseleave', () => document.documentElement.classList.remove('cur-on'));
  (function loop(){
    rx += (x - rx) * .2; ry += (y - ry) * .2;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`; dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    requestAnimationFrame(loop);
  })();
})();

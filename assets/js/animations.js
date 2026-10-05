/*
  Scroll choreography. Anything with class "rv" slides / flips / zooms in (data-rv="left|right|up|zoom|flip",
  optional --d delay). Counters count up once visible. Pure IntersectionObserver — no scroll listeners.
*/
(function(){
  let io;
  function observe(){
    if(!io) io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.12, rootMargin:'0px 0px -6% 0px'});
    document.querySelectorAll('.rv:not(.in):not([data-seen])').forEach(el => { el.dataset.seen = 1; io.observe(el); });
  }
  function count(el){
    const target = el.dataset.target, pct = el.dataset.percent === 'true';
    if(target === 'infinite'){ el.textContent = '∞'; return; }
    const end = parseInt(target, 10), t0 = performance.now();
    (function f(now){ const p = Math.min(1, (now - t0) / 1200); const v = Math.round((1 - Math.pow(1 - p, 3)) * end); el.textContent = pct ? v + '%' : v; if(p < 1) requestAnimationFrame(f); })(t0);
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.section-head, .flow-step, .about-grid > *, .stats-grid, .sys-grid > *, .contact-section .wrap > *').forEach(el => { if(!el.classList.contains('rv')) el.classList.add('rv'); });
    document.querySelectorAll('.flow-step').forEach((el, i) => el.style.setProperty('--d', i * 130 + 'ms'));
    observe();
    const cio = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ count(e.target); cio.unobserve(e.target); } }), {threshold:.4});
    document.querySelectorAll('.stat-value[data-target]').forEach(s => cio.observe(s));
  });
  ['cymor:projects-ready', 'cymor:rv-refresh'].forEach(ev => document.addEventListener(ev, () => requestAnimationFrame(observe)));
  document.addEventListener('DOMContentLoaded', () => setTimeout(observe, 400));
})();

/* Floating navbar: scroll state, active-section indicator, full-screen mobile menu, magnetic buttons. */
(function(){
  const nav = document.getElementById('nav'), links = document.getElementById('nav-links');
  const ind = document.getElementById('nav-ind'), toggle = document.getElementById('nav-toggle');
  const mobile = document.getElementById('mobile-nav');
  if(!nav) return;

  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 24), {passive:true});

  function moveIndicator(a){
    if(!a || !ind || getComputedStyle(links).display === 'none') return;
    ind.style.width = a.offsetWidth + 'px'; ind.style.transform = `translateX(${a.offsetLeft}px)`; ind.style.opacity = 1;
  }
  const anchors = [...links.querySelectorAll('a')];
  const map = new Map(anchors.map(a => [a.getAttribute('href').slice(1), a]));
  let current = anchors[0];
  function setActive(id){
    const a = map.get(id); if(!a) return;
    current = a; anchors.forEach(x => { x.classList.toggle('active', x === a); x === a ? x.setAttribute('aria-current', 'true') : x.removeAttribute('aria-current'); });
    moveIndicator(a);
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) setActive(e.target.id); }), {rootMargin:'-45% 0px -50% 0px'});
  map.forEach((_, id) => { const s = document.getElementById(id); if(s) io.observe(s); });
  addEventListener('resize', () => moveIndicator(current), {passive:true});
  document.fonts && document.fonts.ready.then(() => moveIndicator(current));
  setActive('top');

  function setMenu(open){
    mobile.classList.toggle('open', open); toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open); document.body.classList.toggle('lock-scroll', open);
    mobile.inert = !open;
  }
  mobile.inert = true;
  toggle.addEventListener('click', () => setMenu(!mobile.classList.contains('open')));
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if(e.key === 'Escape' && mobile.classList.contains('open')) setMenu(false); });
  matchMedia('(min-width: 900px)').addEventListener('change', e => { if(e.matches) setMenu(false); });

  // magnetic buttons (desktop, fine pointer, no reduced motion)
  if(matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.addEventListener('pointermove', e => {
      const b = e.target.closest && e.target.closest('.btn-primary, .btn-ghost, .nav-cta'); if(!b) return;
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width/2) * .12}px, ${(e.clientY - r.top - r.height/2) * .2}px)`;
    }, {passive:true});
    document.addEventListener('pointerout', e => { const b = e.target.closest && e.target.closest('.btn-primary, .btn-ghost, .nav-cta'); if(b) b.style.transform = ''; });
  }
})();

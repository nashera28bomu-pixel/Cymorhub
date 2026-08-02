(function(){
  const canvas = document.getElementById('hero-particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let particles = [];
  let w, h, dpr;

  const COLORS = ['rgba(232,163,61,0.55)', 'rgba(139,107,255,0.5)', 'rgba(245,241,234,0.35)'];

  function resize(){
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width; h = rect.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    seed();
  }

  function seed(){
    const count = Math.min(46, Math.round((w * h) / 14000));
    particles = Array.from({length: count}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6,
      c: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));
  }

  function step(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.c;
      ctx.fill();
    }
    // connective lines for nearby particles
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < 110){
          ctx.beginPath();
          ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle = `rgba(232,163,61,${0.12 * (1 - dist/110)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    if(!reduceMotion) requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize, {passive:true});
  resize();
  step();
})();

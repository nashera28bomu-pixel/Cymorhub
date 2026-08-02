(function(){
  function initReveals(){
    const targets = document.querySelectorAll('.section-head, .about-grid, .timeline, .stats-grid, #services-grid, .contact-section');
    targets.forEach(t => t.classList.add('reveal'));

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.15});

    targets.forEach(t => io.observe(t));
  }

  function animateCount(el){
    const target = el.dataset.target;
    const isPercent = el.dataset.percent === 'true';
    if(target === 'infinite'){ el.textContent = '∞'; return; }

    const end = parseInt(target, 10);
    const duration = 1200;
    const start = performance.now();

    function frame(now){
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * end);
      el.textContent = isPercent ? value + '%' : value;
      if(progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initStats(){
    const stats = document.querySelectorAll('.stat-value[data-target]');
    if(!stats.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.4});
    stats.forEach(s => io.observe(s));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initReveals();
    initStats();
  });
})();

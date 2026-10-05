/* Command palette — Ctrl/⌘ + K. */
(function(){
  const root = document.getElementById('pal'), input = document.getElementById('pal-input'), list = document.getElementById('pal-list');
  if(!root) return;
  let items = [], shown = [], idx = 0, lastFocus = null;
  const go = sel => () => { const el = document.querySelector(sel); if(el) el.scrollIntoView({behavior:'smooth'}); };

  function build(){
    const base = [
      {t:'View services', h:'Section', run:go('#services')},
      {t:'How I work', h:'Section', run:go('#process')},
      {t:'About Cymor', h:'Section', run:go('#about')},
      {t:'Explore projects', h:'Section', run:go('#projects')},
      {t:'View the project network', h:'Section', run:() => { const b = document.querySelector('[data-view="network"]'); if(b) b.click(); go('#projects')(); }},
      {t:'View the lab', h:'Section', run:go('#lab')},
      {t:'View the stack', h:'Section', run:go('#stack')},
      {t:'Open system info', h:'Section', run:go('#system')},
      {t:'Contact', h:'Section', run:go('#contact')},
      {t:'Chat on WhatsApp', h:'Link', run:() => window.open(window.CYMOR_WA_URL || '#', '_blank', 'noopener')}
    ];
    const proj = (window.CYMOR_PROJECTS || []).map(p => ({t:'Open ' + p.name, h:'Project', run:() => window.openProjectModal(p.id)}));
    items = base.concat(proj);
  }
  function render(){
    const q = input.value.trim().toLowerCase();
    shown = items.filter(i => !q || q.split(/\s+/).every(w => (i.t + ' ' + i.h).toLowerCase().includes(w))).slice(0, 12);
    idx = Math.min(idx, Math.max(0, shown.length - 1));
    list.innerHTML = shown.length ? shown.map((i, n) => `<li role="option" id="pal-${n}" aria-selected="${n === idx}" data-n="${n}"><span>${esc(i.t)}</span><em>${i.h}</em></li>`).join('')
      : `<li class="pal-empty">No matching command</li>`;
    input.setAttribute('aria-activedescendant', shown.length ? 'pal-' + idx : '');
  }
  function open(){ build(); lastFocus = document.activeElement; root.hidden = false; input.value = ''; idx = 0; render(); input.focus(); document.body.classList.add('lock-scroll'); }
  function close(){ root.hidden = true; document.body.classList.remove('lock-scroll'); if(lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true}); }
  function run(n){ const it = shown[n]; if(!it) return; close(); setTimeout(it.run, 60); }

  document.addEventListener('keydown', e => {
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); root.hidden ? open() : close(); return; }
    if(root.hidden) return;
    if(e.key === 'Escape') close();
    else if(e.key === 'ArrowDown'){ e.preventDefault(); idx = (idx + 1) % Math.max(1, shown.length); render(); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); idx = (idx - 1 + shown.length) % Math.max(1, shown.length); render(); }
    else if(e.key === 'Enter'){ e.preventDefault(); run(idx); }
    else if(e.key === 'Tab') e.preventDefault();
  });
  input.addEventListener('input', () => { idx = 0; render(); });
  list.addEventListener('click', e => { const li = e.target.closest('li[data-n]'); if(li) run(+li.dataset.n); });
  root.addEventListener('pointerdown', e => { if(e.target === root) close(); });
  const btn = document.getElementById('pal-open'); if(btn) btn.addEventListener('click', open);
})();

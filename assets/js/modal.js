/* Project detail experience: bottom-sheet on phones, centred glass panel on desktop. */
(function(){
  let lastFocus = null;
  function html(p){
    const status = esc((p.status || '').toLowerCase());
    const tags = buildTags(p);
    return `
      <button class="modal-close" id="modal-close-btn" aria-label="Close">✕</button>
      <div class="modal-handle"></div>
      <div class="modal-thumb project-thumb">${thumbHTML(p)}</div>
      <div class="modal-title">
        <h3 id="modal-heading">${esc(p.name)}</h3>
        <span class="status-badge ${status}"><span class="dot"></span>${esc(p.status || '')}</span>
      </div>
      <p class="modal-desc">${esc(p.description || p.shortDescription)}</p>
      ${(p.features || []).length ? `<h4 class="modal-sub">Capabilities</h4><ul class="modal-features">${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
      <div class="modal-tags project-tags">${tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>
      <div class="modal-ctas">
        ${p.url ? `<a class="btn-primary" href="${esc(p.url)}" target="_blank" rel="noopener">Live demo →</a>` : ''}
        ${p.githubUrl ? `<a class="btn-ghost" href="${esc(p.githubUrl)}" target="_blank" rel="noopener">Source →</a>` : ''}
        <a class="btn-ghost" data-wa-link href="${esc(window.CYMOR_WA_URL || '#')}" target="_blank" rel="noopener">Ask about this</a>
      </div>`;
  }
  function close(){
    const o = document.getElementById('project-modal-overlay');
    if(!o.classList.contains('open')) return;
    o.classList.remove('open'); document.body.classList.remove('lock-scroll');
    if(lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true});
  }
  window.openProjectModal = function(id){
    const p = (window.CYMOR_PROJECTS || []).find(x => x.id === id); if(!p) return;
    const o = document.getElementById('project-modal-overlay'), m = document.getElementById('project-modal');
    lastFocus = document.activeElement;
    m.innerHTML = html(p); wireImages(m);
    o.classList.add('open'); document.body.classList.add('lock-scroll');
    const x = document.getElementById('modal-close-btn'); x.addEventListener('click', close); x.focus({preventScroll:true});
  };
  document.addEventListener('DOMContentLoaded', () => {
    const o = document.getElementById('project-modal-overlay');
    o.addEventListener('click', e => { if(e.target === o) close(); });
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape') close();
      if(e.key === 'Tab' && o.classList.contains('open')){          // keep focus inside the dialog
        const f = [...o.querySelectorAll('a[href], button')].filter(n => !n.disabled);
        if(!f.length) return; const first = f[0], last = f[f.length - 1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    });
  });
})();

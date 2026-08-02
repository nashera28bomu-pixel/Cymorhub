(function(){
  function modalHTML(p){
    const thumbInner = p.thumb
      ? `<img src="${p.thumb}" alt="${p.name} screenshot">`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:44px;">${p.icon || '🚀'}</div>`;
    const statusClass = (p.status || '').toLowerCase();
    const tags = typeof buildTags === 'function' ? buildTags(p) : [];
    return `
      <button class="modal-close" id="modal-close-btn" aria-label="Close">✕</button>
      <div class="modal-handle"></div>
      <div class="modal-thumb">${thumbInner}</div>
      <div class="modal-title">
        <h3>${p.name}</h3>
        <span class="status-badge ${statusClass}" style="position:static;"><span class="dot"></span>${p.status || ''}</span>
      </div>
      <p class="modal-desc">${p.description || p.shortDescription || ''}</p>
      <ul class="modal-features">${(p.features || []).map(f => `<li>${f}</li>`).join('')}</ul>
      <div class="modal-tags">${tags.map(t => `<span class="project-tags"><span>${t}</span></span>`).join('')}</div>
      <div class="modal-ctas">
        <a class="btn-primary" href="${p.url || '#'}" target="_blank" rel="noopener">Open project</a>
        <a class="btn-ghost" data-wa-link href="#" target="_blank" rel="noopener">Ask about this</a>
      </div>`;
  }

  window.openProjectModal = function(id){
    const p = window.CYMOR_PROJECTS.find(x => x.id === id);
    if(!p) return;
    const overlay = document.getElementById('project-modal-overlay');
    const modal = document.getElementById('project-modal');
    modal.innerHTML = modalHTML(p);
    overlay.classList.add('open');
    document.body.classList.add('lock-scroll');

    const wa = modal.querySelector('[data-wa-link]');
    if(wa && window.CYMOR_WA_URL) wa.setAttribute('href', window.CYMOR_WA_URL);

    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  };

  function closeModal(){
    const overlay = document.getElementById('project-modal-overlay');
    overlay.classList.remove('open');
    document.body.classList.remove('lock-scroll');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('project-modal-overlay');
    if(overlay){
      overlay.addEventListener('click', e => { if(e.target === overlay) closeModal(); });
    }
    document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });
  });
})();

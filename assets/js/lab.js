/* "In the lab" strip (inside Projects) from data/lab.json. A progress bar shows only if you set "progress" (0-100) by hand. */
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const box = document.getElementById('lab-grid'); if(!box) return;
    fetch('data/lab.json').then(r => r.ok ? r.json() : []).catch(() => []).then(list => {
      if(!list.length) return;
      box.innerHTML = list.map(p => `<article class="lab-card glass rv" data-rv="up">
        <span class="lab-status"><span class="dot"></span>${esc(p.status)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p>
        ${(p.focus || []).length ? `<div class="project-tags">${p.focus.map(f => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
        ${typeof p.progress === 'number' ? `<div class="lab-bar"><i style="width:${p.progress}%"></i></div>` : ''}
        ${p.url ? `<a class="btn-ghost" href="${esc(p.url)}" target="_blank" rel="noopener">Open →</a>` : ''}</article>`).join('');
      document.getElementById('lab').hidden = false;
    });
  });
})();

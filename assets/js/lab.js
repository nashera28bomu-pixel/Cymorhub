/* CYMOR LAB + CURRENTLY BUILDING from data/lab.json. Progress bars only render if "progress" (0-100) is set by hand. */
(function(){
  function status(s){ return `<span class="lab-status"><span class="dot"></span>${esc(s)}</span>`; }
  function card(p){
    return `<article class="lab-card glass reveal-child">
      ${status(p.status)}<h3>${esc(p.name)}</h3><p>${esc(p.description)}</p>
      ${(p.focus || []).length ? `<div class="project-tags">${p.focus.map(f => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
      ${typeof p.progress === 'number' ? `<div class="lab-bar" role="progressbar" aria-valuenow="${p.progress}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p.progress}%"></i></div>` : ''}
      ${p.url ? `<a class="btn-ghost" href="${esc(p.url)}" target="_blank" rel="noopener">Open →</a>` : ''}
    </article>`;
  }
  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('lab-grid'), now = document.getElementById('building');
    if(!grid) return;
    fetch('data/lab.json').then(r => { if(!r.ok) throw 0; return r.json(); }).then(list => {
      const cur = list.filter(p => p.current);
      now.innerHTML = cur.length ? `<div class="eyebrow">Currently building</div>` + cur.map(card).join('') : '';
      now.hidden = !cur.length;
      grid.innerHTML = list.filter(p => !p.current).map(card).join('');
      grid.classList.add('reveal-group');
      document.getElementById('lab').hidden = !list.length;
    }).catch(() => { document.getElementById('lab').hidden = true; });
  });
})();

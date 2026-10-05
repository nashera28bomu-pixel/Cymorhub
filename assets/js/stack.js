/* STACK: technologies from data/stack.json; the detail panel lists projects whose data mentions the technology. */
(function(){
  const grid = document.getElementById('stack-grid'), detail = document.getElementById('stack-detail');
  if(!grid) return;
  const used = name => {
    const k = name.toLowerCase().replace('.js', '');
    return (window.CYMOR_PROJECTS || []).filter(p => [p.name, p.description, (p.features || []).join(' '), (p.tech || []).join(' ')].join(' ').toLowerCase().includes(k));
  };
  function show(s){
    const ps = used(s.name);
    detail.innerHTML = `<h3>${esc(s.name)}</h3><p class="stack-cap">${esc(s.caption)}</p>` +
      (ps.length ? `<p class="stack-sub">Appears in</p><div class="project-tags">${ps.map(p => `<button type="button" class="chip-btn" data-open="${esc(p.id)}">${esc(p.name)}</button>`).join('')}</div>` : '');
    grid.querySelectorAll('.stack-item').forEach(b => b.classList.toggle('active', b.dataset.n === s.name));
  }
  window.CYMOR_STACK_P.then(list => {
    grid.innerHTML = list.map(s => `<button type="button" class="stack-item glass tilt" data-n="${esc(s.name)}"><b>${esc(s.name)}</b><span>${esc(s.caption)}</span></button>`).join('');
    grid.querySelectorAll('.stack-item').forEach((b, i) => {
      const s = list[i]; ['mouseenter', 'focus', 'click'].forEach(ev => b.addEventListener(ev, () => show(s)));
    });
    detail.innerHTML = `<p class="stack-cap">Hover or tap a technology.</p>`;
  });
})();

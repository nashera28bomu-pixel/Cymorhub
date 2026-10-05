/* Renders data/services.json. Fields: icon, name, description, points[] (optional "what you get" lines). */
function serviceCardHTML(s, i){
  return `
    <article class="service-card glass tilt rv" data-rv="${['left', 'up', 'right'][i % 3]}" style="--d:${(i % 4) * 70}ms">
      <span class="service-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="service-icon">${esc(s.icon)}</div>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.description)}</p>
      ${(s.points || []).length ? `<ul class="service-points">${s.points.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    </article>`;
}
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('services-grid'); if(!grid) return;
  fetch('data/services.json').then(r => { if(!r.ok) throw 0; return r.json(); })
    .then(data => { grid.innerHTML = data.map((s, i) => serviceCardHTML(s, i)).join(''); document.dispatchEvent(new CustomEvent('cymor:rv-refresh')); })
    .catch(() => { grid.innerHTML = `<div class="empty-state">Couldn't load services right now. Check data/services.json.</div>`; });
});

/*
  Renders data/projects.json into the FEATURED cards and the gallery.
  Fields: id, name, icon, shortDescription, description, features[], category, status, version, url
  Optional: featured (bool), tags[] (e.g. "ai","pwa"), tech[], githubUrl, thumb ("assets/projects/<id>.webp")
  No thumb? A generated preview card (icon + name) is shown — never stock imagery.
*/
window.CYMOR_PROJECTS = [];

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function hue(id){ let h = 0; for(const c of id) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }

function buildTags(p){
  const tags = [];
  if(p.category) tags.push(p.category.charAt(0).toUpperCase() + p.category.slice(1));
  (p.tags || []).forEach(t => tags.push(t.length <= 3 ? t.toUpperCase() : t.charAt(0).toUpperCase() + t.slice(1)));
  (p.tech || []).forEach(t => tags.push(t));
  if(p.version) tags.push(p.version);
  return tags;
}
function thumbHTML(p){
  const src = p.thumb || `assets/projects/${p.id}.jpg`;
const img = `<img src="${esc(src)}" alt="${esc(p.name)} preview" loading="lazy">`;
  return `<div class="thumb-art" style="--h:${hue(p.id)}"><span class="ta-icon" aria-hidden="true">${esc(p.icon || '🚀')}</span><b>${esc(p.name)}</b></div>${img}`;
}
function badge(p){ return `<span class="status-badge ${esc((p.status || '').toLowerCase())}"><span class="dot"></span>${esc(p.status || '')}</span>`; }

function projectCardHTML(p){
  return `
    <article class="project-card tilt card-in" data-id="${esc(p.id)}" data-category="${esc(p.category)}" tabindex="0" role="button" aria-label="View details for ${esc(p.name)}">
      <div class="project-thumb">${thumbHTML(p)}${badge(p)}</div>
      <div class="project-body">
        <h3>${esc(p.name)}</h3>
        <p class="desc">${esc(p.shortDescription)}</p>
        <div class="project-tags">${buildTags(p).map(t => `<span>${esc(t)}</span>`).join('')}</div>
        <span class="project-link">View details <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </div>
    </article>`;
}
function featuredCardHTML(p, i){
  return `
    <article class="fcard tilt glass-strong${i === 0 ? ' fcard-lead' : ''}" data-id="${esc(p.id)}">
      <div class="fthumb project-thumb">${thumbHTML(p)}${badge(p)}</div>
      <div class="fbody">
        <span class="fcat">${esc((p.category || '').toUpperCase())}${(p.tags || []).map(t => ' / ' + esc(t.toUpperCase())).join('')}</span>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.shortDescription)}</p>
        <div class="project-tags">${(p.tech || []).concat(p.version ? [p.version] : []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
        <div class="fcta">
          ${p.url ? `<a class="btn-primary" href="${esc(p.url)}" target="_blank" rel="noopener">Live demo →</a>` : ''}
          <button class="btn-ghost" type="button" data-open="${esc(p.id)}">Details</button>
          ${p.githubUrl ? `<a class="btn-ghost" href="${esc(p.githubUrl)}" target="_blank" rel="noopener">Source →</a>` : ''}
        </div>
      </div>
    </article>`;
}
function wireImages(root){
  root.querySelectorAll('.thumb-art + img').forEach(img => img.addEventListener('error', () => img.remove(), {once:true}));
}
function renderProjects(list){
  const grid = document.getElementById('projects-grid'); if(!grid) return;
  if(!list.length){ grid.innerHTML = `<div class="empty-state">No projects match that search. Try another term.</div>`; return; }
  grid.innerHTML = list.map(projectCardHTML).join('');
  wireImages(grid);
}
function renderFeatured(data){
  const el = document.getElementById('featured-grid'); if(!el) return;
  const list = data.filter(p => p.featured);
  el.innerHTML = list.map(featuredCardHTML).join(''); wireImages(el);
  el.closest('.featured-wrap').hidden = !list.length;
}

function initInteractions(){
  const open = id => window.openProjectModal(id);
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-open]'); if(btn){ open(btn.dataset.open); return; }
    const card = e.target.closest('.project-card'); if(card) open(card.dataset.id);
    const f = e.target.closest('.fcard'); if(f && !e.target.closest('a, button')) open(f.dataset.id);
  });
  document.addEventListener('keydown', e => {
    const card = e.target.closest && e.target.closest('.project-card');
    if(card && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); open(card.dataset.id); }
  });
  // 3D tilt + cursor glow (desktop only)
  if(!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let raf = 0;
  document.addEventListener('pointermove', e => {
    const t = e.target.closest && e.target.closest('.tilt'); if(!t) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      t.style.setProperty('--mx', x * 100 + '%'); t.style.setProperty('--my', y * 100 + '%');
      t.style.setProperty('--ry', (x - .5) * 7 + 'deg'); t.style.setProperty('--rx', (.5 - y) * 7 + 'deg'); t.style.setProperty('--lift', '-6px');
    });
  }, {passive:true});
  document.addEventListener('pointerout', e => {
    const t = e.target.closest && e.target.closest('.tilt'); if(!t || t.contains(e.relatedTarget)) return;
    ['--rx', '--ry', '--lift'].forEach(k => t.style.removeProperty(k));
  });
}

function loadProjects(){
  const grid = document.getElementById('projects-grid');
  if(grid) grid.innerHTML = `<div class="empty-state">Loading projects…</div>`;
  fetch('data/projects.json')
    .then(res => { if(!res.ok) throw new Error('Failed to load projects.json'); return res.json(); })
    .then(data => {
      window.CYMOR_PROJECTS = data;
      renderFeatured(data); renderProjects(data);
      const n = data.length, stat = document.getElementById('stat-projects');
      if(stat) stat.dataset.target = n;
      document.querySelectorAll('[data-project-count]').forEach(el => el.textContent = n);
      document.dispatchEvent(new CustomEvent('cymor:projects-ready', {detail:data}));
    })
    .catch(err => { console.error(err); if(grid) grid.innerHTML = `<div class="empty-state">Couldn't load projects right now. Check data/projects.json.</div>`; });
}
document.addEventListener('DOMContentLoaded', () => { initInteractions(); loadProjects(); });

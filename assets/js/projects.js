/*
  Pulls from /data/projects.json — no hardcoded project data here anymore.
  Expected fields per project: id, name, icon, shortDescription, description,
  features[], category, status, version, url
  Optional field you can add later: "thumb": "assets/img/projects/your-file.jpg"
  If a project has a thumb, its screenshot is used. If not, the emoji icon shows instead.
*/

window.CYMOR_PROJECTS = [];

function buildTags(p){
  const tags = [];
  if(p.category) tags.push(p.category.charAt(0).toUpperCase() + p.category.slice(1));
  if(p.version) tags.push(p.version);
  return tags;
}

function projectCardHTML(p){
  const statusClass = (p.status || '').toLowerCase();
  const thumbInner = p.thumb
    ? `<img src="${p.thumb}" alt="${p.name} screenshot" loading="lazy">`
    : `<span class="thumb-fallback">${p.icon || '🚀'}</span>`;
  return `
    <article class="project-card card-in" data-id="${p.id}" data-category="${p.category}" tabindex="0" role="button" aria-label="View details for ${p.name}">
      <div class="project-thumb">
        ${thumbInner}
        <span class="status-badge ${statusClass}"><span class="dot"></span>${p.status || ''}</span>
      </div>
      <div class="project-body">
        <h3>${p.name}</h3>
        <p class="desc">${p.shortDescription || ''}</p>
        <div class="project-tags">${buildTags(p).map(t => `<span>${t}</span>`).join('')}</div>
        <span class="project-link">View details
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
      </div>
    </article>`;
}

function renderProjects(list){
  const grid = document.getElementById('projects-grid');
  if(!grid) return;
  if(!list.length){
    grid.innerHTML = `<div class="empty-state">No projects match that search. Try another term.</div>`;
    return;
  }
  grid.innerHTML = list.map(projectCardHTML).join('');
  grid.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => window.openProjectModal(card.dataset.id));
    card.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); window.openProjectModal(card.dataset.id); }
    });
  });
}

function loadProjects(){
  const grid = document.getElementById('projects-grid');
  if(grid) grid.innerHTML = `<div class="empty-state">Loading projects…</div>`;

  fetch('data/projects.json')
    .then(res => {
      if(!res.ok) throw new Error('Failed to load projects.json');
      return res.json();
    })
    .then(data => {
      window.CYMOR_PROJECTS = data;
      renderProjects(data);
      document.dispatchEvent(new CustomEvent('cymor:projects-ready', { detail: data }));
    })
    .catch(err => {
      console.error(err);
      if(grid) grid.innerHTML = `<div class="empty-state">Couldn't load projects right now. Check data/projects.json.</div>`;
    });
}

document.addEventListener('DOMContentLoaded', loadProjects);

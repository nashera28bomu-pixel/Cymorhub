/*
  Pulls from /data/services.json.
  Expected fields per service: icon, name, description
*/

function serviceCardHTML(s){
  return `
    <div class="service-card reveal-child">
      <div class="service-icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <p>${s.description}</p>
    </div>`;
}

function loadServices(){
  const grid = document.getElementById('services-grid');
  if(!grid) return;
  grid.classList.add('reveal-group');

  fetch('data/services.json')
    .then(res => {
      if(!res.ok) throw new Error('Failed to load services.json');
      return res.json();
    })
    .then(data => {
      grid.innerHTML = data.map(serviceCardHTML).join('');
    })
    .catch(err => {
      console.error(err);
      grid.innerHTML = `<div class="empty-state">Couldn't load services right now. Check data/services.json.</div>`;
    });
}

document.addEventListener('DOMContentLoaded', loadServices);

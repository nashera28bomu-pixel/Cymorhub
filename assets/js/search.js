(function(){
  let activeFilter = 'all';
  let query = '';

  function applyFilters(){
    const source = window.CYMOR_PROJECTS || [];
    const list = source.filter(p => {
      const matchesFilter = activeFilter === 'all' || p.category === activeFilter || (p.tags || []).includes(activeFilter);
      const q = query.trim().toLowerCase();
      const matchesQuery = !q ||
        p.name.toLowerCase().includes(q) ||
        (p.shortDescription || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.tech || []).join(' ').toLowerCase().includes(q) ||
        (p.tags || []).join(' ').toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
    renderProjects(list);
  }

  document.addEventListener('cymor:projects-ready', e => {
    document.querySelectorAll('.filter-chip').forEach(chip => {
      const f = chip.dataset.filter;
      chip.hidden = f !== 'all' && !e.detail.some(p => p.category === f || (p.tags || []).includes(f));
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.dataset.filter;
        applyFilters();
      });
    });

    const search = document.getElementById('project-search');
    if(search){
      let debounce;
      search.addEventListener('input', e => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          query = e.target.value;
          applyFilters();
        }, 150);
      });
    }
  });
})();

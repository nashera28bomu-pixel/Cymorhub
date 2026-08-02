(function(){
  let activeFilter = 'all';
  let query = '';

  function applyFilters(){
    const source = window.CYMOR_PROJECTS || [];
    const list = source.filter(p => {
      const matchesFilter = activeFilter === 'all' || p.category === activeFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q ||
        p.name.toLowerCase().includes(q) ||
        (p.shortDescription || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
    renderProjects(list);
  }

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

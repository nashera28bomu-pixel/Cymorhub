/* projects.js — loads data/projects.json (no hardcoding, per the brief)
   and renders the project grid. Exposes a small shared state object on
   window so search.js and the filter chips can both drive rendering
   without needing a module system. */

window.CymorProjects = {
  all: [],
  currentFilter: "all",
  currentQuery: ""
};

async function loadProjects() {
  try {
    const res = await fetch("data/projects.json");
    window.CymorProjects.all = await res.json();
  } catch (err) {
    console.error("Could not load projects.json — is this running over http(s), not file://?", err);
    window.CymorProjects.all = [];
  }
  renderProjects();
  renderOrbitStats();
}

function renderProjects() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  const { all, currentFilter, currentQuery } = window.CymorProjects;

  const query = currentQuery.trim().toLowerCase();
  const visible = all.filter((p) => {
    const matchesCategory = currentFilter === "all" || p.category === currentFilter;
    const matchesQuery =
      query === "" ||
      p.name.toLowerCase().includes(query) ||
      p.shortDescription.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  grid.innerHTML = "";

  if (visible.length === 0) {
    grid.innerHTML = `<div class="no-results">No projects match that search yet — more coming soon.</div>`;
    return;
  }

  visible.forEach((p) => {
    const card = document.createElement("div");
    card.className = "project-card fade-in-up";
    card.innerHTML = `
      <div class="project-top">
        <div class="project-icon">${p.icon}</div>
        <span class="status-badge ${p.url ? "live" : ""}"><span class="dot"></span>${p.status.toUpperCase()}</span>
      </div>
      <h3>${p.name}</h3>
      <p class="desc">${p.shortDescription}</p>
      <div class="tag-row">${(p.features || []).slice(0, 2).map((f) => `<span class="tech-tag">${f}</span>`).join("")}</div>
      <span class="card-cta">View details →</span>
    `;
    card.addEventListener("click", () => window.openProjectModal(p));
    grid.appendChild(card);
  });
}

function renderOrbitStats() {
  const el = document.getElementById("stat-projects");
  if (el) el.dataset.target = window.CymorProjects.all.length;
}

document.addEventListener("click", (e) => {
  const chip = e.target.closest(".filter-chip");
  if (!chip) return;
  document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  window.CymorProjects.currentFilter = chip.dataset.filter;
  renderProjects();
});

document.addEventListener("DOMContentLoaded", loadProjects);

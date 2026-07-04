/* modal.js — the project detail modal (logo, description, features,
   developer, status, version, Launch App). */

window.openProjectModal = function (project) {
  const overlay = document.getElementById("project-modal-overlay");
  const modal = document.getElementById("project-modal");
  if (!overlay || !modal) return;

  modal.innerHTML = `
    <button class="modal-close" id="modal-close-btn" aria-label="Close">✕</button>
    <div class="modal-icon">${project.icon}</div>
    <h3 class="modal-title">${project.name}</h3>
    <div class="modal-meta">
      <span class="status-badge ${project.url ? "live" : ""}"><span class="dot"></span>${project.status.toUpperCase()}</span>
      <span class="modal-version">${project.version}</span>
    </div>
    <p class="modal-description">${project.description}</p>
    <div class="modal-section-label">Features</div>
    <ul class="modal-features">
      ${(project.features || []).map((f) => `<li>${f}</li>`).join("")}
    </ul>
    <div class="modal-developer">
      <span>👨‍💻</span>
      <span>Developer: <strong>Legendary Smiley Cymor</strong></span>
    </div>
    ${
      project.url
        ? `<a class="btn-primary btn-block" href="${project.url}" target="_blank" rel="noopener">Launch App →</a>`
        : `<button class="btn-ghost btn-block" disabled style="opacity:0.5;cursor:not-allowed;">Coming Soon</button>`
    }
  `;

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";

  document.getElementById("modal-close-btn").addEventListener("click", closeProjectModal);
};

function closeProjectModal() {
  const overlay = document.getElementById("project-modal-overlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

document.addEventListener("click", (e) => {
  if (e.target.id === "project-modal-overlay") closeProjectModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeProjectModal();
});

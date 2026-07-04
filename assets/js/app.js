/* app.js — core hero mechanics: generates the orbiting tech-stack tabs
   (evenly spaced by trig rather than hand-placed) and the mobile nav
   toggle. Runs before animations.js so the tabs exist when the glow
   cycle starts. */

const ORBIT_TECHS = ["HTML", "CSS", "JS", "NODE", "PY"];

function buildOrbitTabs() {
  const stage = document.getElementById("orbit-stage");
  if (!stage) return;
  const radius = stage.clientWidth ? stage.clientWidth / 2 : 110;

  ORBIT_TECHS.forEach((label, i) => {
    const angle = (i / ORBIT_TECHS.length) * 2 * Math.PI - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const tab = document.createElement("div");
    tab.className = "orbit-tab";
    tab.textContent = label;
    tab.style.transform = `translate(${x}px, ${y}px)`;
    stage.appendChild(tab);
  });
}

function setupMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("mobile-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );
}

document.addEventListener("DOMContentLoaded", () => {
  buildOrbitTabs();
  setupMobileNav();
});
